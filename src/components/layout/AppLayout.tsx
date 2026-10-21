import React from 'react';
import {
  Skull,
  ShieldAlert,
  Users,
  Radio,
  LogOut,
  Crown,
  Compass,
  Activity,
} from 'lucide-react';
import { Profile } from '../../types/database';

export type ANETab = 'dashboard' | 'characters' | 'master-control';

interface AppLayoutProps {
  children: React.ReactNode;
  profile: Profile | null;
  userEmail?: string;
  activeTab: ANETab;
  onTabChange: (tab: ANETab) => void;
  onSignOut: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  profile,
  userEmail,
  activeTab,
  onTabChange,
  onSignOut,
}) => {
  const displayName = profile?.username || userEmail?.split('@')[0] || 'Operador';

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col md:flex-row">
      {/* Sidebar Lateral (Asfalto Úmido #1A1A24) */}
      <aside className="w-full md:w-64 bg-bg-card border-b md:border-b-0 md:border-r border-muted-ash/15 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-muted-ash/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-blood/20 border border-primary-blood flex items-center justify-center shadow-blood-glow">
                <Skull className="w-6 h-6 text-primary-blood" />
              </div>
              <div>
                <h1 className="font-bold tracking-wider uppercase text-sm text-text-main">
                  ANE <span className="text-muted-ash font-normal">// A Noite Eterna</span>
                </h1>
                <span className="text-[11px] font-mono text-muted-ash flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary-uv animate-pulse" />
                  SISTEMA DE FICHAS & DADOS
                </span>
              </div>
            </div>
          </div>

          {/* Menu de Navegação Principal */}
          <nav className="p-3 space-y-1.5">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-primary-blood text-text-main shadow-blood-glow'
                  : 'text-muted-ash hover:bg-bg-main/60 hover:text-text-main'
              }`}
            >
              <Compass className="w-4 h-4" />
              Campanhas & Resumo
            </button>

            <button
              onClick={() => onTabChange('characters')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'characters'
                  ? 'bg-primary-blood text-text-main shadow-blood-glow'
                  : 'text-muted-ash hover:bg-bg-main/60 hover:text-text-main'
              }`}
            >
              <Users className="w-4 h-4" />
              Fichas & Rolador de Dados
            </button>

            <button
              onClick={() => onTabChange('master-control')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'master-control'
                  ? 'bg-secondary-uv text-text-main shadow-uv-glow'
                  : 'text-muted-ash hover:bg-bg-main/60 hover:text-text-main'
              }`}
            >
              <span className="flex items-center gap-3">
                <Crown className="w-4 h-4" />
                Escudo do Mestre & Monstros
              </span>
            </button>
          </nav>

          {/* Indicador de Permissão RBAC */}
          <div className="mx-3 mt-4 p-3.5 rounded-lg bg-bg-main/80 border border-warning-rust/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-warning-rust font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Controle de Acesso
              </span>
              <span className="font-mono text-[11px] text-muted-ash">RLS ATIVO</span>
            </div>
            <p className="text-xs text-muted-ash leading-relaxed">
              O Mestre tem controle total sobre campanhas, fichas de jogadores, monstros e rolagens.
            </p>
          </div>
        </div>

        {/* Rodapé da Sidebar: Usuário Autenticado */}
        <div className="p-4 border-t border-muted-ash/15 bg-bg-main/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-secondary-uv/20 border border-secondary-uv flex items-center justify-center text-xs font-bold uppercase text-text-main shrink-0">
                {displayName.slice(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-text-main truncate">{displayName}</p>
                <p className="text-[11px] text-muted-ash truncate">{userEmail || 'Autenticado'}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              title="Sair da Conta"
              className="p-2 rounded-lg text-muted-ash hover:text-primary-blood hover:bg-bg-card transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar de Status */}
        <header className="h-16 bg-bg-card/80 backdrop-blur-md border-b border-muted-ash/15 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-ash">
              <Radio className="w-4 h-4 text-secondary-uv" />
              Terminal ANE: <strong className="text-text-main">Operacional</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-blood/20 border border-primary-blood/50 text-text-main">
                <Activity className="w-3.5 h-3.5 text-primary-blood" />
                Infecção / PV / Monstros
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-warning-rust/20 border border-warning-rust/50 text-text-main">
                SAN / Fome / Sede
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-uv/20 border border-secondary-uv/50 text-text-main">
                Dados UV
              </span>
            </div>
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
