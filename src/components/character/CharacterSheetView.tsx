import React, { useState } from 'react';
import {
  Dices,
  Heart,
  Brain,
  Biohazard,
  Shield,
  Zap,
  Skull,
  RotateCcw,
  Award,
  UserPlus,
  Utensils,
  Droplets,
  AlertTriangle,
} from 'lucide-react';
import { Character, SkillRank } from '../../types/database';
import {
  AttributeKey,
  ATTRIBUTE_DICE_FORMULA,
  SKILL_RANK_LABELS,
  useDiceRoller,
} from '../../hooks/useDiceRoller';
import { ALL_ANE_SKILLS } from '../../hooks/useCharacterCreator';
import { CharacterCreationWizard } from './CharacterCreationWizard';
import { SpatialGridInventory } from './SpatialGridInventory';

interface CharacterSheetViewProps {
  characters: Character[];
  campaigns: Array<{ id: string; name: string }>;
  onUpdateCharacter: (updated: Character) => void;
  onCreateCharacter: (params: any) => Promise<any>;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  characters,
  campaigns,
  onUpdateCharacter,
  onCreateCharacter,
}) => {
  const playerChars = characters.filter((c) => !c.is_npc);
  const [selectedId, setSelectedId] = useState<string>(playerChars[0]?.id || '');
  const [showWizard, setShowWizard] = useState<boolean>(playerChars.length === 0);
  const [flatModifier, setFlatModifier] = useState<number>(0);
  const [applyFatiguePenalty, setApplyFatiguePenalty] = useState<boolean>(true);

  const { lastRoll, rollHistory, rollAttributeOrSkill, clearHistory } = useDiceRoller();

  const activeChar =
    playerChars.find((c) => c.id === selectedId) || playerChars[0];

  // Se o usuário clicou em "+ Novo Personagem (Estilo CRIS)" ou ainda não possui fichas
  if (showWizard || !activeChar) {
    return (
      <CharacterCreationWizard
        campaigns={campaigns}
        onCancel={playerChars.length > 0 ? () => setShowWizard(false) : undefined}
        onCompleteCreation={async (payload) => {
          const created = await onCreateCharacter(payload);
          if (created?.id) {
            setSelectedId(created.id);
          }
          setShowWizard(false);
        }}
      />
    );
  }

  const getAttrValue = (attr: AttributeKey): number => {
    switch (attr) {
      case 'FOR':
        return activeChar.attr_for;
      case 'AGI':
        return activeChar.attr_agi;
      case 'INT':
        return activeChar.attr_int;
      case 'PRE':
        return activeChar.attr_pre;
      case 'VIG':
        return activeChar.attr_vig;
    }
  };

  const setAttrValue = (attr: AttributeKey, nextVal: number) => {
    const clamped = Math.max(1, Math.min(5, nextVal));
    const fieldMap: Record<AttributeKey, keyof Character> = {
      FOR: 'attr_for',
      AGI: 'attr_agi',
      INT: 'attr_int',
      PRE: 'attr_pre',
      VIG: 'attr_vig',
    };

    const updated: Character = {
      ...activeChar,
      [fieldMap[attr]]: clamped,
    };

    // Recalcula derivados segundo a regra oficial:
    // PV = 30 + (VIG * 2) | SAN = 50 + (PRE * 10) | LF = 10 + VIG | DEF = 10 + AGI | INI = AGI + 1
    updated.pv_max = 30 + updated.attr_vig * 2;
    updated.san_max = 50 + updated.attr_pre * 10;
    updated.wound_threshold = 10 + updated.attr_vig;
    updated.defense = 10 + updated.attr_agi;
    updated.initiative = updated.attr_agi + 1;

    onUpdateCharacter(updated);
  };

  const cycleSkillRank = (skillKey: string) => {
    const currentRank: SkillRank = (activeChar.skills?.[skillKey] ?? 0) as SkillRank;
    const nextRank: SkillRank = ((currentRank + 1) % 3) as SkillRank;
    onUpdateCharacter({
      ...activeChar,
      skills: {
        ...activeChar.skills,
        [skillKey]: nextRank,
      },
    });
  };

  const triggerRoll = (label: string, attr: AttributeKey, skillRank: SkillRank = 0) => {
    const attrVal = getAttrValue(attr);
    const effectiveMod =
      flatModifier - (applyFatiguePenalty ? activeChar.fatigue : 0);

    rollAttributeOrSkill({
      characterName: activeChar.name,
      label,
      attributeKey: attr,
      attributeValue: attrVal,
      skillRank,
      flatModifier: effectiveMod,
    });
  };

  const adjustStat = (
    field: 'pv_current' | 'san_current' | 'infection_level' | 'food_portions' | 'water_portions' | 'fatigue',
    delta: number,
    max: number
  ) => {
    const next = Math.max(0, Math.min(max, (activeChar[field] as number) + delta));
    onUpdateCharacter({
      ...activeChar,
      [field]: next,
    });
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Ficha e Botão para Abrir o Criador Estilo CRIS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card border border-muted-ash/20 rounded-xl p-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-secondary-uv">
            ANE // Ficha Dinâmica, Rolador de Dados & Inventário Espacial
          </span>
          <h2 className="text-xl font-bold text-text-main mt-0.5">
            {activeChar.name} — <span className="text-muted-ash font-normal">{activeChar.archetype}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeChar.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-bg-main border border-muted-ash/30 rounded-lg px-3.5 py-2 text-xs font-semibold text-text-main focus:outline-none focus:border-secondary-uv"
          >
            {playerChars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.archetype})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="px-3.5 py-2 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-xs font-bold flex items-center gap-1.5 shadow-blood-glow transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Novo Personagem (Wizard CRIS)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: Atributos, Derivados e Perícias (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Atributos Base (1 a 5) */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-main">
                Atributos (FOR, AGI, INT, PRE, VIG)
              </h3>
              <span className="text-[11px] font-mono text-muted-ash">
                1=1d20 | 2=+1d6 | 3=+1d8 | 4=+1d12 | 5=2d20
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['FOR', 'AGI', 'INT', 'PRE', 'VIG'] as AttributeKey[]).map((attr) => {
                const val = getAttrValue(attr);
                const diceFormula = ATTRIBUTE_DICE_FORMULA[val];
                return (
                  <div
                    key={attr}
                    className="bg-bg-main border border-muted-ash/20 rounded-xl p-3.5 flex flex-col items-center justify-between space-y-2.5"
                  >
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-ash">
                      {attr}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAttrValue(attr, val - 1)}
                        className="w-6 h-6 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-text-main"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold font-mono text-text-main w-6 text-center">
                        {val}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttrValue(attr, val + 1)}
                        className="w-6 h-6 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-text-main"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-secondary-uv font-semibold">
                      {diceFormula}
                    </span>

                    <button
                      type="button"
                      onClick={() => triggerRoll(`Atributo ${attr}`, attr, 0)}
                      className="w-full py-1.5 px-2 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-uv-glow"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      Rolar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Estatísticas Derivadas e Status de Sobrevivência */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-main">
              Estatísticas Derivadas & Biomarcadores
            </h3>

            {/* DEF (10+AGI), LF (10+VIG), INI (AGI+1) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-bg-main border border-muted-ash/20 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs text-muted-ash flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-secondary-uv" /> DEF (10+AGI)
                </span>
                <span className="text-lg font-mono font-bold text-text-main">
                  {activeChar.defense}
                </span>
              </div>

              <div className="bg-bg-main border border-muted-ash/20 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs text-muted-ash flex items-center gap-1.5">
                  <Skull className="w-4 h-4 text-primary-blood" /> LF (10+VIG)
                </span>
                <span className="text-lg font-mono font-bold text-text-main">
                  {activeChar.wound_threshold}
                </span>
              </div>

              <div className="bg-bg-main border border-muted-ash/20 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs text-muted-ash flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-warning-rust" /> INI (AGI+1)
                </span>
                <span className="text-lg font-mono font-bold text-text-main">
                  +{activeChar.initiative}
                </span>
              </div>
            </div>

            {/* PV, SAN e Infecção */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-bg-main border border-primary-blood/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-main flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-primary-blood" /> PV
                  </span>
                  <span className="font-mono font-bold">
                    {activeChar.pv_current} / {activeChar.pv_max}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-blood transition-all"
                    style={{
                      width: `${Math.round((activeChar.pv_current / Math.max(1, activeChar.pv_max)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => adjustStat('pv_current', -1, activeChar.pv_max)}
                    className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-primary-blood"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustStat('pv_current', 1, activeChar.pv_max)}
                    className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-primary-blood"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="bg-bg-main border border-warning-rust/40 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-main flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-warning-rust" /> Sanidade (SAN)
                  </span>
                  <span className="font-mono font-bold">
                    {activeChar.san_current} / {activeChar.san_max}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning-rust transition-all"
                    style={{
                      width: `${Math.round((activeChar.san_current / Math.max(1, activeChar.san_max)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => adjustStat('san_current', -2, activeChar.san_max)}
                    className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-warning-rust"
                  >
                    -2
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustStat('san_current', 2, activeChar.san_max)}
                    className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-warning-rust"
                  >
                    +2
                  </button>
                </div>
              </div>

              <div className="bg-bg-main border border-primary-blood/50 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-main flex items-center gap-1.5">
                    <Biohazard className="w-4 h-4 text-primary-blood" /> Infecção
                  </span>
                  <span className="font-mono font-bold text-primary-blood">
                    {activeChar.infection_level}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-blood transition-all"
                    style={{ width: `${activeChar.infection_level}%` }}
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => adjustStat('infection_level', -5, 100)}
                    className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-primary-blood"
                  >
                    -5%
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustStat('infection_level', 5, 100)}
                    className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/25 text-xs hover:border-primary-blood"
                  >
                    +5%
                  </button>
                </div>
              </div>
            </div>

            {/* Porções de Comida, Água e Fadiga */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-muted-ash/15 text-xs">
              <div className="bg-bg-main rounded-lg p-2.5 border border-warning-rust/30 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-warning-rust" />
                  Comida: <strong>{activeChar.food_portions}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => adjustStat('food_portions', -1, 20)}
                    className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustStat('food_portions', 1, 20)}
                    className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-bg-main rounded-lg p-2.5 border border-secondary-uv/30 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-secondary-uv" />
                  Água: <strong>{activeChar.water_portions}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => adjustStat('water_portions', -1, 20)}
                    className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustStat('water_portions', 1, 20)}
                    className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-bg-main rounded-lg p-2.5 border border-primary-blood/30 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-primary-blood" />
                  Fadiga: <strong>{activeChar.fatigue}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => adjustStat('fatigue', -1, 10)}
                    className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustStat('fatigue', 1, 10)}
                    className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/25"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Lista de Perícias */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary-uv" />
                Perícias (Destreinado +0 • Treinado +2 • Especialista +5)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {ALL_ANE_SKILLS.map((skill) => {
                const rank: SkillRank = (activeChar.skills?.[skill.key] ?? 0) as SkillRank;
                const rankInfo = SKILL_RANK_LABELS[rank];
                const attrVal = getAttrValue(skill.attr);

                return (
                  <div
                    key={skill.key}
                    className="bg-bg-main border border-muted-ash/15 hover:border-muted-ash/40 rounded-lg p-3 flex items-center justify-between gap-2 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-main">
                          {skill.label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/20 text-muted-ash">
                          {skill.attr} ({attrVal})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => cycleSkillRank(skill.key)}
                        className={`mt-1 inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          rank === 2
                            ? 'bg-primary-blood/25 border-primary-blood text-text-main'
                            : rank === 1
                            ? 'bg-secondary-uv/25 border-secondary-uv text-text-main'
                            : 'bg-bg-card border-muted-ash/20 text-muted-ash'
                        }`}
                      >
                        {rankInfo.name} (+{rankInfo.bonus})
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerRoll(`${skill.label}`, skill.attr, rank)}
                      className="px-3 py-1.5 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-uv-glow transition-all"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      Rolar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Console do Rolador de Dados ANE (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-bg-card border border-secondary-uv/40 rounded-xl p-5 sticky top-24 space-y-5 shadow-uv-glow">
            <div className="flex items-center justify-between border-b border-muted-ash/15 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-uv">
                  Motor de Dados ANE
                </span>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Dices className="w-5 h-5 text-secondary-uv" />
                  Terminal de Rolagens
                </h3>
              </div>
              {rollHistory.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  title="Limpar histórico"
                  className="p-1.5 rounded text-muted-ash hover:text-text-main"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="bg-bg-main border border-muted-ash/20 rounded-lg p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-ash font-medium">Modificador Extra:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFlatModifier((m) => m - 1)}
                    className="w-6 h-6 rounded bg-bg-card border border-muted-ash/25 font-mono"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold w-8 text-center text-sm text-text-main">
                    {flatModifier >= 0 ? `+${flatModifier}` : flatModifier}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFlatModifier((m) => m + 1)}
                    className="w-6 h-6 rounded bg-bg-card border border-muted-ash/25 font-mono"
                  >
                    +
                  </button>
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-muted-ash/15">
                <span className="text-muted-ash">
                  Aplicar Fadiga atual (<strong className="text-primary-blood">-{activeChar.fatigue}</strong>)
                </span>
                <input
                  type="checkbox"
                  checked={applyFatiguePenalty}
                  onChange={(e) => setApplyFatiguePenalty(e.target.checked)}
                  className="accent-secondary-uv w-4 h-4"
                />
              </label>
            </div>

            {lastRoll ? (
              <div className="bg-bg-main border-2 border-secondary-uv rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-main">{lastRoll.label}</span>
                  <span className="font-mono text-muted-ash">
                    {lastRoll.attributeKey} {lastRoll.attributeValue}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-secondary-uv">{lastRoll.formula}</span>
                  <span className="text-3xl font-extrabold font-mono text-text-main">
                    {lastRoll.finalTotal}
                  </span>
                </div>

                <div className="pt-2 border-t border-muted-ash/15 text-[11px] font-mono text-muted-ash space-y-1">
                  <div>
                    d20: <strong className="text-text-main">[{lastRoll.d20Rolls.join(', ')}]</strong>
                    {lastRoll.bonusDieType && (
                      <>
                        {' '}
                        | {lastRoll.bonusDieType}:{' '}
                        <strong className="text-secondary-uv">[{lastRoll.bonusDieRoll}]</strong>
                      </>
                    )}
                  </div>
                  <div>
                    Perícia: +{lastRoll.skillBonus} | Mod: {lastRoll.flatModifier >= 0 ? `+${lastRoll.flatModifier}` : lastRoll.flatModifier}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-bg-main/60 border border-dashed border-muted-ash/25 rounded-xl p-6 text-center text-xs text-muted-ash">
                Clique em <strong>Rolar</strong> em qualquer Atributo ou Perícia para acionar o motor de dados ANE.
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-ash">
                Histórico ({rollHistory.length})
              </span>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {rollHistory.map((roll) => (
                  <div
                    key={roll.id}
                    className="bg-bg-main border border-muted-ash/15 rounded-lg p-2.5 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-text-main">{roll.label}</div>
                      <div className="text-[10px] font-mono text-muted-ash">
                        {roll.formula} • {roll.timestamp}
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono px-2.5 py-1 rounded bg-bg-card border border-secondary-uv/40 text-text-main">
                      {roll.finalTotal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULO 2: INVENTÁRIO EM GRADE ESPACIAL (8x6 SURVIVAL HORROR) */}
      <SpatialGridInventory />
    </div>
  );
};
