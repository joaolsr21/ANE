import React, { useState } from 'react';
import { Skull, Lock, Mail, User as UserIcon, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: (email: string, pass: string) => Promise<any>;
  onSignUp: (email: string, pass: string, username: string) => Promise<any>;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
          // Autenticado automaticamente caso "Confirm email" esteja desativado no Supabase
        } else {
          setFeedback({
            type: 'success',
            text: 'Conta registrada! Caso a confirmação de e-mail esteja ativa no Supabase, verifique sua caixa de entrada ou tente entrar agora.',
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
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Efeito de iluminação atmosférica de fundo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(139, 30, 30, 0.28), rgba(93, 63, 211, 0.12) 45%, rgba(13, 13, 18, 1) 80%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Identidade ANE */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary-blood/20 border-2 border-primary-blood flex items-center justify-center mx-auto shadow-blood-glow">
            <Skull className="w-9 h-9 text-primary-blood" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider uppercase text-text-main">
            ANE <span className="text-primary-blood">//</span> A Noite Eterna
          </h1>
          <p className="text-xs font-mono text-muted-ash uppercase tracking-widest">
            Sistema de Controle de Campanhas, Sobreviventes & Ameaças
          </p>
        </div>

        {/* Cartão de Login / Cadastro */}
        <div className="bg-bg-card border border-muted-ash/20 rounded-2xl p-6 shadow-2xl space-y-5">
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
                ? 'Acessar Plataforma ANE'
                : 'Registrar e Entrar'}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-ash font-mono">
          <ShieldAlert className="w-4 h-4 text-warning-rust" />
          <span>Acesso restrito a usuários autenticados via Supabase</span>
        </div>
      </div>
    </div>
  );
};
