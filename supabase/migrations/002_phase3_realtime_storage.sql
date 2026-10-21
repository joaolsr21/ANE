-- ============================================================================
-- ANE (A NOITE ETERNA) - FASE 3: REALTIME CHAT, COMBAT TRACKER & MAP STORAGE
-- ============================================================================

-- 1. Tabela de Mensagens e Rolagens em Tempo Real (Sincronizada via Supabase Realtime)
CREATE TABLE IF NOT EXISTS public.campaign_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'roll', 'alert')),
  content TEXT NOT NULL,
  roll_payload JSONB, -- Armazena DiceRollResult completo quando message_type = 'roll'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Tabela do Tracker de Combate (Iniciativa de Personagens e NPCs)
CREATE TABLE IF NOT EXISTS public.combat_combatants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_npc BOOLEAN DEFAULT FALSE NOT NULL,
  initiative_total INTEGER DEFAULT 10 NOT NULL,
  pv_current INTEGER DEFAULT 10 NOT NULL,
  pv_max INTEGER DEFAULT 10 NOT NULL,
  infection_level INTEGER DEFAULT 0 NOT NULL,
  is_active_turn BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_combatants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: campaign_messages
CREATE POLICY "Membros da campanha podem ler mensagens e rolagens"
  ON public.campaign_messages FOR SELECT TO authenticated
  USING (public.is_campaign_member(campaign_id) OR public.is_campaign_master(campaign_id));

CREATE POLICY "Membros da campanha podem enviar mensagens e rolagens"
  ON public.campaign_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_campaign_member(campaign_id) OR public.is_campaign_master(campaign_id));

-- Políticas RLS: combat_combatants
CREATE POLICY "Membros da campanha visualizam o Tracker de Combate"
  ON public.combat_combatants FOR SELECT TO authenticated
  USING (public.is_campaign_member(campaign_id) OR public.is_campaign_master(campaign_id));

CREATE POLICY "Mestre gerencia combatentes ou Jogador insere sua própria iniciativa"
  ON public.combat_combatants FOR ALL TO authenticated
  USING (public.is_campaign_master(campaign_id) OR public.is_campaign_member(campaign_id))
  WITH CHECK (public.is_campaign_master(campaign_id) OR public.is_campaign_member(campaign_id));

-- 3. Bucket do Supabase Storage para Mapas Táticos (vtt-maps)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vtt-maps', 'vtt-maps', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Mapas públicos para leitura no VTT"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vtt-maps');

CREATE POLICY "Mestres autenticados podem fazer upload de mapas"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vtt-maps');

-- 4. Publicação no Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.combat_combatants;
