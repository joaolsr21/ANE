-- ============================================================================
-- A NOITE ETERNA - VTT SUPABASE DATABASE SCHEMA (FASE 1 & BASE FASE 2)
-- ============================================================================

-- Habilitar extensão para geração de UUIDs e códigos aleatórios
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABELA: profiles
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger para criar perfil automaticamente após cadastro no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. TABELA: campaigns & campaign_members
-- ============================================================================
CREATE TABLE public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  master_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(encode(gen_random_bytes(4), 'hex') from 1 for 6)),
  active_map_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.campaign_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('master', 'player')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(campaign_id, user_id)
);

-- Trigger para inserir o criador da campanha como 'master' em campaign_members
CREATE OR REPLACE FUNCTION public.handle_new_campaign()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.campaign_members (campaign_id, user_id, role)
  VALUES (NEW.id, NEW.master_id, 'master');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_campaign_created ON public.campaigns;
CREATE TRIGGER on_campaign_created
  AFTER INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_campaign();

-- Função RPC segura para ingressar em campanha via código de convite
CREATE OR REPLACE FUNCTION public.join_campaign_by_code(code TEXT)
RETURNS UUID AS $$
DECLARE
  v_campaign_id UUID;
BEGIN
  SELECT id INTO v_campaign_id
  FROM public.campaigns
  WHERE invite_code = upper(trim(code));

  IF v_campaign_id IS NULL THEN
    RAISE EXCEPTION 'Campanha não encontrada para o código informado.';
  END IF;

  INSERT INTO public.campaign_members (campaign_id, user_id, role)
  VALUES (v_campaign_id, auth.uid(), 'player')
  ON CONFLICT (campaign_id, user_id) DO NOTHING;

  RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. TABELA: characters (Estrutura pronta para Fase 1 e Fase 2)
-- ============================================================================
CREATE TABLE public.characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  archetype TEXT DEFAULT 'Sobrevivente',
  avatar_url TEXT,
  is_npc BOOLEAN DEFAULT FALSE NOT NULL,

  -- Atributos Base (1 a 5)
  attr_for INTEGER DEFAULT 1 NOT NULL CHECK (attr_for BETWEEN 1 AND 5),
  attr_agi INTEGER DEFAULT 1 NOT NULL CHECK (attr_agi BETWEEN 1 AND 5),
  attr_int INTEGER DEFAULT 1 NOT NULL CHECK (attr_int BETWEEN 1 AND 5),
  attr_pre INTEGER DEFAULT 1 NOT NULL CHECK (attr_pre BETWEEN 1 AND 5),
  attr_vig INTEGER DEFAULT 1 NOT NULL CHECK (attr_vig BETWEEN 1 AND 5),

  -- Estatísticas Derivadas e Sobrevivência
  pv_current INTEGER DEFAULT 10 NOT NULL,
  pv_max INTEGER DEFAULT 10 NOT NULL,
  san_current INTEGER DEFAULT 20 NOT NULL,
  san_max INTEGER DEFAULT 20 NOT NULL,
  wound_threshold INTEGER DEFAULT 5 NOT NULL, -- Limite de Ferimento (LF)
  defense INTEGER DEFAULT 10 NOT NULL,        -- Defesa (DEF)
  initiative INTEGER DEFAULT 0 NOT NULL,      -- Iniciativa (INI)
  infection_level INTEGER DEFAULT 0 NOT NULL CHECK (infection_level BETWEEN 0 AND 100), -- Nível de Infecção (%)

  -- Sobrevivência: Porções e Fadiga
  food_portions INTEGER DEFAULT 2 NOT NULL,
  water_portions INTEGER DEFAULT 2 NOT NULL,
  fatigue INTEGER DEFAULT 0 NOT NULL,

  -- Perícias (Graus: 0 = Destreinado (+0), 1 = Treinado (+2), 2 = Especialista (+5))
  skills JSONB DEFAULT '{
    "Medicina": 0,
    "Furtividade": 0,
    "Pontaria": 0,
    "Luta": 0,
    "Sobrevivencia": 0,
    "Investigacao": 0,
    "Percepcao": 0,
    "Vontade": 0,
    "Atletismo": 0,
    "Tecnologia": 0
  }'::jsonb NOT NULL,

  -- Inventário estruturado em JSONB
  inventory JSONB DEFAULT '[]'::jsonb NOT NULL,

  -- Posição do Token no VTT (Fase 3)
  token_x NUMERIC DEFAULT 100 NOT NULL,
  token_y NUMERIC DEFAULT 100 NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & FUNÇÕES AUXILIARES DE RBAC
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Helpers SECURITY DEFINER para evitar recursão infinita nas políticas RLS
CREATE OR REPLACE FUNCTION public.is_campaign_master(c_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = c_id AND master_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_campaign_member(c_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_members
    WHERE campaign_id = c_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Políticas: profiles
CREATE POLICY "Perfis visíveis para usuários autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas: campaigns
CREATE POLICY "Membros e Mestre podem visualizar a campanha"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (master_id = auth.uid() OR public.is_campaign_member(id));

CREATE POLICY "Usuários autenticados podem criar campanhas"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (master_id = auth.uid());

CREATE POLICY "Apenas o Mestre pode atualizar a campanha"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (master_id = auth.uid())
  WITH CHECK (master_id = auth.uid());

CREATE POLICY "Apenas o Mestre pode excluir a campanha"
  ON public.campaigns FOR DELETE
  TO authenticated
  USING (master_id = auth.uid());

-- Políticas: campaign_members
CREATE POLICY "Membros veem participantes da mesma campanha"
  ON public.campaign_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_campaign_member(campaign_id) OR public.is_campaign_master(campaign_id));

CREATE POLICY "Usuários podem ingressar como jogadores"
  ON public.campaign_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'player');

CREATE POLICY "Mestre ou o próprio jogador podem remover participação"
  ON public.campaign_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_campaign_master(campaign_id));

-- Políticas: characters (RBAC estrito entre Mestre e Jogador)
CREATE POLICY "Visualizar própria ficha ou fichas da mesma campanha"
  ON public.characters FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (campaign_id IS NOT NULL AND (public.is_campaign_member(campaign_id) OR public.is_campaign_master(campaign_id)))
  );

CREATE POLICY "Criar própria ficha ou Mestre criar NPCs na campanha"
  ON public.characters FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id))
  );

CREATE POLICY "Jogador edita apenas sua ficha; Mestre tem acesso total na campanha"
  ON public.characters FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id))
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id))
  );

CREATE POLICY "Jogador exclui apenas sua ficha; Mestre pode excluir na campanha"
  ON public.characters FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id))
  );
