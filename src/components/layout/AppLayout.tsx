import React from 'react';
import {
  Skull,
  ShieldAlert,
  Users,
  Radio,
  LogOut,
  Compass,
  Activity,
  Dices,
  FolderKanban,
} from 'lucide-react';
import { Profile } from '../../types/database';

export type ANETab = 'resumo' | 'campanhas' | 'fichas' | 'dados';

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

  const navItems: Array<{ id: ANETab; label: string; shortLabel: string; icon: any; isUv?: boolean }> = [
    { id: 'resumo', label: 'Resumo', shortLabel: 'Resumo', icon: Compass },
    { id: 'campanhas', label: 'Campanhas', shortLabel: 'Campanhas', icon: FolderKanban },
    { id: 'fichas', label: 'Personagens', shortLabel: 'Personagens', icon: Users },
    { id: 'dados', label: 'Rolador de Dados', shortLabel: 'Dados', icon: Dices, isUv: true },
  ];

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar Lateral — Visível apenas em Desktop/Tablet (md+) */}
      <aside className="hidden md:flex md:w-64 bg-bg-card border-r border-muted-ash/15 flex-col justify-between shrink-0 sticky top-0 h-screen">
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
                  RPG DE SOBREVIVÊNCIA
                </span>
              </div>
            </div>
          </div>

          {/* Menu de Navegação Principal: 4 Abas Dedicadas */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? item.isUv
                        ? 'bg-secondary-uv text-text-main shadow-uv-glow'
                        : 'bg-primary-blood text-text-main shadow-blood-glow'
                      : 'text-muted-ash hover:bg-bg-main/60 hover:text-text-main'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Indicador de Permissão */}
          <div className="mx-3 mt-4 p-3.5 rounded-lg bg-bg-main/80 border border-warning-rust/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-warning-rust font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Controle de Acesso
              </span>
              <span className="font-mono text-[11px] text-muted-ash">RLS ATIVO</span>
            </div>
            <p className="text-xs text-muted-ash leading-relaxed">
              Abra uma campanha na aba Campanhas para acessar o Escudo do Mestre (se for o Mestre) ou a Área do Jogador.
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
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Topbar de Status (Adaptada para Celular e Desktop) */}
        <header className="h-14 md:h-16 bg-bg-card/90 backdrop-blur-md border-b border-muted-ash/15 px-3.5 md:px-6 flex items-center justify-between sticky top-0 z-30">
          {/* No celular mostra a logo ANE compacta; no desktop mostra o status */}
          <div className="flex items-center gap-2.5">
            <div className="flex md:hidden w-8 h-8 rounded-lg bg-primary-blood/20 border border-primary-blood items-center justify-center">
              <Skull className="w-4 h-4 text-primary-blood" />
            </div>
            <div className="md:hidden">
              <span className="font-extrabold tracking-wider uppercase text-xs text-text-main block">
                ANE <span className="text-primary-blood">//</span> A Noite Eterna
              </span>
              <span className="text-[10px] font-mono text-muted-ash truncate block max-w-[140px]">
                {displayName}
              </span>
            </div>

            <span className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-ash">
              <Radio className="w-4 h-4 text-secondary-uv" />
              Sistema ANE: <strong className="text-text-main">Operacional</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2.5 text-xs font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-blood/20 border border-primary-blood/50 text-text-main">
                <Activity className="w-3.5 h-3.5 text-primary-blood" />
                Infecção / PV
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-warning-rust/20 border border-warning-rust/50 text-text-main">
                SAN / Fome / Sede
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-uv/20 border border-secondary-uv/50 text-text-main">
                Dados & Testes
              </span>
            </div>

            {/* Botão Sair visível no topo em telas mobile */}
            <button
              onClick={onSignOut}
              title="Sair da Conta"
              className="md:hidden px-2.5 py-1.5 rounded-lg bg-bg-main border border-muted-ash/25 text-muted-ash hover:text-primary-blood flex items-center gap-1 text-xs font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Conteúdo Dinâmico com padding otimizado para celular */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA PARA CELULAR (Mobile Bottom Tab Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-lg border-t border-muted-ash/25 px-2 py-1.5 grid grid-cols-4 gap-1 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onTabChange(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? item.isUv
                    ? 'bg-secondary-uv text-text-main shadow-uv-glow'
                    : 'bg-primary-blood text-text-main shadow-blood-glow'
                  : 'text-muted-ash hover:text-text-main'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-bold tracking-tight truncate max-w-full">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
