import React, { useState } from 'react';
import {
  Dices,
  RotateCcw,
  Award,
  User,
} from 'lucide-react';
import { Character, SkillRank } from '../../types/database';
import {
  AttributeKey,
  ATTRIBUTE_DICE_FORMULA,
  SKILL_RANK_LABELS,
  useDiceRoller,
} from '../../hooks/useDiceRoller';
import { ALL_ANE_SKILLS, getInfectionStageInfo } from '../../data/aneSystemRules';

interface DiceRollerViewProps {
  characters: Character[];
}

export const DiceRollerView: React.FC<DiceRollerViewProps> = ({ characters }) => {
  const playerChars = characters.filter((c) => !c.is_npc);
  const [selectedCharId, setSelectedCharId] = useState<string>(
    playerChars[0]?.id || 'free-roll'
  );
  const [flatModifier, setFlatModifier] = useState<number>(0);
  const [customAttrLevel, setCustomAttrLevel] = useState<number>(2);
  const [customSkillRank, setCustomSkillRank] = useState<SkillRank>(0);

  const { lastRoll, rollHistory, rollAttributeOrSkill, clearHistory } = useDiceRoller();

  const activeChar = playerChars.find((c) => c.id === selectedCharId);

  const handleFreeRoll = (lvl: number) => {
    setCustomAttrLevel(lvl);
    rollAttributeOrSkill({
      characterName: activeChar ? activeChar.name : 'Rolagem Livre',
      label: `Teste de Atributo Nível ${lvl}`,
      attributeKey: 'FOR',
      attributeValue: lvl,
      skillRank: customSkillRank,
      flatModifier,
    });
  };

  const handleCharRoll = (
    label: string,
    attr: AttributeKey,
    skillRank: SkillRank = 0,
    skillKey?: string
  ) => {
    if (!activeChar) return;
    const attrMap: Record<AttributeKey, number> = {
      FOR: activeChar.attr_for,
      AGI: activeChar.attr_agi,
      INT: activeChar.attr_int,
      PRE: activeChar.attr_pre,
      VIG: activeChar.attr_vig,
    };

    const inf = getInfectionStageInfo(activeChar.infection_level);
    let sysMod = 0;
    if (activeChar.fatigue >= 2) sysMod -= 2;
    else if (
      activeChar.fatigue === 1 &&
      (attr === 'FOR' || attr === 'AGI' || attr === 'VIG')
    ) {
      sysMod -= 2;
    }
    if (attr === 'FOR') sysMod += inf.forBonus;
    if (attr === 'INT') sysMod += inf.intPenalty;
    if (skillKey === 'Diplomacia' || skillKey === 'Lideranca') {
      sysMod += inf.socialPenalty;
    }

    rollAttributeOrSkill({
      characterName: activeChar.name,
      label,
      attributeKey: attr,
      attributeValue: attrMap[attr],
      skillRank,
      flatModifier: flatModifier + sysMod,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-secondary-uv">
            ANE // Rolador de Dados Oficial
          </span>
          <h2 className="text-2xl font-bold text-text-main mt-0.5">
            Central de Rolagens de Dados
          </h2>
          <p className="text-xs text-muted-ash mt-1">
            Role dados de Atributo (1 a 5), some bônus de Perícia (+0, +2, +5) e aplique Modificadores de Circunstância.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-secondary-uv" />
          <select
            value={selectedCharId}
            onChange={(e) => setSelectedCharId(e.target.value)}
            className="bg-bg-main border border-muted-ash/30 rounded-lg px-3.5 py-2 text-xs font-semibold text-text-main focus:outline-none focus:border-secondary-uv"
          >
            <option value="free-roll">Rolagem Livre (Sem Ficha)</option>
            {playerChars.map((c) => (
              <option key={c.id} value={c.id}>
                Ficha: {c.name} ({c.archetype})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: Controles de Rolagem Livre e por Personagem (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Rolador Rápido por Grau de Atributo (1 a 5) */}
          <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-main">
              Rolagem Direta por Valor de Atributo (1 a 5)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleFreeRoll(lvl)}
                  className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-2 ${
                    customAttrLevel === lvl
                      ? 'bg-secondary-uv/25 border-secondary-uv shadow-uv-glow'
                      : 'bg-bg-main border-muted-ash/25 hover:border-secondary-uv'
                  }`}
                >
                  <span className="text-xs font-mono text-muted-ash">
                    Atributo {lvl}
                  </span>
                  <span className="text-lg font-extrabold font-mono text-text-main">
                    {ATTRIBUTE_DICE_FORMULA[lvl]}
                  </span>
                  <span className="text-[11px] font-semibold text-secondary-uv flex items-center gap-1">
                    <Dices className="w-3.5 h-3.5" /> Rolar
                  </span>
                </button>
              ))}
            </div>

            {/* Seleção de Grau de Perícia e Modificador Circunstancial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-muted-ash/15">
              <div>
                <span className="text-xs text-muted-ash block mb-1.5">
                  Grau de Perícia p/ Rolagem Livre:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {([0, 1, 2] as SkillRank[]).map((rk) => (
                    <button
                      key={rk}
                      type="button"
                      onClick={() => setCustomSkillRank(rk)}
                      className={`py-2 px-2 rounded-lg border text-xs font-mono transition-all ${
                        customSkillRank === rk
                          ? 'bg-primary-blood text-text-main border-primary-blood font-bold'
                          : 'bg-bg-main text-muted-ash border-muted-ash/25'
                      }`}
                    >
                      {SKILL_RANK_LABELS[rk].name} (+{SKILL_RANK_LABELS[rk].bonus})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-ash block mb-1.5">
                  Modificador de Circunstância:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[-5, -2, 0, 2, 5].map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setFlatModifier(mod)}
                      className={`py-2 rounded-lg border text-xs font-mono transition-all ${
                        flatModifier === mod
                          ? 'bg-secondary-uv text-text-main border-secondary-uv font-bold'
                          : 'bg-bg-main text-muted-ash border-muted-ash/25'
                      }`}
                    >
                      {mod >= 0 ? `+${mod}` : mod}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Se houver ficha selecionada: Atalhos de todas as 28 Perícias da Ficha */}
          {activeChar && (
            <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                  <Award className="w-4 h-4 text-secondary-uv" />
                  Rolagens da Ficha: {activeChar.name}
                </h3>
                <span className="text-xs font-mono text-muted-ash">
                  FOR {activeChar.attr_for} • AGI {activeChar.attr_agi} • INT {activeChar.attr_int} • PRE {activeChar.attr_pre} • VIG {activeChar.attr_vig}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
                {ALL_ANE_SKILLS.map((sk) => {
                  const rank: SkillRank = (activeChar.skills?.[sk.key] ?? 0) as SkillRank;
                  const bonus = SKILL_RANK_LABELS[rank].bonus;

                  return (
                    <button
                      key={sk.key}
                      type="button"
                      onClick={() =>
                        handleCharRoll(`${sk.label} (${sk.attr})`, sk.attr, rank, sk.key)
                      }
                      className="p-2.5 rounded-xl bg-bg-main border border-muted-ash/20 hover:border-secondary-uv text-left flex items-center justify-between transition-all"
                    >
                      <div>
                        <div className="text-xs font-bold text-text-main">{sk.label}</div>
                        <div className="text-[10px] font-mono text-muted-ash">
                          {sk.attr} • +{bonus}
                        </div>
                      </div>
                      <Dices className="w-4 h-4 text-secondary-uv shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Visor do Último Resultado + Histórico Completo (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-bg-card border border-secondary-uv/40 rounded-xl p-5 space-y-5 shadow-uv-glow">
            <div className="flex items-center justify-between border-b border-muted-ash/15 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-uv">
                  Resultado em Tempo Real
                </span>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Dices className="w-5 h-5 text-secondary-uv" />
                  Visor de Dados
                </h3>
              </div>
              {rollHistory.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="p-1.5 text-muted-ash hover:text-text-main"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Referência de Dificuldades (DT) */}
            <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-mono bg-bg-main p-2.5 rounded-lg border border-muted-ash/15">
              <div>
                <div className="text-muted-ash">Rotin.</div>
                <div className="font-bold text-text-main">DT 8</div>
              </div>
              <div>
                <div className="text-muted-ash">Fácil</div>
                <div className="font-bold text-text-main">DT 10</div>
              </div>
              <div>
                <div className="text-secondary-uv">Mod.</div>
                <div className="font-bold text-secondary-uv">DT 15</div>
              </div>
              <div>
                <div className="text-warning-rust">Difícil</div>
                <div className="font-bold text-warning-rust">DT 20</div>
              </div>
              <div>
                <div className="text-primary-blood">Extr.</div>
                <div className="font-bold text-primary-blood">DT 25</div>
              </div>
              <div>
                <div className="text-red-400">Excep.</div>
                <div className="font-bold text-red-400">DT 30</div>
              </div>
            </div>

            {lastRoll ? (
              <div className="bg-bg-main border-2 border-secondary-uv rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-main">
                    {lastRoll.characterName} — {lastRoll.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-secondary-uv">{lastRoll.formula}</span>
                  <span className="text-4xl font-extrabold font-mono text-text-main">
                    {lastRoll.finalTotal}
                  </span>
                </div>

                <div className="pt-2 border-t border-muted-ash/15 text-xs font-mono text-muted-ash space-y-1">
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
              <div className="bg-bg-main/60 border border-dashed border-muted-ash/25 rounded-xl p-8 text-center text-xs text-muted-ash">
                Selecione um Atributo ou Perícia ao lado para lançar os dados.
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-ash">
                Histórico de Rolagens ({rollHistory.length})
              </span>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {rollHistory.map((roll) => (
                  <div
                    key={roll.id}
                    className="bg-bg-main border border-muted-ash/15 rounded-lg p-3 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-text-main">
                        {roll.characterName}: {roll.label}
                      </div>
                      <div className="text-[10px] font-mono text-muted-ash">
                        {roll.formula} • {roll.timestamp}
                      </div>
                    </div>
                    <span className="text-lg font-bold font-mono px-3 py-1 rounded bg-bg-card border border-secondary-uv/40 text-text-main">
                      {roll.finalTotal}
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
