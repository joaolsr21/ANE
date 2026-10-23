import React from 'react';
import {
  Crown,
  Shield,
  Biohazard,
  Brain,
  Heart,
  Droplets,
  Utensils,
  UserPlus,
  FolderOpen,
  FolderKanban,
  Users,
  Dices,
} from 'lucide-react';
import { Campaign, Character } from '../../types/database';

interface DashboardViewProps {
  campaigns: Campaign[];
  characters: Character[];
  currentUserId: string;
  onGoToCampaigns: () => void;
  onGoToFichas: () => void;
  onGoToDados: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  campaigns,
  characters,
  currentUserId,
  onGoToCampaigns,
  onGoToFichas,
  onGoToDados,
}) => {
  const playerCharacters = characters.filter(
    (c) => !c.is_npc && c.user_id === currentUserId
  );

  const masterCount = campaigns.filter((c) => c.master_id === currentUserId).length;
  const playerCount = campaigns.length - masterCount;

  return (
    <div className="space-y-8">
      {/* Cabeçalho de Resumo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-bg-card border border-muted-ash/20 rounded-xl p-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-secondary-uv">
            ANE // Visão Geral do Sistema
          </span>
          <h2 className="text-2xl font-bold text-text-main mt-1">
            Resumo
          </h2>
          <p className="text-sm text-muted-ash mt-1 max-w-2xl">
            Acompanhe suas campanhas ativas, o estado vital dos seus sobreviventes e acesse rapidamente as ferramentas de jogo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGoToFichas}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-main border border-secondary-uv hover:bg-secondary-uv/20 text-text-main text-xs font-semibold transition-all"
          >
            <UserPlus className="w-4 h-4 text-secondary-uv" />
            Criação de Personagens
          </button>

          <button
            onClick={onGoToCampaigns}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-xs font-semibold transition-all shadow-blood-glow"
          >
            <FolderKanban className="w-4 h-4" />
            Gerenciar Campanhas
          </button>

          <button
            onClick={onGoToDados}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main text-xs font-semibold transition-all shadow-uv-glow"
          >
            <Dices className="w-4 h-4" />
            Rolador de Dados
          </button>
        </div>
      </div>

      {/* Cartões de Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={onGoToCampaigns}
          className="cursor-pointer bg-bg-card border border-muted-ash/20 hover:border-primary-blood/60 rounded-xl p-5 flex items-center justify-between transition-all"
        >
          <div>
            <span className="text-xs font-mono uppercase text-muted-ash">
              Campanhas como Mestre
            </span>
            <div className="text-3xl font-extrabold font-mono text-text-main mt-1">
              {masterCount}
            </div>
            <span className="text-[11px] text-primary-blood">
              Escudo do Mestre & Monstros →
            </span>
          </div>
          <Crown className="w-8 h-8 text-primary-blood opacity-80" />
        </div>

        <div
          onClick={onGoToCampaigns}
          className="cursor-pointer bg-bg-card border border-muted-ash/20 hover:border-secondary-uv/60 rounded-xl p-5 flex items-center justify-between transition-all"
        >
          <div>
            <span className="text-xs font-mono uppercase text-muted-ash">
              Campanhas como Player
            </span>
            <div className="text-3xl font-extrabold font-mono text-text-main mt-1">
              {playerCount}
            </div>
            <span className="text-[11px] text-secondary-uv">
              Acessar Área do Player →
            </span>
          </div>
          <Shield className="w-8 h-8 text-secondary-uv opacity-80" />
        </div>

        <div
          onClick={onGoToFichas}
          className="cursor-pointer bg-bg-card border border-muted-ash/20 hover:border-secondary-uv/60 rounded-xl p-5 flex items-center justify-between transition-all"
        >
          <div>
            <span className="text-xs font-mono uppercase text-muted-ash">
              Meus Personagens
            </span>
            <div className="text-3xl font-extrabold font-mono text-text-main mt-1">
              {playerCharacters.length}
            </div>
            <span className="text-[11px] text-secondary-uv">
              Ver Fichas & Inventário →
            </span>
          </div>
          <Users className="w-8 h-8 text-warning-rust opacity-80" />
        </div>
      </div>

      {/* Grid Principal de Resumo: Campanhas e Personagens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Campanhas (6 cols) */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-main tracking-wide flex items-center gap-2">
              Campanhas Recentes
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg-card border border-muted-ash/20 text-muted-ash">
                {campaigns.length}
              </span>
            </h3>
            <button
              onClick={onGoToCampaigns}
              className="text-xs text-secondary-uv font-semibold hover:underline"
            >
              Ver todas →
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-muted-ash/25 rounded-xl p-8 text-center space-y-2">
              <FolderOpen className="w-7 h-7 text-muted-ash mx-auto" />
              <div className="text-sm font-semibold text-text-main">
                Nenhuma campanha ativa
              </div>
              <p className="text-xs text-muted-ash">
                Vá até a aba <strong>Campanhas</strong> para criar uma campanha como Mestre ou entrar como Player.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((camp) => {
                const isMaster = camp.master_id === currentUserId;
                return (
                  <div
                    key={camp.id}
                    onClick={onGoToCampaigns}
                    className="cursor-pointer bg-bg-card border border-muted-ash/20 hover:border-muted-ash/45 rounded-xl p-4 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                            isMaster
                              ? 'bg-primary-blood/20 border-primary-blood text-text-main'
                              : 'bg-secondary-uv/20 border-secondary-uv text-text-main'
                          }`}
                        >
                          {isMaster ? 'Mestre' : 'Player'}
                        </span>
                        <h4 className="font-bold text-sm text-text-main">{camp.name}</h4>
                      </div>
                      <span className="text-xs font-mono text-muted-ash">
                        #{camp.invite_code}
                      </span>
                    </div>
                    <p className="text-xs text-muted-ash line-clamp-2">
                      {camp.description || 'Sem descrição adicionada.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Coluna Direita: Meus Personagens (6 cols) */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-main tracking-wide flex items-center gap-2">
              Meus Sobreviventes
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg-card border border-muted-ash/20 text-muted-ash">
                {playerCharacters.length}
              </span>
            </h3>
            <button
              onClick={onGoToFichas}
              className="text-xs text-secondary-uv font-semibold hover:underline"
            >
              Abrir Fichas →
            </button>
          </div>

          {playerCharacters.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-muted-ash/25 rounded-xl p-8 text-center space-y-2">
              <UserPlus className="w-7 h-7 text-muted-ash mx-auto" />
              <div className="text-sm font-semibold text-text-main">
                Nenhum personagem criado
              </div>
              <p className="text-xs text-muted-ash">
                Clique em <strong>Criação de Personagens</strong> para montar sua ficha.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {playerCharacters.map((char) => {
                const pvPercent = Math.round(
                  (char.pv_current / Math.max(1, char.pv_max)) * 100
                );
                const sanPercent = Math.round(
                  (char.san_current / Math.max(1, char.san_max)) * 100
                );

                return (
                  <div
                    key={char.id}
                    onClick={onGoToFichas}
                    className="cursor-pointer bg-bg-card border border-muted-ash/20 hover:border-muted-ash/45 rounded-xl p-4 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-text-main">{char.name}</h4>
                        <p className="text-xs text-muted-ash">{char.archetype}</p>
                      </div>
                      <span className="text-xs font-mono px-2 py-1 rounded bg-bg-main border border-muted-ash/20 text-text-main">
                        DEF {char.defense} | LF {char.wound_threshold}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-primary-blood" /> PV
                          </span>
                          <span className="font-mono">
                            {char.pv_current}/{char.pv_max}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-main rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-blood"
                            style={{ width: `${pvPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <Brain className="w-3 h-3 text-warning-rust" /> SAN
                          </span>
                          <span className="font-mono">
                            {char.san_current}/{char.san_max}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-main rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning-rust"
                            style={{ width: `${sanPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1">
                            <Biohazard className="w-3 h-3 text-primary-blood" /> Infec.
                          </span>
                          <span className="font-mono text-primary-blood font-bold">
                            {char.infection_level}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-main rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-blood"
                            style={{ width: `${char.infection_level}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-muted-ash/10 flex items-center justify-between text-[11px] text-muted-ash">
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-warning-rust" /> Ração: {char.food_portions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-secondary-uv" /> Água: {char.water_portions}
                      </span>
                      <span className="text-secondary-uv font-semibold">
                        Abrir Ficha →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
