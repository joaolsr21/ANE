import { useState, useMemo, useCallback } from 'react';
import { AttributeKey } from './useDiceRoller';
import {
  ALL_ANE_SKILLS,
  ANE_ORIGINS,
  OriginOption,
  SkillDefinition,
} from '../data/aneSystemRules';

export { ALL_ANE_SKILLS, ANE_ORIGINS };
export type { OriginOption, SkillDefinition };

export interface CharacterIdentityState {
  name: string;
  age: string;
  concept: string;
  backstory: string;
}

export interface AttributesState {
  FOR: number;
  AGI: number;
  INT: number;
  PRE: number;
  VIG: number;
}

export interface DerivedStats {
  pv: number;  // 30 + (VIG * 2)
  san: number; // 50 + (PRE * 10)
  lf: number;  // 10 + VIG
  def: number; // 10 + AGI
  ini: number; // AGI + 1
}

export const INITIAL_ATTRIBUTES: AttributesState = {
  FOR: 1,
  AGI: 1,
  INT: 1,
  PRE: 1,
  VIG: 1,
};

export const TOTAL_DISTRIBUTABLE_POINTS = 6; // Soma total final = 5 (base) + 6 = 11
export const MIN_ATTR_CREATION = 1;
export const MAX_ATTR_CREATION = 3;

export function calculateDerivedStats(attrs: AttributesState): DerivedStats {
  return {
    pv: 30 + attrs.VIG * 2,
    san: 50 + attrs.PRE * 10,
    lf: 10 + attrs.VIG,
    def: 10 + attrs.AGI,
    ini: attrs.AGI + 1,
  };
}

export function useCharacterCreator() {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 a 5

  // Passo 1: Identidade
  const [identity, setIdentity] = useState<CharacterIdentityState>({
    name: '',
    age: '29',
    concept: '',
    backstory: '',
  });

  // Passo 2: Origem + Escolhas de Perícias da Origem (ex: "escolha 2 entre...")
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);
  const [originChosenSkills, setOriginChosenSkills] = useState<string[]>([]);

  // Passo 3: Atributos (Todos começam em 1, máx 3 na criação, 6 pontos extras)
  const [attributes, setAttributes] = useState<AttributesState>(INITIAL_ATTRIBUTES);

  // Passo 4: Perícias adicionais (2 + INT atual)
  const [selectedExtraSkills, setSelectedExtraSkills] = useState<string[]>([]);

  const selectedOrigin = useMemo(
    () => ANE_ORIGINS.find((o) => o.id === selectedOriginId) || null,
    [selectedOriginId]
  );

  // Pontos gastos e restantes nos Atributos
  const pointsSpent = useMemo(() => {
    return (
      attributes.FOR - 1 +
      (attributes.AGI - 1) +
      (attributes.INT - 1) +
      (attributes.PRE - 1) +
      (attributes.VIG - 1)
    );
  }, [attributes]);

  const pointsRemaining = TOTAL_DISTRIBUTABLE_POINTS - pointsSpent;

  // Quantidade de perícias adicionais permitidas: 2 + INT atual
  const maxExtraSkillsAllowed = 2 + attributes.INT;

  // As 4 perícias da Origem = fixedSkills + originChosenSkills
  const originGrantedSkills = useMemo<string[]>(() => {
    if (!selectedOrigin) return [];
    return [...selectedOrigin.fixedSkills, ...originChosenSkills];
  }, [selectedOrigin, originChosenSkills]);

  // Estatísticas Derivadas calculadas em tempo real
  const derivedStats = useMemo<DerivedStats>(
    () => calculateDerivedStats(attributes),
    [attributes]
  );

  const updateAttribute = useCallback((key: AttributeKey, delta: 1 | -1) => {
    setAttributes((prev) => {
      const currentVal = prev[key];
      const nextVal = currentVal + delta;

      if (nextVal < MIN_ATTR_CREATION || nextVal > MAX_ATTR_CREATION) {
        return prev;
      }

      const currentSpent =
        prev.FOR + prev.AGI + prev.INT + prev.PRE + prev.VIG - 5;
      if (delta > 0 && currentSpent >= TOTAL_DISTRIBUTABLE_POINTS) {
        return prev;
      }

      const updated = { ...prev, [key]: nextVal };

      if (key === 'INT' && delta < 0) {
        const newLimit = 2 + nextVal;
        setSelectedExtraSkills((skills) => skills.slice(0, newLimit));
      }

      return updated;
    });
  }, []);

  // Selecionar Origem e pré-selecionar as escolhas padrão daquela Origem
  const selectOrigin = useCallback((originId: string) => {
    setSelectedOriginId(originId);
    const originObj = ANE_ORIGINS.find((o) => o.id === originId);
    if (originObj) {
      const autoChoices = originObj.choicePool
        .filter((sk) => !originObj.fixedSkills.includes(sk))
        .slice(0, originObj.choiceCount);
      setOriginChosenSkills(autoChoices);

      const allOriginSkills = [...originObj.fixedSkills, ...autoChoices];
      setSelectedExtraSkills((prev) =>
        prev.filter((sk) => !allOriginSkills.includes(sk))
      );
    } else {
      setOriginChosenSkills([]);
    }
  }, []);

  // Alternar uma das perícias de escolha da própria Origem (ex: escolha 2 entre...)
  const toggleOriginChoiceSkill = useCallback(
    (skillKey: string) => {
      if (!selectedOrigin) return;
      if (selectedOrigin.fixedSkills.includes(skillKey)) return;

      setOriginChosenSkills((prev) => {
        let next: string[];
        if (prev.includes(skillKey)) {
          next = prev.filter((k) => k !== skillKey);
        } else {
          if (prev.length >= selectedOrigin.choiceCount) {
            // Substitui a primeira escolha para facilitar UX
            next = [...prev.slice(1), skillKey];
          } else {
            next = [...prev, skillKey];
          }
        }
        // Garante que nenhuma perícia da origem fique duplicada nas perícias extras
        setSelectedExtraSkills((extra) => extra.filter((k) => !next.includes(k)));
        return next;
      });
    },
    [selectedOrigin]
  );

  // Alternar perícia extra no Passo 4 (2 + INT)
  const toggleExtraSkill = useCallback(
    (skillKey: string) => {
      if (originGrantedSkills.includes(skillKey)) return;

      setSelectedExtraSkills((prev) => {
        if (prev.includes(skillKey)) {
          return prev.filter((k) => k !== skillKey);
        }
        if (prev.length >= maxExtraSkillsAllowed) {
          return prev;
        }
        return [...prev, skillKey];
      });
    },
    [originGrantedSkills, maxExtraSkillsAllowed]
  );

  // Validação de avanço de etapa
  const canProceedFromStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return identity.name.trim().length >= 2 && identity.concept.trim().length >= 2;
        case 2:
          return Boolean(
            selectedOrigin &&
              originChosenSkills.length === selectedOrigin.choiceCount
          );
        case 3:
          return pointsRemaining === 0;
        case 4:
          return selectedExtraSkills.length === maxExtraSkillsAllowed;
        case 5:
          return true;
        default:
          return false;
      }
    },
    [
      identity,
      selectedOrigin,
      originChosenSkills.length,
      pointsRemaining,
      selectedExtraSkills.length,
      maxExtraSkillsAllowed,
    ]
  );

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setIdentity({ name: '', age: '29', concept: '', backstory: '' });
    setSelectedOriginId(null);
    setOriginChosenSkills([]);
    setAttributes(INITIAL_ATTRIBUTES);
    setSelectedExtraSkills([]);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    identity,
    setIdentity,
    selectedOrigin,
    selectOrigin,
    originChosenSkills,
    toggleOriginChoiceSkill,
    attributes,
    updateAttribute,
    pointsSpent,
    pointsRemaining,
    originGrantedSkills,
    selectedExtraSkills,
    maxExtraSkillsAllowed,
    toggleExtraSkill,
    derivedStats,
    canProceedFromStep,
    resetWizard,
  };
}
