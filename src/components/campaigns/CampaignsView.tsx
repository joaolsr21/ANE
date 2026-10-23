import React, { useState, useEffect } from 'react';
import {
  Plus,
  KeyRound,
  Crown,
  Shield,
  Copy,
  Check,
  Trash2,
  FolderOpen,
  ArrowLeft,
  Skull,
  Users,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { Campaign, Character } from '../../types/database';
import { MasterControlView } from '../master/MasterControlView';
import { CharacterSheetView } from '../character/CharacterSheetView';
import { CampaignChatFeed, CampaignChatEntry } from './CampaignChatFeed';
import { DiceRollResult } from '../../hooks/useDiceRoller';
import { AvatarPortrait } from '../common/AvatarPortrait';

interface CampaignsViewProps {
  campaigns: Campaign[];
  characters: Character[];
  currentUserId: string;
  initialOpenedCampaignId?: string | null;
  onCreateCampaign: (name: string, description: string) => Promise<any>;
  onDeleteCampaign: (id: string) => Promise<any>;
  onJoinCampaign: (code: string) => Promise<any>;
  onCreateCharacter: (params: any) => Promise<any>;
  onUpdateCharacter: (updated: Character) => Promise<any>;
  onDeleteCharacter: (id: string) => Promise<any>;
}

const CHAT_STORAGE_KEY = 'ane_campaign_chat_logs_v1';

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  characters,
  currentUserId,
  initialOpenedCampaignId = null,
  onCreateCampaign,
  onDeleteCampaign,
  onJoinCampaign,
  onCreateCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
}) => {
  const [openedCampaignId, setOpenedCampaignId] = useState<string | null>(
    initialOpenedCampaignId
  );
  const [masterInnerTab, setMasterInnerTab] = useState<'escudo' | 'jogadores'>('escudo');
  const [playerInnerTab, setPlayerInnerTab] = useState<'player' | 'grupo'>('player');
  const [showChatColumn, setShowChatColumn] = useState<boolean>(true);

  const [chatEntries, setChatEntries] = useState<CampaignChatEntry[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatEntries));
    } catch {
      // ignore
    }
  }, [chatEntries]);

  const [newCampName, setNewCampName] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreatingCamp, setIsCreatingCamp] = useState(false);

  const openedCampaign = campaigns.find((c) => c.id === openedCampaignId) || null;

  const appendChatEntry = (
    campaignId: string,
    payload: Omit<CampaignChatEntry, 'id' | 'timestamp' | 'campaignId'>
  ) => {
    const newEntry: CampaignChatEntry = {
      ...payload,
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      campaignId,
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    setChatEntries((prev) => [...prev, newEntry]);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;
    const created = await onCreateCampaign(newCampName.trim(), newCampDesc.trim());
    setNewCampName('');
    setNewCampDesc('');
    setIsCreatingCamp(false);
    if (created?.id) {
      setOpenedCampaignId(created.id);
      setMasterInnerTab('escudo');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    try {
      const joinedId = await onJoinCampaign(inviteCode.trim());
      setInviteCode('');
      if (joinedId) {
        setOpenedCampaignId(joinedId);
        setPlayerInnerTab('player');
      }
    } catch (err: any) {
      alert(err.message || 'Não foi possível ingressar na campanha.');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ==========================================================================
  // VISÃO INTERNA DE UMA CAMPANHA ABERTA (MESTRE OU PLAYER) + CHAT DA CAMPANHA
  // ==========================================================================
  if (openedCampaign) {
    const isMaster = openedCampaign.master_id === currentUserId;
    const campaignCharacters = characters.filter(
      (c) => c.campaign_id === openedCampaign.id
    );
    const myPlayerCharacters = characters.filter(
      (c) => !c.is_npc && c.user_id === currentUserId
    );
    const partyPlayers = campaignCharacters.filter((c) => !c.is_npc);
    const campaignChatLogs = chatEntries.filter(
      (e) => e.campaignId === openedCampaign.id
    );

    const handleRollLogged = (roll: DiceRollResult) => {
      appendChatEntry(openedCampaign.id, {
        senderName: roll.characterName,
        senderRole: isMaster ? 'Mestre' : 'Player',
        type: 'roll',
        title: `${roll.label} (${roll.attributeKey} ${roll.attributeValue})`,
        formula: roll.formula,
        total: roll.finalTotal,
        details: `d20: [${roll.d20Rolls.join(', ')}]${
          roll.bonusDieType ? ` | ${roll.bonusDieType}: [${roll.bonusDieRoll}]` : ''
        } | Perícia: +${roll.skillBonus} | Mod: ${
          roll.flatModifier >= 0 ? `+${roll.flatModifier}` : roll.flatModifier
        }`,
        isCriticalSuccess: roll.isCriticalSuccess,
        isCriticalFailure: roll.isCriticalFailure,
      });
    };

    const handleAbilityLogged = (
      charName: string,
      abilityName: string,
      description: string
    ) => {
      appendChatEntry(openedCampaign.id, {
        senderName: charName,
        senderRole: isMaster ? 'Mestre' : 'Player',
        type: 'ability',
        title: abilityName,
        description,
      });
    };

    const handleConsumeItemLogged = (
      charName: string,
      itemName: string,
      description: string
    ) => {
      appendChatEntry(openedCampaign.id, {
        senderName: charName,
        senderRole: isMaster ? 'Mestre' : 'Player',
        type: 'item_consumed',
        title: itemName,
        description,
      });
    };

    const handleShareItemLogged = (
      charName: string,
      itemName: string,
      description: string
    ) => {
      appendChatEntry(openedCampaign.id, {
        senderName: charName,
        senderRole: isMaster ? 'Mestre' : 'Player',
        type: 'item_info',
        title: itemName,
        description,
      });
    };

    return (
      <div className="space-y-6">
        {/* Cabeçalho da Campanha Aberta */}
        <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpenedCampaignId(null)}
                className="p-2 rounded-lg bg-bg-main border border-muted-ash/25 text-muted-ash hover:text-text-main transition-colors"
                title="Voltar para lista de campanhas"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

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
                        <Crown className="w-3 h-3 text-primary-blood" /> Você é o Mestre
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3 text-secondary-uv" /> Você é Player
                      </>
                    )}
                  </span>
                  <h2 className="text-xl font-bold text-text-main">
                    {openedCampaign.name}
                  </h2>
                </div>
                <p className="text-xs text-muted-ash mt-1">
                  {openedCampaign.description || 'Campanha ativa de A Noite Eterna.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChatColumn((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  showChatColumn
                    ? 'bg-secondary-uv text-text-main border-secondary-uv shadow-uv-glow'
                    : 'bg-bg-main text-muted-ash border-muted-ash/25 hover:text-text-main'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat da Campanha ({campaignChatLogs.length})
              </button>

              <button
                onClick={() => copyCode(openedCampaign.invite_code)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-main border border-muted-ash/25 hover:border-secondary-uv text-xs font-mono text-text-main transition-colors"
              >
                <span>Código: #{openedCampaign.invite_code}</span>
                {copiedCode === openedCampaign.invite_code ? (
                  <Check className="w-3.5 h-3.5 text-secondary-uv" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-ash" />
                )}
              </button>
            </div>
          </div>

          {/* Barra de Abas Internas conforme o papel (Mestre vs Player) */}
          {isMaster ? (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-muted-ash/15">
              <button
                type="button"
                onClick={() => setMasterInnerTab('escudo')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  masterInnerTab === 'escudo'
                    ? 'bg-primary-blood text-text-main shadow-blood-glow'
                    : 'bg-bg-main text-muted-ash hover:text-text-main border border-muted-ash/20'
                }`}
              >
                <Crown className="w-4 h-4" />
                Escudo do Mestre & Monstros
              </button>

              <button
                type="button"
                onClick={() => setMasterInnerTab('jogadores')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  masterInnerTab === 'jogadores'
                    ? 'bg-secondary-uv text-text-main shadow-uv-glow'
                    : 'bg-bg-main text-muted-ash hover:text-text-main border border-muted-ash/20'
                }`}
              >
                <Users className="w-4 h-4" />
                Personagens dos Players ({partyPlayers.length})
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-muted-ash/15">
              <button
                type="button"
                onClick={() => setPlayerInnerTab('player')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  playerInnerTab === 'player'
                    ? 'bg-secondary-uv text-text-main shadow-uv-glow'
                    : 'bg-bg-main text-muted-ash hover:text-text-main border border-muted-ash/20'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Área do Player (Meus Personagens)
              </button>

              <button
                type="button"
                onClick={() => setPlayerInnerTab('grupo')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  playerInnerTab === 'grupo'
                    ? 'bg-primary-blood text-text-main shadow-blood-glow'
                    : 'bg-bg-main text-muted-ash hover:text-text-main border border-muted-ash/20'
                }`}
              >
                <Users className="w-4 h-4" />
                Sobreviventes do Grupo ({partyPlayers.length})
              </button>
            </div>
          )}
        </div>

        {/* LAYOUT DIVIDIDO: ÁREA PRINCIPAL DA CAMPANHA + CHAT & LOGS EM TEMPO REAL */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className={showChatColumn ? 'xl:col-span-8' : 'xl:col-span-12'}>
            {isMaster ? (
              masterInnerTab === 'escudo' ? (
                <MasterControlView
                  campaigns={campaigns}
                  characters={characters}
                  currentUserId={currentUserId}
                  campaignIdFilter={openedCampaign.id}
                  onCreateCharacter={onCreateCharacter}
                  onUpdateCharacter={onUpdateCharacter}
                  onDeleteCharacter={onDeleteCharacter}
                  onSendRollToChat={handleRollLogged}
                  onSendAbilityToChat={handleAbilityLogged}
                />
              ) : (
                <CharacterSheetView
                  characters={partyPlayers.length > 0 ? partyPlayers : characters}
                  campaigns={[openedCampaign]}
                  onUpdateCharacter={onUpdateCharacter}
                  onCreateCharacter={onCreateCharacter}
                  onDeleteCharacter={onDeleteCharacter}
                  onSendRollToChat={handleRollLogged}
                  onSendAbilityToChat={handleAbilityLogged}
                  onSendConsumeItemToChat={handleConsumeItemLogged}
                  onSendShareItemToChat={handleShareItemLogged}
                />
              )
            ) : playerInnerTab === 'player' ? (
              <div className="space-y-4">
                {myPlayerCharacters.some((c) => c.campaign_id !== openedCampaign.id) && (
                  <div className="bg-bg-card border border-secondary-uv/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      <strong className="text-text-main">
                        Vincular personagem existente a esta campanha:
                      </strong>
                      <span className="text-muted-ash ml-2">
                        Escolha um dos seus personagens para participar de {openedCampaign.name}.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {myPlayerCharacters
                        .filter((c) => c.campaign_id !== openedCampaign.id)
                        .map((char) => (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() =>
                              onUpdateCharacter({ ...char, campaign_id: openedCampaign.id })
                            }
                            className="px-3 py-1.5 rounded-lg bg-secondary-uv text-text-main text-xs font-bold"
                          >
                            Vincular {char.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <CharacterSheetView
                  characters={
                    myPlayerCharacters.filter((c) => c.campaign_id === openedCampaign.id)
                      .length > 0
                      ? myPlayerCharacters.filter(
                          (c) => c.campaign_id === openedCampaign.id
                        )
                      : myPlayerCharacters
                  }
                  campaigns={[openedCampaign]}
                  onUpdateCharacter={onUpdateCharacter}
                  onCreateCharacter={onCreateCharacter}
                  onDeleteCharacter={onDeleteCharacter}
                  onSendRollToChat={handleRollLogged}
                  onSendAbilityToChat={handleAbilityLogged}
                  onSendConsumeItemToChat={handleConsumeItemLogged}
                  onSendShareItemToChat={handleShareItemLogged}
                />
              </div>
            ) : (
              <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-main">
                  Sobreviventes na Campanha ({partyPlayers.length})
                </h3>
                {partyPlayers.length === 0 ? (
                  <p className="text-xs text-muted-ash py-6 text-center">
                    Nenhum personagem vinculado a esta campanha ainda.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partyPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="bg-bg-main border border-muted-ash/20 rounded-xl p-4 flex items-center gap-3.5"
                      >
                        <AvatarPortrait
                          imageUrl={p.avatar_url}
                          name={p.name}
                          size="md"
                          editable={p.user_id === currentUserId}
                          onChangeImage={(newUrl) =>
                            onUpdateCharacter({ ...p, avatar_url: newUrl })
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-text-main truncate">
                              {p.name}
                            </h4>
                            <span className="text-xs font-mono text-secondary-uv">
                              PV {p.pv_current}/{p.pv_max} • SAN {p.san_current}/{p.san_max}
                            </span>
                          </div>
                          <p className="text-xs text-muted-ash truncate mt-0.5">
                            {p.archetype}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLUNA LATERAL DO CHAT DA CAMPANHA (DADOS, HABILIDADES, CONSUMO E ITENS) */}
          {showChatColumn && (
            <div className="xl:col-span-4 sticky top-24">
              <CampaignChatFeed
                campaignId={openedCampaign.id}
                campaignName={openedCampaign.name}
                senderName={
                  isMaster
                    ? 'Mestre'
                    : myPlayerCharacters.find((c) => c.campaign_id === openedCampaign.id)
                        ?.name ||
                      myPlayerCharacters[0]?.name ||
                      'Player'
                }
                isMaster={isMaster}
                entries={campaignChatLogs}
                onAddEntry={(entry) => appendChatEntry(openedCampaign.id, entry)}
                onClearChat={() =>
                  setChatEntries((prev) =>
                    prev.filter((e) => e.campaignId !== openedCampaign.id)
                  )
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // LISTA GERAL DE CAMPANHAS (CRIAR COMO MESTRE OU INGRESSAR COMO PLAYER)
  // ==========================================================================
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-bg-card border border-muted-ash/20 rounded-xl p-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-secondary-uv">
            ANE // Gerenciamento de Campanhas
          </span>
          <h2 className="text-2xl font-bold text-text-main mt-1">Campanhas</h2>
          <p className="text-sm text-muted-ash mt-1 max-w-2xl">
            Abra uma campanha onde você é <strong className="text-text-main">Mestre</strong> para acessar o <strong className="text-primary-blood">Escudo do Mestre, Monstros & Chat</strong>, ou entre como <strong className="text-secondary-uv">Player</strong> para controlar seu personagem e enviar rolagens, habilidades e itens no chat.
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
              Entrar como Player
            </button>
          </form>

          <button
            onClick={() => setIsCreatingCamp((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-xs font-semibold transition-all shadow-blood-glow"
          >
            <Plus className="w-4 h-4" />
            Criar Campanha (Mestre)
          </button>
        </div>
      </div>

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
                placeholder="Resumo da história..."
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
              Criar e Abrir Escudo do Mestre
            </button>
          </div>
        </form>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-bg-card border border-dashed border-muted-ash/25 rounded-xl p-12 text-center space-y-3">
          <FolderOpen className="w-10 h-10 text-muted-ash mx-auto" />
          <div className="text-base font-semibold text-text-main">
            Nenhuma campanha registrada
          </div>
          <p className="text-xs text-muted-ash max-w-md mx-auto">
            Crie uma campanha acima para liberar o <strong>Escudo do Mestre & Monstros</strong> ou insira um código de convite para entrar como <strong>Player</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const isMaster = camp.master_id === currentUserId;
            const campChars = characters.filter((c) => c.campaign_id === camp.id);
            const monstersCount = campChars.filter((c) => c.is_npc).length;
            const playersCount = campChars.filter((c) => !c.is_npc).length;

            return (
              <div
                key={camp.id}
                className="bg-bg-card border border-muted-ash/20 hover:border-muted-ash/45 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
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
                            <Shield className="w-3 h-3 text-secondary-uv" /> Player
                          </>
                        )}
                      </span>
                      <h3 className="font-bold text-base text-text-main">{camp.name}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyCode(camp.invite_code)}
                        title="Copiar código de convite"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-bg-main border border-muted-ash/25 text-xs font-mono text-text-main"
                      >
                        <span>#{camp.invite_code}</span>
                        {copiedCode === camp.invite_code ? (
                          <Check className="w-3 h-3 text-secondary-uv" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-ash" />
                        )}
                      </button>

                      {isMaster && (
                        <button
                          onClick={() => onDeleteCampaign(camp.id)}
                          title="Excluir campanha"
                          className="p-1.5 rounded bg-bg-main border border-muted-ash/20 text-muted-ash hover:text-primary-blood"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-ash leading-relaxed">
                    {camp.description || 'Sem descrição registrada.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-muted-ash/15 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-ash">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-secondary-uv" /> {playersCount} Players
                    </span>
                    {isMaster && (
                      <span className="flex items-center gap-1">
                        <Skull className="w-3.5 h-3.5 text-primary-blood" /> {monstersCount} Monstros
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenedCampaignId(camp.id);
                      if (isMaster) setMasterInnerTab('escudo');
                      else setPlayerInnerTab('player');
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      isMaster
                        ? 'bg-primary-blood hover:bg-primary-blood/90 text-text-main shadow-blood-glow'
                        : 'bg-secondary-uv hover:bg-secondary-uv/90 text-text-main shadow-uv-glow'
                    }`}
                  >
                    {isMaster
                      ? 'Abrir Campanha (Escudo & Monstros) →'
                      : 'Entrar na Campanha (Área do Player) →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
