import React, { useState } from 'react';
import {
  Plus,
  KeyRound,
  Crown,
  Shield,
  Biohazard,
  Brain,
  Heart,
  Droplets,
  Utensils,
  Copy,
  Check,
  Trash2,
  UserPlus,
  FolderOpen,
} from 'lucide-react';
import { Campaign, Character } from '../../types/database';

interface DashboardViewProps {
  campaigns: Campaign[];
  characters: Character[];
  currentUserId: string;
  onCreateCampaign: (name: string, description: string) => Promise<any>;
  onDeleteCampaign: (id: string) => Promise<any>;
  onJoinCampaign: (code: string) => Promise<any>;
  onCreateCharacter: (params: {
    name: string;
    archetype: string;
    campaign_id: string | null;
    is_npc: boolean;
  }) => Promise<any>;
  onDeleteCharacter: (id: string) => Promise<any>;
  onOpenCharacterSheet: () => void;
  onOpenMasterShield: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  campaigns,
  characters,
  currentUserId,
  onCreateCampaign,
  onDeleteCampaign,
  onJoinCampaign,
  onCreateCharacter,
  onDeleteCharacter,
  onOpenCharacterSheet,
  onOpenMasterShield,
}) => {
  const [newCampName, setNewCampName] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreatingCamp, setIsCreatingCamp] = useState(false);

  // Estado para criar Personagem de Jogador
  const [isCreatingChar, setIsCreatingChar] = useState(false);
  const [charName, setCharName] = useState('');
  const [charArchetype, setCharArchetype] = useState('');
  const [charCampaignId, setCharCampaignId] = useState<string>('');

  const playerCharacters = characters.filter(
    (c) => !c.is_npc && c.user_id === currentUserId
  );

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;
    await onCreateCampaign(newCampName.trim(), newCampDesc.trim());
    setNewCampName('');
    setNewCampDesc('');
    setIsCreatingCamp(false);
  };

  const handleCreateChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;
    await onCreateCharacter({
      name: charName.trim(),
      archetype: charArchetype.trim() || 'Sobrevivente',
      campaign_id: charCampaignId || null,
      is_npc: false,
    });
    setCharName('');
    setCharArchetype('');
    setIsCreatingChar(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    try {
      await onJoinCampaign(inviteCode.trim());
      setInviteCode('');
    } catch (err: any) {
      alert(err.message || 'Não foi possível ingressar na campanha.');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Banner e Ações Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-bg-card border border-muted-ash/20 rounded-xl p-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-secondary-uv">
            ANE // Gerenciamento de Campanhas & Personagens
          </span>
          <h2 className="text-2xl font-bold text-text-main mt-1">
            Painel Principal
          </h2>
          <p className="text-sm text-muted-ash mt-1 max-w-2xl">
            Crie campanhas como <strong className="text-text-main">Mestre</strong> (controle total sobre fichas e monstros) ou ingresse via código para vincular seu <strong className="text-text-main">Personagem</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ingressar via Código */}
          <form onSubmit={handleJoin} className="flex items-center gap-2">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-muted-ash absolute left-3 top-2.5" />
              <input
                type="text"
                maxLength={8}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Código de Convite"
                className="bg-bg-main border border-muted-ash/30 rounded-lg pl-9 pr-3 py-2 text-xs font-mono uppercase text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv w-44"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main text-xs font-semibold transition-all shadow-uv-glow"
            >
              Ingressar
            </button>
          </form>

          <button
            onClick={onOpenCharacterSheet}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-main border border-secondary-uv hover:bg-secondary-uv/20 text-text-main text-xs font-semibold transition-all"
          >
            <UserPlus className="w-4 h-4 text-secondary-uv" />
            Criar Personagem (Wizard CRIS)
          </button>

          <button
            onClick={() => setIsCreatingCamp((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-xs font-semibold transition-all shadow-blood-glow"
          >
            <Plus className="w-4 h-4" />
            Criar Campanha (Mestre)
          </button>
        </div>
      </div>

      {/* Formulário: Criar Campanha */}
      {isCreatingCamp && (
        <form
          onSubmit={handleCreateCampaign}
          className="bg-bg-card border border-primary-blood/50 rounded-xl p-5 space-y-4 shadow-blood-glow"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary-blood" />
            Nova Campanha (Você será o Mestre)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-ash mb-1">Nome da Campanha</label>
              <input
                type="text"
                required
                value={newCampName}
                onChange={(e) => setNewCampName(e.target.value)}
                placeholder="Ex: Quarentena no Setor 4"
                className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3.5 py-2 text-sm text-text-main focus:outline-none focus:border-primary-blood"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-ash mb-1">Descrição / Ambientação</label>
              <input
                type="text"
                value={newCampDesc}
                onChange={(e) => setNewCampDesc(e.target.value)}
                placeholder="Resumo da história ou regras da mesa..."
                className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3.5 py-2 text-sm text-text-main focus:outline-none focus:border-primary-blood"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingCamp(false)}
              className="px-4 py-2 rounded-lg text-xs text-muted-ash hover:text-text-main"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-blood text-text-main text-xs font-semibold"
            >
              Criar Campanha
            </button>
          </div>
        </form>
      )}

      {/* Formulário: Criar Personagem */}
      {isCreatingChar && (
        <form
          onSubmit={handleCreateChar}
          className="bg-bg-card border border-secondary-uv/50 rounded-xl p-5 space-y-4 shadow-uv-glow"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-secondary-uv" />
            Criar Nova Ficha de Personagem
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted-ash mb-1">Nome do Personagem</label>
              <input
                type="text"
                required
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                placeholder="Ex: Lucas Andrade"
                className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3.5 py-2 text-sm text-text-main focus:outline-none focus:border-secondary-uv"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-ash mb-1">Ocupação / Arquétipo</label>
              <input
                type="text"
                value={charArchetype}
                onChange={(e) => setCharArchetype(e.target.value)}
                placeholder="Ex: Paramédico, Policial, Mecânico..."
                className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3.5 py-2 text-sm text-text-main focus:outline-none focus:border-secondary-uv"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-ash mb-1">Vincular a uma Campanha (Opcional)</label>
              <select
                value={charCampaignId}
                onChange={(e) => setCharCampaignId(e.target.value)}
                className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3.5 py-2 text-sm text-text-main focus:outline-none focus:border-secondary-uv"
              >
                <option value="">Sem campanha vinculada</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingChar(false)}
              className="px-4 py-2 rounded-lg text-xs text-muted-ash hover:text-text-main"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-secondary-uv text-text-main text-xs font-semibold"
            >
              Salvar Ficha
            </button>
          </div>
        </form>
      )}

      {/* Grid Principal: Campanhas e Personagens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Campanhas (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-main tracking-wide flex items-center gap-2">
              Minhas Campanhas
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg-card border border-muted-ash/20 text-muted-ash">
                {campaigns.length}
              </span>
            </h3>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-muted-ash/25 rounded-xl p-10 text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-muted-ash mx-auto" />
              <div className="text-sm font-semibold text-text-main">
                Nenhuma campanha ativa no momento
              </div>
              <p className="text-xs text-muted-ash max-w-md mx-auto">
                Clique em <strong className="text-text-main">"Criar Campanha (Mestre)"</strong> acima para iniciar uma nova mesa ou digite o código de convite recebido do seu Mestre.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((camp) => {
                const isMaster = camp.master_id === currentUserId;
                return (
                  <div
                    key={camp.id}
                    className="bg-bg-card border border-muted-ash/20 hover:border-muted-ash/40 rounded-xl p-5 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2 py-0.5 rounded border ${
                              isMaster
                                ? 'bg-primary-blood/20 border-primary-blood text-text-main'
                                : 'bg-secondary-uv/20 border-secondary-uv text-text-main'
                            }`}
                          >
                            {isMaster ? (
                              <>
                                <Crown className="w-3 h-3 text-primary-blood" /> Mestre
                              </>
                            ) : (
                              <>
                                <Shield className="w-3 h-3 text-secondary-uv" /> Jogador
                              </>
                            )}
                          </span>
                          <h4 className="font-bold text-base text-text-main">{camp.name}</h4>
                        </div>
                        <p className="text-xs text-muted-ash mt-1.5 leading-relaxed">
                          {camp.description || 'Sem descrição adicionada.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyCode(camp.invite_code)}
                          title="Copiar código de convite"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-main border border-muted-ash/25 hover:border-secondary-uv text-xs font-mono text-text-main transition-colors"
                        >
                          <span>#{camp.invite_code}</span>
                          {copiedCode === camp.invite_code ? (
                            <Check className="w-3.5 h-3.5 text-secondary-uv" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-ash" />
                          )}
                        </button>

                        {isMaster && (
                          <button
                            onClick={() => onDeleteCampaign(camp.id)}
                            title="Excluir campanha"
                            className="p-1.5 rounded-lg bg-bg-main border border-muted-ash/20 text-muted-ash hover:text-primary-blood transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-muted-ash/10 flex items-center justify-between text-xs text-muted-ash">
                      <span>
                        Acesso:{' '}
                        <strong className="text-text-main">
                          {isMaster ? 'Controle Total do Mestre' : 'Edição da Própria Ficha'}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={isMaster ? onOpenMasterShield : onOpenCharacterSheet}
                        className="text-secondary-uv font-semibold hover:underline"
                      >
                        {isMaster ? 'Abrir Escudo do Mestre & Monstros →' : 'Abrir Minha Ficha →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Coluna Direita: Meus Personagens (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-main tracking-wide flex items-center gap-2">
              Meus Personagens
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg-card border border-muted-ash/20 text-muted-ash">
                {playerCharacters.length}
              </span>
            </h3>
          </div>

          {playerCharacters.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-muted-ash/25 rounded-xl p-10 text-center space-y-3">
              <UserPlus className="w-8 h-8 text-muted-ash mx-auto" />
              <div className="text-sm font-semibold text-text-main">
                Nenhum personagem criado
              </div>
              <p className="text-xs text-muted-ash">
                Clique em <strong className="text-text-main">"Criar Personagem"</strong> no topo para montar sua primeira ficha de sobrevivente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {playerCharacters.map((char) => {
                const pvPercent = Math.round((char.pv_current / Math.max(1, char.pv_max)) * 100);
                const sanPercent = Math.round((char.san_current / Math.max(1, char.san_max)) * 100);

                return (
                  <div
                    key={char.id}
                    className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base text-text-main">{char.name}</h4>
                        <p className="text-xs text-muted-ash">{char.archetype}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-1 rounded bg-bg-main border border-muted-ash/20 text-text-main">
                          DEF {char.defense} | LF {char.wound_threshold}
                        </span>
                        <button
                          onClick={() => onDeleteCharacter(char.id)}
                          title="Excluir personagem"
                          className="p-1.5 rounded bg-bg-main text-muted-ash hover:text-primary-blood"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Atributos (1 a 5) */}
                    <div className="grid grid-cols-5 gap-1.5 text-center bg-bg-main p-2.5 rounded-lg border border-muted-ash/15">
                      {[
                        { label: 'FOR', val: char.attr_for },
                        { label: 'AGI', val: char.attr_agi },
                        { label: 'INT', val: char.attr_int },
                        { label: 'PRE', val: char.attr_pre },
                        { label: 'VIG', val: char.attr_vig },
                      ].map((attr) => (
                        <div key={attr.label} className="p-1">
                          <div className="text-[10px] font-mono text-muted-ash">{attr.label}</div>
                          <div className="text-sm font-bold text-text-main">{attr.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Barras de Status */}
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-text-main font-medium">
                            <Heart className="w-3.5 h-3.5 text-primary-blood" /> PV
                          </span>
                          <span className="font-mono">
                            {char.pv_current}/{char.pv_max}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-bg-main rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-blood transition-all"
                            style={{ width: `${pvPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-text-main font-medium">
                            <Brain className="w-3.5 h-3.5 text-warning-rust" /> Sanidade (SAN)
                          </span>
                          <span className="font-mono">
                            {char.san_current}/{char.san_max}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-bg-main rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning-rust transition-all"
                            style={{ width: `${sanPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-text-main font-medium">
                            <Biohazard className="w-3.5 h-3.5 text-primary-blood" /> Infecção
                          </span>
                          <span className="font-mono text-primary-blood font-bold">
                            {char.infection_level}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-bg-main rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-blood transition-all"
                            style={{ width: `${char.infection_level}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-muted-ash/15 flex items-center justify-between text-xs text-muted-ash">
                      <span className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-warning-rust" /> Ração:{' '}
                        <strong className="text-text-main">{char.food_portions}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-secondary-uv" /> Água:{' '}
                        <strong className="text-text-main">{char.water_portions}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={onOpenCharacterSheet}
                        className="text-secondary-uv font-semibold hover:underline"
                      >
                        Editar & Rolar →
                      </button>
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
