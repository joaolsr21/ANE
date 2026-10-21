import { useState, useCallback } from 'react';
import { SkillRank } from '../types/database';

export type AttributeKey = 'FOR' | 'AGI' | 'INT' | 'PRE' | 'VIG';

export interface DiceRollResult {
  id: string;
  characterName: string;
  label: string; // Ex: "Medicina (INT)" ou "Teste de Força"
  attributeKey: AttributeKey;
  attributeValue: number;
  formula: string; // Ex: "1d20 + 1d8 + 2"
  d20Rolls: number[];
  bonusDieType: 'd6' | 'd8' | 'd12' | null;
  bonusDieRoll: number | null;
  skillRank: SkillRank;
  skillBonus: number;
  flatModifier: number;
  baseDiceTotal: number;
  finalTotal: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  timestamp: string;
}

export const SKILL_RANK_LABELS: Record<SkillRank, { name: string; bonus: number }> = {
  0: { name: 'Destreinado', bonus: 0 },
  1: { name: 'Treinado', bonus: 2 },
  2: { name: 'Especialista', bonus: 5 },
};

export const ATTRIBUTE_DICE_FORMULA: Record<number, string> = {
  1: '1d20',
  2: '1d20 + 1d6',
  3: '1d20 + 1d8',
  4: '1d20 + 1d12',
  5: '2d20',
};

function randomInt(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

/**
 * Função pura de cálculo de rolagem do sistema ANE (A Noite Eterna)
 * Atributo 1 = 1d20
 * Atributo 2 = 1d20 + 1d6
 * Atributo 3 = 1d20 + 1d8
 * Atributo 4 = 1d20 + 1d12
 * Atributo 5 = 2d20
 */
export function calculateANERoll(params: {
  characterName: string;
  label: string;
  attributeKey: AttributeKey;
  attributeValue: number;
  skillRank?: SkillRank;
  flatModifier?: number;
}): DiceRollResult {
  const {
    characterName,
    label,
    attributeKey,
    attributeValue,
    skillRank = 0,
    flatModifier = 0,
  } = params;

  const clampedAttr = Math.max(1, Math.min(5, attributeValue));
  const skillBonus = SKILL_RANK_LABELS[skillRank].bonus;

  const d20Rolls: number[] = [randomInt(20)];
  let bonusDieType: 'd6' | 'd8' | 'd12' | null = null;
  let bonusDieRoll: number | null = null;

  if (clampedAttr === 2) {
    bonusDieType = 'd6';
    bonusDieRoll = randomInt(6);
  } else if (clampedAttr === 3) {
    bonusDieType = 'd8';
    bonusDieRoll = randomInt(8);
  } else if (clampedAttr === 4) {
    bonusDieType = 'd12';
    bonusDieRoll = randomInt(12);
  } else if (clampedAttr === 5) {
    d20Rolls.push(randomInt(20));
  }

  const d20Sum = d20Rolls.reduce((acc, v) => acc + v, 0);
  const baseDiceTotal = d20Sum + (bonusDieRoll ?? 0);
  const finalTotal = baseDiceTotal + skillBonus + flatModifier;

  // Construir string da fórmula legível
  const baseFormula = ATTRIBUTE_DICE_FORMULA[clampedAttr];
  const modParts: string[] = [baseFormula];
  if (skillBonus > 0) modParts.push(`+${skillBonus} (${SKILL_RANK_LABELS[skillRank].name})`);
  if (flatModifier !== 0) {
    modParts.push(flatModifier > 0 ? `+${flatModifier}` : `${flatModifier}`);
  }

  return {
    id: `roll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    characterName,
    label,
    attributeKey,
    attributeValue: clampedAttr,
    formula: modParts.join(' '),
    d20Rolls,
    bonusDieType,
    bonusDieRoll,
    skillRank,
    skillBonus,
    flatModifier,
    baseDiceTotal,
    finalTotal,
    isCriticalSuccess: d20Rolls.includes(20),
    isCriticalFailure: d20Rolls.every((r) => r === 1),
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function useDiceRoller() {
  const [rollHistory, setRollHistory] = useState<DiceRollResult[]>([]);
  const [lastRoll, setLastRoll] = useState<DiceRollResult | null>(null);

  const rollAttributeOrSkill = useCallback(
    (params: {
      characterName: string;
      label: string;
      attributeKey: AttributeKey;
      attributeValue: number;
      skillRank?: SkillRank;
      flatModifier?: number;
    }) => {
      const result = calculateANERoll(params);
      setLastRoll(result);
      setRollHistory((prev) => [result, ...prev.slice(0, 29)]);
      return result;
    },
    []
  );

  const clearHistory = useCallback(() => {
    setRollHistory([]);
    setLastRoll(null);
  }, []);

  return {
    lastRoll,
    rollHistory,
    rollAttributeOrSkill,
    clearHistory,
  };
}
