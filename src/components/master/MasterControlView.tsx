import React, { useState } from 'react';
import {
  Crown,
  Skull,
  Users,
  Plus,
  Trash2,
  Dices,
  Heart,
  Brain,
  Biohazard,
  Shield,
  Zap,
  RotateCcw,
  Sun,
  Eye,
  Footprints,
  Flame,
  HeartPulse,
  MessageSquare,
} from 'lucide-react';
import { Campaign, Character } from '../../types/database';
import {
  AttributeKey,
  ATTRIBUTE_DICE_FORMULA,
  useDiceRoller,
  DiceRollResult,
} from '../../hooks/useDiceRoller';
import { ANE_INFECTED_TEMPLATES, InfectedTemplate } from '../../data/aneSystemRules';
import { BodyWoundDiagram } from '../character/BodyWoundDiagram';
import { buildInventoryWithMeta, extractWoundsAndMeta } from '../character/CharacterSheetView';
import { AvatarPortrait } from '../common/AvatarPortrait';

interface MasterControlViewProps {
  campaigns: Campaign[];
  characters: Character[];
  currentUserId: string;
  onCreateCharacter: (params: {
    name: string;
    archetype: string;
    avatar_url?: string | null;
    campaign_id: string | null;
    is_npc: boolean;
    pv_max?: number;
    san_max?: number;
    attr_for?: number;
    attr_agi?: number;
    attr_int?: number;
    attr_pre?: number;
    attr_vig?: number;
    wound_threshold?: number;
    defense?: number;
    initiative?: number;
  }) => Promise<any>;
  onUpdateCharacter: (updated: Character) => Promise<any>;
  onDeleteCharacter: (id: string) => Promise<any>;
  campaignIdFilter?: string;
  onSendRollToChat?: (roll: DiceRollResult) => void;
  onSendAbilityToChat?: (senderName: string, abilityName: string, description: string) => void;
}

const EXPOSURE_STATES = [
  { lvl: 0, label: '0 — Ocultos', desc: 'Nenhuma ameaça suspeita da presença.' },
  { lvl: 1, label: '1 — Suspeita', desc: 'Ruído ou sinal; ameaças observam o ambiente.' },
  { lvl: 2, label: '2 — Busca', desc: 'Presença anormal evidente; buscas ativas.' },
  { lvl: 3, label: '3 — Descobertos', desc: 'Localizados! Inicia Combate ou Perseguição.' },
];

const HORDE_PRESSURE_STATES = [
  { lvl: 0, label: '0 — Distante', desc: 'Massa afastada ou contida por barreira.' },
  { lvl: 1, label: '1 — Aproximando', desc: 'Primeiros infectados alcançam a área.' },
  { lvl: 2, label: '2 — Próxima', desc: 'Barreiras e rotas começam a ser pressionadas.' },
  { lvl: 3, label: '3 — Contato', desc: 'Horda alcança a posição; expostos são atacados.' },
  { lvl: 4, label: '4 — Cercando', desc: 'Rotas fecham; personagens podem ficar Cercados.' },
  { lvl: 5, label: '5 — Engolido', desc: 'Posição superada! Consequência crítica imediata.' },
];

export const MasterControlView: React.FC<MasterControlViewProps> = ({
  campaigns,
  characters,
  currentUserId,
  onCreateCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  campaignIdFilter,
  onSendRollToChat,
  onSendAbilityToChat,
}) => {
  const masterCampaigns = campaigns.filter((c) => c.master_id === currentUserId);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaignIdFilter || masterCampaigns[0]?.id || campaigns[0]?.id || ''
  );

  // Rastreadores de Cenas do Livro (Caps. 08, 09 e 21)
  const [stealthExposure, setStealthExposure] = useState<number>(0); // 0 a 3
  const [chaseSuccesses, setChaseSuccesses] = useState<number>(0);   // 0 a 3
  const [chaseFailures, setChaseFailures] = useState<number>(0);     // 0 a 3
  const [hordePressure, setHordePressure] = useState<number>(0);     // 0 a 5

  // Qual ficha (Monstro ou Jogador) está com o Diagrama Corporal de Ferimentos aberto
  const [expandedBodyId, setExpandedBodyId] = useState<string | null>(null);

  // Formulário para criar Monstro Customizado
  const [monsterName, setMonsterName] = useState('');
  const [monsterType, setMonsterType] = useState('Humano Hostil / Saqueador');
  const [monsterPv, setMonsterPv] = useState<number>(28);
  const [mFor, setMFor] = useState<number>(3);
  const [mAgi, setMAgi] = useState<number>(2);
  const [mInt, setMInt] = useState<number>(1);
  const [mPre, setMPre] = useState<number>(2);
  const [mVig, setMVig] = useState<number>(3);

  const { lastRoll, rollHistory, rollAttributeOrSkill, clearHistory } = useDiceRoller();

  const filteredCharacters = characters.filter((c) =>
    selectedCampaignId ? c.campaign_id === selectedCampaignId : true
  );

  const monsters = filteredCharacters.filter((c) => c.is_npc);
  const players = filteredCharacters.filter((c) => !c.is_npc);

  // Invocar rapidamente um dos 10 Infectados Oficiais do Capítulo 20
  const handleSpawnOfficialInfected = async (tpl: InfectedTemplate) => {
    await onCreateCharacter({
      name: tpl.name,
      archetype: `${tpl.photosensitive ? '[FOTOSSENSÍVEL] ' : ''}Mov ${tpl.mov} • ${tpl.attacksSummary}`,
      campaign_id: selectedCampaignId || null,
      is_npc: true,
      pv_max: tpl.pv,
      san_max: 0,
      attr_for: tpl.attr_for,
      attr_agi: tpl.attr_agi,
      attr_int: 1,
      attr_pre: tpl.attr_pre,
      attr_vig: tpl.attr_vig,
      wound_threshold: 10 + tpl.attr_vig,
      defense: tpl.def,
      initiative: tpl.ini,
    });
  };

  const handleCreateCustomMonster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monsterName.trim()) return;

    await onCreateCharacter({
      name: monsterName.trim(),
      archetype: monsterType.trim() || 'Ameaça',
      campaign_id: selectedCampaignId || null,
      is_npc: true,
      pv_max: Number(monsterPv) || 25,
      san_max: 0,
      attr_for: mFor,
      attr_agi: mAgi,
      attr_int: mInt,
      attr_pre: mPre,
      attr_vig: mVig,
      wound_threshold: 10 + mVig,
      defense: 10 + mAgi,
      initiative: mAgi + 1,
    });

    setMonsterName('');
  };

  const adjustEntityStat = (
    entity: Character,
    field: 'pv_current' | 'san_current' | 'infection_level' | 'fatigue',
    delta: number,
    max: number
  ) => {
    const nextVal = Math.max(0, Math.min(max, (entity[field] as number) + delta));
    onUpdateCharacter({
      ...entity,
      [field]: nextVal,
    });
  };

  const rollForEntity = (entity: Character, attr: AttributeKey) => {
    const map: Record<AttributeKey, number> = {
      FOR: entity.attr_for,
      AGI: entity.attr_agi,
      INT: entity.attr_int,
      PRE: entity.attr_pre,
      VIG: entity.attr_vig,
    };

    const result = rollAttributeOrSkill({
      characterName: entity.name,
      label: `Teste de ${attr}`,
      attributeKey: attr,
      attributeValue: map[attr],
      skillRank: 0,
      flatModifier: entity.is_npc ? 0 : -entity.fatigue * 2,
    });

    if (onSendRollToChat) {
      onSendRollToChat(result);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Escudo do Mestre */}
      <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-primary-blood flex items-center gap-1.5">
            <Crown className="w-4 h-4" />
            Escudo do Mestre & Controle de Monstros
          </span>
          <h2 className="text-xl font-bold text-text-main mt-0.5">
            Bestiário dos Infectados, Corpo de Ferimentos & Controle de Cenas
          </h2>
        </div>

        {!campaignIdFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-ash">Filtrar por Campanha:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-2 text-xs font-semibold text-text-main focus:outline-none focus:border-primary-blood"
            >
              <option value="">Todas as Fichas e Monstros</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* RASTREADORES DE CENAS: FURTIVIDADE, PERSEGUIÇÃO E HORDA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Furtividade: Exposição 0 a 3 */}
        <div className="bg-bg-card border border-secondary-uv/35 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-secondary-uv" />
              Cena de Furtividade
            </span>
            <span className="text-xs font-mono text-secondary-uv font-bold">
              Exposição {stealthExposure}/3
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setStealthExposure(lvl)}
                className={`py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                  stealthExposure === lvl
                    ? lvl === 3
                      ? 'bg-primary-blood text-text-main border-primary-blood'
                      : 'bg-secondary-uv text-text-main border-secondary-uv'
                    : 'bg-bg-main text-muted-ash border-muted-ash/20'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-ash">
            <strong className="text-text-main">
              {EXPOSURE_STATES[stealthExposure].label}:
            </strong>{' '}
            {EXPOSURE_STATES[stealthExposure].desc}
          </p>
        </div>

        {/* 2. Perseguição: 3 Sucessos antes de 3 Falhas */}
        <div className="bg-bg-card border border-warning-rust/35 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-warning-rust" />
              Perseguição
            </span>
            <button
              type="button"
              onClick={() => {
                setChaseSuccesses(0);
                setChaseFailures(0);
              }}
              className="text-[10px] font-mono text-muted-ash hover:text-text-main"
            >
              Zerar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-bg-main p-2 rounded-lg border border-secondary-uv/40 flex items-center justify-between">
              <span className="font-mono">Sucessos: {chaseSuccesses}/3</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setChaseSuccesses(Math.max(0, chaseSuccesses - 1))}
                  className="px-1.5 rounded bg-bg-card"
                >
                  -
                </button>
                <button
                  onClick={() => setChaseSuccesses(Math.min(3, chaseSuccesses + 1))}
                  className="px-1.5 rounded bg-secondary-uv text-text-main font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-bg-main p-2 rounded-lg border border-primary-blood/40 flex items-center justify-between">
              <span className="font-mono">Falhas: {chaseFailures}/3</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setChaseFailures(Math.max(0, chaseFailures - 1))}
                  className="px-1.5 rounded bg-bg-card"
                >
                  -
                </button>
                <button
                  onClick={() => setChaseFailures(Math.min(3, chaseFailures + 1))}
                  className="px-1.5 rounded bg-primary-blood text-text-main font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-ash">
            Teste a pé: <strong className="text-text-main">AGI + Atletismo</strong>.{' '}
            {chaseSuccesses >= 3
              ? '★ FUGITIVO ESCAPOU!'
              : chaseFailures >= 3
              ? '☠ FUGITIVO ALCANÇADO!'
              : '3 Sucessos antes de 3 Falhas.'}
          </p>
        </div>

        {/* 3. Horda: Pressão 0 a 5 */}
        <div className="bg-bg-card border border-primary-blood/45 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary-blood" />
              Pressão da Horda
            </span>
            <span className="text-xs font-mono text-primary-blood font-bold">
              Pressão {hordePressure}/5
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[0, 1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setHordePressure(lvl)}
                className={`py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                  hordePressure === lvl
                    ? 'bg-primary-blood text-text-main border-primary-blood shadow-blood-glow'
                    : 'bg-bg-main text-muted-ash border-muted-ash/20'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-ash">
            <strong className="text-text-main">
              {HORDE_PRESSURE_STATES[hordePressure].label}:
            </strong>{' '}
            {HORDE_PRESSURE_STATES[hordePressure].desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: Bestiário Oficial (10 Infectados), Monstros em Cena e Fichas de Jogadores (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Bestiário Oficial: Os 10 Infectados (Invocação em 1 Clique) */}
          <div className="bg-bg-card border border-primary-blood/40 rounded-xl p-5 space-y-4 shadow-blood-glow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary-blood">
                  BESTIÁRIO OFICIAL DE A NOITE ETERNA
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                  <Skull className="w-4 h-4 text-primary-blood" />
                  Invocar Infectado na Cena
                </h3>
              </div>
              <span className="text-[11px] font-mono text-muted-ash">
                Clique em "+ Invocar" para criar com a ficha e Corpo de Ferimentos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {ANE_INFECTED_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-bg-main border border-muted-ash/20 hover:border-primary-blood/60 rounded-xl p-3 flex flex-col justify-between gap-2 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-text-main flex items-center gap-1.5">
                        {tpl.name}
                        {tpl.photosensitive && (
                          <span className="px-1.5 py-0.5 rounded bg-secondary-uv/25 border border-secondary-uv text-[9px] font-mono text-text-main flex items-center gap-0.5">
                            <Sun className="w-2.5 h-2.5 text-secondary-uv" /> UV
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-primary-blood font-bold">
                        PV {tpl.pv} | DEF {tpl.def} | INI {tpl.ini >= 0 ? `+${tpl.ini}` : tpl.ini}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-ash mt-1">
                      FOR {tpl.attr_for} • AGI {tpl.attr_agi} • PRE {tpl.attr_pre} • VIG {tpl.attr_vig} • Mov {tpl.mov}
                    </p>
                    <p className="text-[10px] text-text-main/80 mt-1">
                      {tpl.attacksSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-muted-ash/10">
                    <span className="text-[10px] text-muted-ash truncate max-w-[180px]" title={tpl.abilitiesSummary}>
                      {tpl.abilitiesSummary}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpawnOfficialInfected(tpl)}
                      className="px-2.5 py-1 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-[11px] font-bold flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Invocar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Criador Rápido de Ameaça / NPC Customizado */}
            <form
              onSubmit={handleCreateCustomMonster}
              className="pt-3 border-t border-muted-ash/15 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end"
            >
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-mono text-muted-ash mb-1">
                  NPC / Monstro Personalizado
                </label>
                <input
                  type="text"
                  value={monsterName}
                  onChange={(e) => setMonsterName(e.target.value)}
                  placeholder="Nome (Ex: Saqueador Armado)..."
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-1.5 text-xs text-text-main"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-mono text-muted-ash mb-1">
                  Descrição / Ataque
                </label>
                <input
                  type="text"
                  value={monsterType}
                  onChange={(e) => setMonsterType(e.target.value)}
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-1.5 text-xs text-text-main"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono text-muted-ash mb-1">
                  PV Máx
                </label>
                <input
                  type="number"
                  value={monsterPv}
                  onChange={(e) => setMonsterPv(Number(e.target.value))}
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-1.5 text-xs font-mono text-text-main"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 py-1.5 px-3 rounded-lg bg-secondary-uv text-text-main text-xs font-bold flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar
              </button>
            </form>
          </div>

          {/* 2. Monstros & Infectados Ativos na Cena (com Corpo de Ferimentos Expansível) */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
              <Skull className="w-4 h-4 text-primary-blood" />
              Monstros & Ameaças em Cena ({monsters.length})
            </h3>

            {monsters.length === 0 ? (
              <p className="text-xs text-muted-ash text-center py-6 bg-bg-main/50 rounded-lg border border-dashed border-muted-ash/20">
                Nenhuma ameaça ativa. Clique em "+ Invocar" no Bestiário acima para colocar Infectados em cena.
              </p>
            ) : (
              <div className="space-y-4">
                {monsters.map((monster) => {
                  const pvPct = Math.round(
                    (monster.pv_current / Math.max(1, monster.pv_max)) * 100
                  );
                  const mMeta = extractWoundsAndMeta(monster);
                  const isBodyOpen = expandedBodyId === monster.id;

                  return (
                    <div
                      key={monster.id}
                      className="bg-bg-main border border-primary-blood/40 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <AvatarPortrait
                            imageUrl={monster.avatar_url}
                            name={monster.name}
                            isNpc={true}
                            size="md"
                            editable={true}
                            onChangeImage={(newUrl) =>
                              onUpdateCharacter({ ...monster, avatar_url: newUrl })
                            }
                          />
                          <div>
                            <h4 className="font-bold text-sm text-text-main flex items-center gap-1.5">
                              <Skull className="w-4 h-4 text-primary-blood" />
                              {monster.name}
                              {mMeta.wounds.length > 0 && (
                                <span className="px-2 py-0.5 rounded bg-primary-blood text-text-main text-[10px] font-mono">
                                  {mMeta.wounds.length} Ferimento(s)
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-muted-ash">{monster.archetype}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {onSendAbilityToChat && (
                            <button
                              type="button"
                              onClick={() =>
                                onSendAbilityToChat(
                                  monster.name,
                                  `Ataque / Habilidade de ${monster.name}`,
                                  monster.archetype
                                )
                              }
                              title="Mostrar ataque/habilidade do monstro no Chat"
                              className="px-2.5 py-1 rounded-lg bg-bg-card border border-muted-ash/30 hover:border-secondary-uv text-xs font-mono text-text-main flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-secondary-uv" />
                              Chat
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBodyId(isBodyOpen ? null : monster.id)
                            }
                            className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all ${
                              isBodyOpen
                                ? 'bg-primary-blood text-text-main border-primary-blood'
                                : 'bg-bg-card text-text-main border-muted-ash/30 hover:border-primary-blood'
                            }`}
                          >
                            <HeartPulse className="w-3.5 h-3.5" />
                            {isBodyOpen ? 'Ocultar Corpo' : 'Corpo & Ferimentos'}
                          </button>

                          <button
                            onClick={() => onDeleteCharacter(monster.id)}
                            title="Remover monstro"
                            className="p-1.5 text-muted-ash hover:text-primary-blood"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* PV e Defesa do Monstro */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                        <div className="sm:col-span-7 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-text-main font-medium">
                              <Heart className="w-3.5 h-3.5 text-primary-blood" /> PV:
                              <strong className="font-mono ml-1">
                                {monster.pv_current}/{monster.pv_max}
                              </strong>
                            </span>
                            <div className="flex items-center gap-1">
                              {[-10, -5, -1, 1, 5].map((delta) => (
                                <button
                                  key={delta}
                                  type="button"
                                  onClick={() =>
                                    adjustEntityStat(
                                      monster,
                                      'pv_current',
                                      delta,
                                      monster.pv_max
                                    )
                                  }
                                  className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-[11px] font-mono hover:border-primary-blood"
                                >
                                  {delta > 0 ? `+${delta}` : delta}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-blood transition-all"
                              style={{ width: `${pvPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-5 flex items-center justify-around font-mono text-[11px] bg-bg-card p-2 rounded-lg border border-muted-ash/15">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-secondary-uv" /> DEF {monster.defense}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-warning-rust" /> INI{' '}
                            {monster.initiative >= 0 ? `+${monster.initiative}` : monster.initiative}
                          </span>
                          <span>LF {monster.wound_threshold}</span>
                        </div>
                      </div>

                      {/* Rolagem Rápida dos Atributos do Monstro */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {(['FOR', 'AGI', 'INT', 'PRE', 'VIG'] as AttributeKey[]).map((attr) => {
                          const val =
                            attr === 'FOR'
                              ? monster.attr_for
                              : attr === 'AGI'
                              ? monster.attr_agi
                              : attr === 'INT'
                              ? monster.attr_int
                              : attr === 'PRE'
                              ? monster.attr_pre
                              : monster.attr_vig;
                          return (
                            <button
                              key={attr}
                              type="button"
                              onClick={() => rollForEntity(monster, attr)}
                              className="py-1.5 px-1 rounded bg-bg-card hover:bg-primary-blood/30 border border-muted-ash/25 hover:border-primary-blood text-center transition-colors"
                            >
                              <div className="text-[10px] font-mono text-muted-ash">{attr}</div>
                              <div className="text-xs font-bold font-mono text-text-main">
                                {val}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Diagrama Anatômico Padrão do Monstro (Aberto sob demanda) */}
                      {isBodyOpen && (
                        <div className="pt-3 border-t border-muted-ash/20">
                          <BodyWoundDiagram
                            entityName={monster.name}
                            isNpc={true}
                            woundThreshold={monster.wound_threshold}
                            pvCurrent={monster.pv_current}
                            pvMax={monster.pv_max}
                            wounds={mMeta.wounds}
                            onChangeWounds={(nextWounds) =>
                              onUpdateCharacter({
                                ...monster,
                                inventory: buildInventoryWithMeta(monster, {
                                  wounds: nextWounds,
                                }) as any,
                              })
                            }
                            onApplyDamageAndBleed={(pvDelta) =>
                              adjustEntityStat(
                                monster,
                                'pv_current',
                                pvDelta,
                                monster.pv_max
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Controle Direto do Mestre sobre Fichas e Corpo dos Jogadores */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary-uv" />
              Fichas dos Jogadores ({players.length}) — Controle Total & Corpo de Ferimentos
            </h3>

            {players.length === 0 ? (
              <p className="text-xs text-muted-ash text-center py-6 bg-bg-main/50 rounded-lg border border-dashed border-muted-ash/20">
                Nenhuma ficha de jogador criada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {players.map((player) => {
                  const pMeta = extractWoundsAndMeta(player);
                  const isBodyOpen = expandedBodyId === player.id;

                  return (
                    <div
                      key={player.id}
                      className="bg-bg-main border border-muted-ash/20 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <AvatarPortrait
                            imageUrl={player.avatar_url}
                            name={player.name}
                            isNpc={false}
                            size="md"
                            editable={true}
                            onChangeImage={(newUrl) =>
                              onUpdateCharacter({ ...player, avatar_url: newUrl })
                            }
                          />
                          <div>
                            <h4 className="font-bold text-sm text-text-main flex items-center gap-2">
                              {player.name}
                              {pMeta.wounds.length > 0 && (
                                <span className="px-2 py-0.5 rounded bg-primary-blood text-text-main text-[10px] font-mono">
                                  {pMeta.wounds.length} Ferimento(s)
                                </span>
                              )}
                            </h4>
                            <span className="text-xs text-muted-ash">
                              {player.archetype} • DEF {player.defense} • LF {player.wound_threshold}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBodyId(isBodyOpen ? null : player.id)
                            }
                            className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all ${
                              isBodyOpen
                                ? 'bg-secondary-uv text-text-main border-secondary-uv'
                                : 'bg-bg-card text-text-main border-muted-ash/30 hover:border-secondary-uv'
                            }`}
                          >
                            <HeartPulse className="w-3.5 h-3.5" />
                            {isBodyOpen ? 'Ocultar Corpo' : 'Corpo & Ferimentos'}
                          </button>

                          <div className="flex items-center gap-1">
                            {(['FOR', 'AGI', 'INT', 'PRE', 'VIG'] as AttributeKey[]).map(
                              (attr) => (
                                <button
                                  key={attr}
                                  type="button"
                                  onClick={() => rollForEntity(player, attr)}
                                  className="px-2 py-1 rounded bg-bg-card hover:border-secondary-uv border border-muted-ash/25 text-[11px] font-mono text-text-main"
                                >
                                  {attr}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-muted-ash/15 text-xs">
                        <div className="bg-bg-card p-2.5 rounded-lg border border-primary-blood/30 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-medium">
                            <Heart className="w-3.5 h-3.5 text-primary-blood" />
                            PV: {player.pv_current}/{player.pv_max}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                adjustEntityStat(player, 'pv_current', -1, player.pv_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                            >
                              -
                            </button>
                            <button
                              onClick={() =>
                                adjustEntityStat(player, 'pv_current', 1, player.pv_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="bg-bg-card p-2.5 rounded-lg border border-warning-rust/30 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-medium">
                            <Brain className="w-3.5 h-3.5 text-warning-rust" />
                            SAN: {player.san_current}/{player.san_max}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                adjustEntityStat(player, 'san_current', -2, player.san_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                            >
                              -2
                            </button>
                            <button
                              onClick={() =>
                                adjustEntityStat(player, 'san_current', 2, player.san_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                            >
                              +2
                            </button>
                          </div>
                        </div>

                        <div className="bg-bg-card p-2.5 rounded-lg border border-primary-blood/30 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-medium">
                            <Biohazard className="w-3.5 h-3.5 text-primary-blood" />
                            Infec: {player.infection_level}%
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                adjustEntityStat(player, 'infection_level', 10, 100)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25 text-[10px]"
                            >
                              +10%
                            </button>
                            <button
                              onClick={() =>
                                adjustEntityStat(player, 'infection_level', 20, 100)
                              }
                              className="px-1.5 py-0.5 rounded bg-primary-blood text-text-main text-[10px]"
                            >
                              +20%
                            </button>
                          </div>
                        </div>

                        <div className="bg-bg-card p-2.5 rounded-lg border border-muted-ash/20 flex items-center justify-between">
                          <span className="font-medium">Fadiga: {player.fatigue}/3</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => adjustEntityStat(player, 'fatigue', -1, 3)}
                              className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                            >
                              -
                            </button>
                            <button
                              onClick={() => adjustEntityStat(player, 'fatigue', 1, 3)}
                              className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {isBodyOpen && (
                        <div className="pt-3 border-t border-muted-ash/20">
                          <BodyWoundDiagram
                            entityName={player.name}
                            isNpc={false}
                            woundThreshold={player.wound_threshold}
                            pvCurrent={player.pv_current}
                            pvMax={player.pv_max}
                            wounds={pMeta.wounds}
                            dyingSuccesses={pMeta.dyingSuccesses}
                            dyingFailures={pMeta.dyingFailures}
                            onChangeWounds={(nextWounds) =>
                              onUpdateCharacter({
                                ...player,
                                inventory: buildInventoryWithMeta(player, {
                                  wounds: nextWounds,
                                }) as any,
                              })
                            }
                            onApplyDamageAndBleed={(pvDelta) =>
                              adjustEntityStat(
                                player,
                                'pv_current',
                                pvDelta,
                                player.pv_max
                              )
                            }
                            onChangeDying={(succ, fail) =>
                              onUpdateCharacter({
                                ...player,
                                inventory: buildInventoryWithMeta(player, {
                                  dyingSuccesses: succ,
                                  dyingFailures: fail,
                                }) as any,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Rolador de Dados do Mestre (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-bg-card border border-secondary-uv/40 rounded-xl p-5 sticky top-24 space-y-4 shadow-uv-glow">
            <div className="flex items-center justify-between border-b border-muted-ash/15 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-uv">
                  Dados do Sistema ANE
                </span>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Dices className="w-5 h-5 text-secondary-uv" />
                  Rolador do Mestre
                </h3>
              </div>
              {rollHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  title="Limpar rolagens"
                  className="p-1.5 text-muted-ash hover:text-text-main"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-ash block">
                Rolagem Avulsa por Grau de Atributo:
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      rollAttributeOrSkill({
                        characterName: 'Mestre',
                        label: `Atributo Nível ${lvl}`,
                        attributeKey: 'FOR',
                        attributeValue: lvl,
                      })
                    }
                    className="p-2 rounded-lg bg-bg-main hover:bg-secondary-uv/25 border border-muted-ash/25 hover:border-secondary-uv text-center transition-all"
                  >
                    <div className="text-sm font-bold font-mono text-text-main">Nv {lvl}</div>
                    <div className="text-[9px] font-mono text-secondary-uv">
                      {ATTRIBUTE_DICE_FORMULA[lvl]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {lastRoll ? (
              <div className="bg-bg-main border-2 border-secondary-uv rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-main">
                    {lastRoll.characterName} — {lastRoll.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-secondary-uv">{lastRoll.formula}</span>
                  <span className="text-3xl font-extrabold font-mono text-text-main">
                    {lastRoll.finalTotal}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-ash pt-2 border-t border-muted-ash/15">
                  d20: [{lastRoll.d20Rolls.join(', ')}]
                  {lastRoll.bonusDieType &&
                    ` | ${lastRoll.bonusDieType}: [${lastRoll.bonusDieRoll}]`}
                </div>
              </div>
            ) : (
              <div className="bg-bg-main/60 border border-dashed border-muted-ash/25 rounded-xl p-6 text-center text-xs text-muted-ash">
                Clique nos atributos de um Infectado, Jogador ou nos botões acima para rolar os dados.
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-muted-ash">
                Histórico ({rollHistory.length})
              </span>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {rollHistory.map((r) => (
                  <div
                    key={r.id}
                    className="bg-bg-main border border-muted-ash/15 rounded-lg p-2.5 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-text-main">
                        {r.characterName}: {r.label}
                      </div>
                      <div className="text-[10px] font-mono text-muted-ash">
                        {r.formula} • {r.timestamp}
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono px-2.5 py-1 rounded bg-bg-card border border-secondary-uv/40 text-text-main">
                      {r.finalTotal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
