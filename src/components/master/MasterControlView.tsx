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
} from 'lucide-react';
import { Campaign, Character } from '../../types/database';
import {
  AttributeKey,
  ATTRIBUTE_DICE_FORMULA,
  useDiceRoller,
} from '../../hooks/useDiceRoller';

interface MasterControlViewProps {
  campaigns: Campaign[];
  characters: Character[];
  currentUserId: string;
  onCreateCharacter: (params: {
    name: string;
    archetype: string;
    campaign_id: string | null;
    is_npc: boolean;
    pv_max?: number;
    san_max?: number;
    attr_for?: number;
    attr_agi?: number;
    attr_int?: number;
    attr_pre?: number;
    attr_vig?: number;
  }) => Promise<any>;
  onUpdateCharacter: (updated: Character) => Promise<any>;
  onDeleteCharacter: (id: string) => Promise<any>;
}

export const MasterControlView: React.FC<MasterControlViewProps> = ({
  campaigns,
  characters,
  currentUserId,
  onCreateCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
}) => {
  const masterCampaigns = campaigns.filter((c) => c.master_id === currentUserId);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    masterCampaigns[0]?.id || campaigns[0]?.id || ''
  );

  // Formulário para criar Monstro / Ameaça
  const [monsterName, setMonsterName] = useState('');
  const [monsterType, setMonsterType] = useState('Infectado Estágio 2');
  const [monsterPv, setMonsterPv] = useState<number>(25);
  const [mFor, setMFor] = useState<number>(3);
  const [mAgi, setMAgi] = useState<number>(3);
  const [mInt, setMInt] = useState<number>(1);
  const [mPre, setMPre] = useState<number>(2);
  const [mVig, setMVig] = useState<number>(3);

  const { lastRoll, rollHistory, rollAttributeOrSkill, clearHistory } = useDiceRoller();

  // Filtrar fichas e monstros pela campanha selecionada (ou mostrar todos se não houver filtro)
  const filteredCharacters = characters.filter((c) =>
    selectedCampaignId ? c.campaign_id === selectedCampaignId : true
  );

  const monsters = filteredCharacters.filter((c) => c.is_npc);
  const players = filteredCharacters.filter((c) => !c.is_npc);

  const handleCreateMonster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monsterName.trim()) return;

    await onCreateCharacter({
      name: monsterName.trim(),
      archetype: monsterType.trim() || 'Monstro / Ameaça',
      campaign_id: selectedCampaignId || null,
      is_npc: true,
      pv_max: Number(monsterPv) || 25,
      san_max: 0,
      attr_for: mFor,
      attr_agi: mAgi,
      attr_int: mInt,
      attr_pre: mPre,
      attr_vig: mVig,
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

    rollAttributeOrSkill({
      characterName: entity.name,
      label: `Teste de ${attr}`,
      attributeKey: attr,
      attributeValue: map[attr],
      skillRank: 0,
      flatModifier: entity.is_npc ? 0 : -entity.fatigue,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Escudo do Mestre */}
      <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-primary-blood flex items-center gap-1.5">
            <Crown className="w-4 h-4" />
            Controle Total do Mestre // Sem Mapa VTT
          </span>
          <h2 className="text-xl font-bold text-text-main mt-0.5">
            Gerenciador de Monstros, Fichas da Mesa & Rolagens
          </h2>
          <p className="text-xs text-muted-ash mt-1">
            Crie criaturas, aplique dano/sanidade/infecção diretamente nas fichas dos jogadores e role dados para qualquer entidade.
          </p>
        </div>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: Criador de Monstros, Lista de Monstros e Controle de Jogadores (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Criador de Monstros / Ameaças */}
          <form
            onSubmit={handleCreateMonster}
            className="bg-bg-card border border-primary-blood/40 rounded-xl p-5 space-y-4 shadow-blood-glow"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <Skull className="w-4 h-4 text-primary-blood" />
                Adicionar Monstro / NPC Hostil
              </h3>
              <span className="text-[11px] font-mono text-muted-ash">
                Atributos de 1 (1d20) a 5 (2d20)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-muted-ash mb-1">Nome da Criatura</label>
                <input
                  type="text"
                  required
                  value={monsterName}
                  onChange={(e) => setMonsterName(e.target.value)}
                  placeholder="Ex: Aberração Noturna"
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-blood"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-ash mb-1">Classificação / Estágio</label>
                <input
                  type="text"
                  value={monsterType}
                  onChange={(e) => setMonsterType(e.target.value)}
                  placeholder="Ex: Infectado Estágio 3"
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-blood"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-ash mb-1">Pontos de Vida (PV Máx)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={monsterPv}
                  onChange={(e) => setMonsterPv(Number(e.target.value))}
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-primary-blood"
                />
              </div>
            </div>

            {/* Atributos do Monstro */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'FOR', val: mFor, set: setMFor },
                { label: 'AGI', val: mAgi, set: setMAgi },
                { label: 'INT', val: mInt, set: setMInt },
                { label: 'PRE', val: mPre, set: setMPre },
                { label: 'VIG', val: mVig, set: setMVig },
              ].map((attr) => (
                <div
                  key={attr.label}
                  className="bg-bg-main border border-muted-ash/20 rounded-lg p-2 text-center"
                >
                  <label className="block text-[10px] font-mono text-muted-ash">
                    {attr.label}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={attr.val}
                    onChange={(e) =>
                      attr.set(Math.max(1, Math.min(5, Number(e.target.value))))
                    }
                    className="w-full bg-transparent text-center font-mono font-bold text-sm text-text-main focus:outline-none mt-0.5"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Invocar Monstro na Mesa
              </button>
            </div>
          </form>

          {/* 2. Controle de Monstros Ativos */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <Skull className="w-4 h-4 text-primary-blood" />
                Monstros & Ameaças Ativas ({monsters.length})
              </h3>
            </div>

            {monsters.length === 0 ? (
              <p className="text-xs text-muted-ash text-center py-6 bg-bg-main/50 rounded-lg border border-dashed border-muted-ash/20">
                Nenhum monstro registrado. Utilize o painel acima para criar criaturas e rolar seus ataques.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monsters.map((monster) => {
                  const pvPct = Math.round(
                    (monster.pv_current / Math.max(1, monster.pv_max)) * 100
                  );
                  return (
                    <div
                      key={monster.id}
                      className="bg-bg-main border border-primary-blood/40 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-text-main flex items-center gap-1.5">
                            <Skull className="w-4 h-4 text-primary-blood" />
                            {monster.name}
                          </h4>
                          <p className="text-[11px] text-muted-ash">{monster.archetype}</p>
                        </div>
                        <button
                          onClick={() => onDeleteCharacter(monster.id)}
                          title="Remover monstro"
                          className="p-1 text-muted-ash hover:text-primary-blood"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* PV do Monstro */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-text-main font-medium">
                            <Heart className="w-3.5 h-3.5 text-primary-blood" /> PV:
                            <strong className="font-mono ml-1">
                              {monster.pv_current}/{monster.pv_max}
                            </strong>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                adjustEntityStat(monster, 'pv_current', -5, monster.pv_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-[11px] hover:border-primary-blood"
                            >
                              -5
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                adjustEntityStat(monster, 'pv_current', -1, monster.pv_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-[11px] hover:border-primary-blood"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                adjustEntityStat(monster, 'pv_current', 1, monster.pv_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-[11px] hover:border-primary-blood"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                adjustEntityStat(monster, 'pv_current', 5, monster.pv_max)
                              }
                              className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-[11px] hover:border-primary-blood"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-bg-card rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-blood transition-all"
                            style={{ width: `${pvPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Defesa e Limite */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-ash pt-1">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-secondary-uv" /> DEF {monster.defense}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-warning-rust" /> INI +{monster.initiative}
                        </span>
                        <span>LF {monster.wound_threshold}</span>
                      </div>

                      {/* Botões de Rolagem Rápida dos Atributos do Monstro */}
                      <div className="pt-2 border-t border-muted-ash/15 grid grid-cols-5 gap-1.5">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Controle Total do Mestre sobre as Fichas dos Jogadores */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary-uv" />
              Fichas dos Jogadores ({players.length}) — Controle Direto do Mestre
            </h3>

            {players.length === 0 ? (
              <p className="text-xs text-muted-ash text-center py-6 bg-bg-main/50 rounded-lg border border-dashed border-muted-ash/20">
                Nenhuma ficha de jogador criada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-bg-main border border-muted-ash/20 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-text-main">{player.name}</h4>
                        <span className="text-xs text-muted-ash">
                          {player.archetype} • DEF {player.defense} • LF {player.wound_threshold}
                        </span>
                      </div>

                      {/* Rolagem pelo Mestre para o Jogador */}
                      <div className="flex items-center gap-1">
                        {(['FOR', 'AGI', 'INT', 'PRE', 'VIG'] as AttributeKey[]).map((attr) => (
                          <button
                            key={attr}
                            type="button"
                            onClick={() => rollForEntity(player, attr)}
                            className="px-2 py-1 rounded bg-bg-card hover:border-secondary-uv border border-muted-ash/25 text-[11px] font-mono text-text-main"
                          >
                            {attr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Controles Rápidos de PV, SAN, Infecção e Fadiga pelo Mestre */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-muted-ash/15 text-xs">
                      {/* PV */}
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

                      {/* SAN */}
                      <div className="bg-bg-card p-2.5 rounded-lg border border-warning-rust/30 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium">
                          <Brain className="w-3.5 h-3.5 text-warning-rust" />
                          SAN: {player.san_current}/{player.san_max}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              adjustEntityStat(player, 'san_current', -1, player.san_max)
                            }
                            className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                          >
                            -
                          </button>
                          <button
                            onClick={() =>
                              adjustEntityStat(player, 'san_current', 1, player.san_max)
                            }
                            className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Infecção */}
                      <div className="bg-bg-card p-2.5 rounded-lg border border-primary-blood/30 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-medium">
                          <Biohazard className="w-3.5 h-3.5 text-primary-blood" />
                          Infec: {player.infection_level}%
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              adjustEntityStat(player, 'infection_level', -5, 100)
                            }
                            className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                          >
                            -5
                          </button>
                          <button
                            onClick={() =>
                              adjustEntityStat(player, 'infection_level', 5, 100)
                            }
                            className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Fadiga */}
                      <div className="bg-bg-card p-2.5 rounded-lg border border-muted-ash/20 flex items-center justify-between">
                        <span className="font-medium">Fadiga: {player.fatigue}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => adjustEntityStat(player, 'fatigue', -1, 10)}
                            className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                          >
                            -
                          </button>
                          <button
                            onClick={() => adjustEntityStat(player, 'fatigue', 1, 10)}
                            className="px-1.5 py-0.5 rounded bg-bg-main border border-muted-ash/25"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                  Rolador da Mesa
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

            {/* Botões de Rolagem Rápida por Nível de Atributo (1 a 5) */}
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

            {/* Resultado Atual */}
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
                Clique nos atributos de um Monstro, Jogador ou nos botões acima para rolar os dados.
              </div>
            )}

            {/* Histórico */}
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
