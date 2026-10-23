import React, { useState } from 'react';
import {
  Skull,
  Lock,
  Mail,
  User as UserIcon,
  AlertTriangle,
  ShieldAlert,
  Sun,
  Biohazard,
  HeartPulse,
  Dices,
  Brain,
  Backpack,
  LogIn,
  UserPlus,
  X,
  Compass,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AuthScreenProps {
  onSignIn: (email: string, pass: string) => Promise<any>;
  onSignUp: (email: string, pass: string, username: string) => Promise<any>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openModalWithMode = (targetMode: 'login' | 'signup') => {
    setMode(targetMode);
    setFeedback(null);
    setAuthModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await onSignIn(email, password);
      } else {
        const res = await onSignUp(email, password, username);
        if (res?.session) {
          // Autenticado automaticamente
        } else {
          setFeedback({
            type: 'success',
            text: 'Conta registrada com sucesso! Caso a confirmação de e-mail esteja ativa, verifique sua caixa de entrada ou faça login abaixo.',
          });
          setMode('login');
        }
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Falha na autenticação. Verifique suas credenciais.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col relative overflow-x-hidden">
      {/* Iluminação Atmosférica de Fundo */}
      <div
        className="fixed inset-0 pointer-events-none opacity-35"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(139, 30, 30, 0.32), rgba(93, 63, 211, 0.16) 45%, rgba(13, 13, 18, 1) 85%)',
        }}
      />

      {/* TOPBAR PÚBLICA COM OPÇÃO DE LOGIN / CRIAR CONTA NO CANTO */}
      <header className="sticky top-0 z-30 bg-bg-card/85 backdrop-blur-md border-b border-muted-ash/15 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-blood/20 border border-primary-blood flex items-center justify-center shadow-blood-glow">
              <Skull className="w-6 h-6 text-primary-blood" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-wider uppercase text-sm sm:text-base text-text-main">
                ANE <span className="text-primary-blood">//</span> A Noite Eterna
              </h1>
              <span className="text-[11px] font-mono text-muted-ash flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary-uv animate-pulse" />
                SISTEMA OFICIAL DE RPG DE SOBREVIVÊNCIA & HORROR
              </span>
            </div>
          </div>

          {/* Botões no canto superior direito para Entrar / Criar Conta */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openModalWithMode('login')}
              className="px-4 py-2 rounded-xl bg-bg-main hover:bg-bg-main/80 border border-muted-ash/30 hover:border-secondary-uv text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4 text-secondary-uv" />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => openModalWithMode('signup')}
              className="px-4 py-2 rounded-xl bg-primary-blood hover:bg-primary-blood/90 text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2 shadow-blood-glow transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Criar Conta
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO DA ABA INICIAL (APRESENTAÇÃO DO RPG ANTES DO LOGIN) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12">
        {/* HERO SECTION */}
        <section className="bg-bg-card/90 border border-muted-ash/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-uv/20 border border-secondary-uv/50 text-xs font-mono uppercase tracking-widest text-text-main">
              <Sparkles className="w-3.5 h-3.5 text-secondary-uv" />
              Bem-vindo à Plataforma Oficial
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-main leading-tight">
              Quando o sol se põe, a humanidade deixa de estar no topo da cadeia alimentar.
            </h2>

            <p className="text-sm sm:text-base text-muted-ash leading-relaxed">
              <strong className="text-text-main">A Noite Eterna (ANE)</strong> é um RPG de mesa de sobrevivência brutal, terror psicológico e gestão tática de recursos em um mundo devastado por uma infecção implacável. Cada bala conta, cada ferimento no corpo deixa sequelas reais e a escuridão esconde predadores fotossensíveis que só a <strong className="text-secondary-uv">Luz Ultravioleta</strong> consegue deter.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openModalWithMode('signup')}
                className="px-6 py-3.5 rounded-xl bg-primary-blood hover:bg-primary-blood/90 text-text-main font-bold text-sm flex items-center gap-2 shadow-blood-glow transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Começar Agora — Criar Conta
              </button>
              <button
                type="button"
                onClick={() => openModalWithMode('login')}
                className="px-6 py-3.5 rounded-xl bg-bg-main hover:border-secondary-uv border border-muted-ash/30 text-text-main font-bold text-sm flex items-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4 text-secondary-uv" />
                Já tenho conta (Fazer Login)
              </button>
            </div>
          </div>
        </section>

        {/* PILARES DO UNIVERSO E MECÂNICAS DE A NOITE ETERNA */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-secondary-uv">
                CONHEÇA O SISTEMA
              </span>
              <h3 className="text-2xl font-extrabold text-text-main mt-1">
                Os Pilares de A Noite Eterna
              </h3>
            </div>
            <p className="text-xs font-mono text-muted-ash">
              Tudo integrado digitalmente para Mestres e Jogadores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Luz UV vs Escuridão */}
            <div className="bg-bg-card border border-secondary-uv/35 rounded-2xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-secondary-uv/20 border border-secondary-uv flex items-center justify-center">
                <Sun className="w-5 h-5 text-secondary-uv" />
              </div>
              <h4 className="text-base font-bold text-text-main">
                A Noite & A Luz Ultravioleta (UV)
              </h4>
              <p className="text-xs text-muted-ash leading-relaxed">
                Durante o dia, os infectados mais letais buscam abrigo nas sombras. À noite, <strong className="text-text-main">Voláteis, Notívagos e Espreitadores</strong> dominam as ruas. Lanternas e sinalizadores UV são a única barreira entre a vida e a morte.
              </p>
            </div>

            {/* Card 2: Corpo Padrão e Ferimentos Anatômicos */}
            <div className="bg-bg-card border border-primary-blood/40 rounded-2xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-primary-blood/20 border border-primary-blood flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-primary-blood" />
              </div>
              <h4 className="text-base font-bold text-text-main">
                Sistema Anatômico de Ferimentos
              </h4>
              <p className="text-xs text-muted-ash leading-relaxed">
                Golpes que atingem ou superam seu <strong className="text-text-main">Limite de Ferimento (LF)</strong> causam lesões localizadas na Cabeça, Torso, Braços ou Pernas, gerando sangramento contínuo (`1d4` a `1d8`) e exigindo cirurgia ou estancamento imediato.
              </p>
            </div>

            {/* Card 3: Infecção e Sanidade */}
            <div className="bg-bg-card border border-warning-rust/40 rounded-2xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-warning-rust/20 border border-warning-rust flex items-center justify-center">
                <Biohazard className="w-5 h-5 text-warning-rust" />
              </div>
              <h4 className="text-base font-bold text-text-main">
                Contágio Progressivo & Sanidade
              </h4>
              <p className="text-xs text-muted-ash leading-relaxed">
                Arranhões, contato com sangue contaminado e mordidas elevam sua porcentagem de <strong className="text-primary-blood">Infecção (0% a 100%)</strong> em 4 estágios de mutação, enquanto o horror consome sua <strong className="text-warning-rust">Sanidade (SAN)</strong>.
              </p>
            </div>

            {/* Card 4: Motor de Dados por Grau de Atributo */}
            <div className="bg-bg-card border border-muted-ash/20 rounded-2xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-bg-main border border-secondary-uv/50 flex items-center justify-center">
                <Dices className="w-5 h-5 text-secondary-uv" />
              </div>
              <h4 className="text-base font-bold text-text-main">
                Motor de Dados (FOR, AGI, INT, PRE, VIG)
              </h4>
              <p className="text-xs text-muted-ash leading-relaxed">
                Seus 5 atributos evoluem de 1 a 5 alterando os dados rolados: de <span className="font-mono text-text-main">1d20</span> (Nível 1) até <span className="font-mono text-secondary-uv">1d20 + 1d6/1d8/1d12</span> ou <span className="font-mono text-primary-blood">2d20</span> no ápice humano, somados às 28 Perícias Oficiais.
              </p>
            </div>

            {/* Card 5: Inventário Espacial e Sobrevivência */}
            <div className="bg-bg-card border border-muted-ash/20 rounded-2xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-bg-main border border-warning-rust/50 flex items-center justify-center">
                <Backpack className="w-5 h-5 text-warning-rust" />
              </div>
              <h4 className="text-base font-bold text-text-main">
                Mochila em Grade & Escassez
              </h4>
              <p className="text-xs text-muted-ash leading-relaxed">
                Organize armas, munições, curativos, comida e água em uma grade espacial (`8×1` até `8×6`) com rotação de itens em 90°, gerenciando fome, sede e fadiga.
              </p>
            </div>

            {/* Card 6: Campanhas, Escudo do Mestre & Chat */}
            <div className="bg-bg-card border border-muted-ash/20 rounded-2xl p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-bg-main border border-primary-blood/50 flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-blood" />
              </div>
              <h4 className="text-base font-bold text-text-main">
                Campanhas com Chat & Escudo do Mestre
              </h4>
              <p className="text-xs text-muted-ash leading-relaxed">
                Crie campanhas como Mestre ou entre como Player via código. Compartilhe rolagens de dados, habilidades e consumo de itens diretamente no chat da sessão!
              </p>
            </div>
          </div>
        </section>

        {/* RESUMO RÁPIDO PARA NOVOS JOGADORES */}
        <section className="bg-bg-card border border-muted-ash/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-lg font-bold text-text-main flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary-uv" />
              Pronto para criar seu Sobrevivente ou mestrar sua própria campanha?
            </h4>
            <p className="text-xs text-muted-ash leading-relaxed">
              Escolha entre as <strong className="text-text-main">35 Origens Oficiais</strong>, personalize a foto dos seus personagens e monstros, acompanhe o diagrama anatômico de ferimentos e jogue com seu grupo em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openModalWithMode('login')}
              className="px-5 py-2.5 rounded-xl bg-bg-main border border-muted-ash/30 hover:border-secondary-uv text-xs font-bold uppercase tracking-wider text-text-main"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => openModalWithMode('signup')}
              className="px-5 py-2.5 rounded-xl bg-primary-blood hover:bg-primary-blood/90 text-xs font-bold uppercase tracking-wider text-text-main shadow-blood-glow"
            >
              Criar Conta Gratuita
            </button>
          </div>
        </section>
      </main>

      {/* MODAL DE LOGIN / CADASTRO */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-bg-main/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-bg-card border border-muted-ash/30 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-muted-ash/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-blood/20 border border-primary-blood flex items-center justify-center">
                  <Skull className="w-5 h-5 text-primary-blood" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-main">
                    Acesso à Plataforma ANE
                  </h3>
                  <p className="text-[11px] font-mono text-muted-ash">
                    Entre ou registre sua conta de operador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-lg bg-bg-main text-muted-ash hover:text-text-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seletor de Modo */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-bg-main rounded-xl border border-muted-ash/15">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFeedback(null);
                }}
                className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-primary-blood text-text-main shadow-blood-glow'
                    : 'text-muted-ash hover:text-text-main'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setFeedback(null);
                }}
                className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-primary-blood text-text-main shadow-blood-glow'
                    : 'text-muted-ash hover:text-text-main'
                }`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-muted-ash mb-1.5">
                    Nome de Usuário / Codinome
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-muted-ash absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: Mestre_Corvo"
                      className="w-full bg-bg-main border border-muted-ash/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-ash mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-ash absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    className="w-full bg-bg-main border border-muted-ash/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-ash mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-ash absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (Mín. 6 caracteres)"
                    className="w-full bg-bg-main border border-muted-ash/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
                  />
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    feedback.type === 'error'
                      ? 'bg-primary-blood/20 border-primary-blood text-text-main'
                      : 'bg-secondary-uv/20 border-secondary-uv text-text-main'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning-rust" />
                  <span>{feedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main font-bold text-sm transition-all shadow-blood-glow disabled:opacity-50"
              >
                {submitting
                  ? 'Autenticando...'
                  : mode === 'login'
                  ? 'Entrar na Plataforma'
                  : 'Registrar e Entrar'}
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-ash font-mono pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-warning-rust" />
              <span>Autenticação protegida via Supabase</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
