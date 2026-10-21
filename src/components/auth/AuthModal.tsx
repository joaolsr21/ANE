import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, pass: string) => Promise<any>;
  onSignUp: (email: string, pass: string, username: string) => Promise<any>;
  isSupabaseConfigured: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
  isSupabaseConfigured,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!isSupabaseConfigured) {
      setFeedback(
        'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para autenticar no Supabase real.'
      );
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await onSignIn(email, password);
        onClose();
      } else {
        await onSignUp(email, password, username);
        setFeedback('Registro concluído! Verifique seu e-mail ou faça login.');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Falha na autenticação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg-main/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-card border border-muted-ash/25 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-ash hover:text-text-main p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-secondary-uv">
            Credencial de Sobrevivente // Supabase Auth
          </span>
          <h2 className="text-xl font-bold text-text-main mt-1">
            {mode === 'login' ? 'Acessar Abrigo Subterrâneo' : 'Registrar Novo Sobrevivente'}
          </h2>
        </div>

        {/* Seletor Login / Cadastro */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-bg-main rounded-lg mb-5 border border-muted-ash/15">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              mode === 'login'
                ? 'bg-primary-blood text-text-main'
                : 'text-muted-ash hover:text-text-main'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${
              mode === 'signup'
                ? 'bg-primary-blood text-text-main'
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
                Codinome / Nome de Usuário
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-muted-ash absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: Corvo_Noturno"
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
                placeholder="sobrevivente@noiteeterna.rpg"
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
                placeholder="••••••••"
                className="w-full bg-bg-main border border-muted-ash/30 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
              />
            </div>
          </div>

          {feedback && (
            <div className="p-3 rounded-lg bg-warning-rust/20 border border-warning-rust text-xs text-text-main flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-rust shrink-0 mt-0.5" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main font-semibold text-sm transition-all shadow-blood-glow disabled:opacity-50"
          >
            {submitting
              ? 'Processando...'
              : mode === 'login'
              ? 'Autenticar Credenciais'
              : 'Registrar na Base'}
          </button>
        </form>
      </div>
    </div>
  );
};
