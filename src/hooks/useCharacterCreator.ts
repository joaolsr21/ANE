import { useState, useMemo, useCallback } from 'react';
import { AttributeKey } from './useDiceRoller';

export interface OriginOption {
  id: string;
  title: string;
  subtitle: string;
  abilityName: string;
  abilityDescription: string;
  grantedSkills: [string, string, string, string];
}

export const ANE_ORIGINS: OriginOption[] = [
  {
    id: 'agente-saude',
    title: 'Agente de Saúde',
    subtitle: 'Médico socorrista, enfermeiro de triagem ou virologista de campo.',
    abilityName: 'Protocolo de Triagem',
    abilityDescription:
      'Ao usar Medicina para estabilizar ou tratar um aliado, você recupera +1d6 PV adicional e reduz o avanço de Infecção em 5%.',
    grantedSkills: ['Medicina', 'Ciencias', 'Intuicao', 'Vontade'],
  },
  {
    id: 'policial',
    title: 'Policial / Força Tática',
    subtitle: 'Patrulheiro urbano ou operador de contenção acostumado ao caos.',
    abilityName: 'Fogo de Supressão',
    abilityDescription:
      'Você recebe +2 em testes de Pontaria com armas de fogo curtas e +1 na Iniciativa durante emboscadas.',
    grantedSkills: ['Pontaria', 'Tatica', 'Percepcao', 'Intimidacao'],
  },
  {
    id: 'estudante',
    title: 'Estudante / Pesquisador',
    subtitle: 'Jovem universitário com mente analítica e rápida adaptação.',
    abilityName: 'Improviso Acadêmico',
    abilityDescription:
      'Uma vez por cena, você pode usar Intelecto (INT) no lugar de outro atributo em um teste de perícia não-combate.',
    grantedSkills: ['Investigacao', 'Tecnologia', 'Atualidades', 'Furtividade'],
  },
  {
    id: 'bombeiro',
    title: 'Bombeiro / Resgate',
    subtitle: 'Especialista em ambientes colapsados, fumaça tóxica e combate corpo a corpo.',
    abilityName: 'Fôlego de Cinzas',
    abilityDescription:
      'Você ignora o primeiro nível de Fadiga e recebe +2 em testes para arrombar portas ou carregar sobreviventes.',
    grantedSkills: ['Atletismo', 'Luta', 'Fortitude', 'Sobrevivencia'],
  },
  {
    id: 'engenheiro',
    title: 'Mecânico / Engenheiro',
    subtitle: 'Manutenção de geradores UV, barricadas e veículos blindados.',
    abilityName: 'Sobrecarga Ultravioleta',
    abilityDescription:
      'Seus equipamentos improvisados e lanternas UV têm alcance ampliado e nunca falham no primeiro uso da cena.',
    grantedSkills: ['Tecnologia', 'Profissao', 'Percepcao', 'Reflexos'],
  },
  {
    id: 'criminoso',
    title: 'Sobrevivente do Submundo',
    subtitle: 'Contrabandista de zonas de quarentena e especialista em rotas furtivas.',
    abilityName: 'Sombra do Asfalto',
    abilityDescription:
      'Você não sofre penalidade de movimento ao agir furtivamente e recebe +2 para ocultar itens pequenos.',
    grantedSkills: ['Crime', 'Furtividade', 'Enganacao', 'Reflexos'],
  },
];

export interface SkillDefinition {
  key: string;
  label: string;
  attr: AttributeKey;
}

export const ALL_ANE_SKILLS: SkillDefinition[] = [
  { key: 'Atletismo', label: 'Atletismo', attr: 'FOR' },
  { key: 'Luta', label: 'Luta', attr: 'FOR' },
  { key: 'Furtividade', label: 'Furtividade', attr: 'AGI' },
  { key: 'Pontaria', label: 'Pontaria', attr: 'AGI' },
  { key: 'Reflexos', label: 'Reflexos', attr: 'AGI' },
  { key: 'Crime', label: 'Crime', attr: 'AGI' },
  { key: 'Pilotagem', label: 'Pilotagem', attr: 'AGI' },
  { key: 'Medicina', label: 'Medicina', attr: 'INT' },
  { key: 'Investigacao', label: 'Investigação', attr: 'INT' },
  { key: 'Tecnologia', label: 'Tecnologia', attr: 'INT' },
  { key: 'Sobrevivencia', label: 'Sobrevivência', attr: 'INT' },
  { key: 'Ciencias', label: 'Ciências', attr: 'INT' },
  { key: 'Tatica', label: 'Tática', attr: 'INT' },
  { key: 'Atualidades', label: 'Atualidades', attr: 'INT' },
  { key: 'Profissao', label: 'Profissão', attr: 'INT' },
  { key: 'Percepcao', label: 'Percepção', attr: 'PRE' },
  { key: 'Vontade', label: 'Vontade', attr: 'PRE' },
  { key: 'Intuicao', label: 'Intuição', attr: 'PRE' },
  { key: 'Intimidacao', label: 'Intimidação', attr: 'PRE' },
  { key: 'Diplomacia', label: 'Diplomacia', attr: 'PRE' },
  { key: 'Enganacao', label: 'Enganação', attr: 'PRE' },
  { key: 'Fortitude', label: 'Fortitude', attr: 'VIG' },
];

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
    age: '26',
    concept: '',
    backstory: '',
  });

  // Passo 2: Origem
  const [selectedOriginId, setSelectedOriginId] = useState<string | null>(null);

  // Passo 3: Atributos (Todos começam em 1, máx 3 na criação, 6 pontos extras)
  const [attributes, setAttributes] = useState<AttributesState>(INITIAL_ATTRIBUTES);

  // Passo 4: Perícias escolhidas manualmente
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

  // Perícias bloqueadas/concedidas pela Origem
  const originGrantedSkills = useMemo<string[]>(
    () => (selectedOrigin ? [...selectedOrigin.grantedSkills] : []),
    [selectedOrigin]
  );

  // Estatísticas Derivadas calculadas em tempo real
  const derivedStats = useMemo<DerivedStats>(
    () => calculateDerivedStats(attributes),
    [attributes]
  );

  // Alterar um atributo respeitando [1..3] e o limite de 6 pontos
  const updateAttribute = useCallback(
    (key: AttributeKey, delta: 1 | -1) => {
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

        // Se o jogador reduziu INT, trunca perícias extras excedentes caso necessário
        if (key === 'INT' && delta < 0) {
          const newLimit = 2 + nextVal;
          setSelectedExtraSkills((skills) => skills.slice(0, newLimit));
        }

        return updated;
      });
    },
    []
  );

  // Selecionar Origem e remover eventuais conflitos nas perícias extras
  const selectOrigin = useCallback((originId: string) => {
    setSelectedOriginId(originId);
    const originObj = ANE_ORIGINS.find((o) => o.id === originId);
    if (originObj) {
      setSelectedExtraSkills((prev) =>
        prev.filter((sk) => !originObj.grantedSkills.includes(sk))
      );
    }
  }, []);

  // Alternar perícia extra no Passo 4
  const toggleExtraSkill = useCallback(
    (skillKey: string) => {
      if (originGrantedSkills.includes(skillKey)) return; // Já concedida pela origem

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
          return Boolean(selectedOrigin);
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
    [identity, selectedOrigin, pointsRemaining, selectedExtraSkills.length, maxExtraSkillsAllowed]
  );

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setIdentity({ name: '', age: '26', concept: '', backstory: '' });
    setSelectedOriginId(null);
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
