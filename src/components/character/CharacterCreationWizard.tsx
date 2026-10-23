import React from 'react';
import {
  User,
  Briefcase,
  Sliders,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  Sparkles,
  Heart,
  Brain,
  Shield,
  Skull,
  Zap,
} from 'lucide-react';
import {
  ANE_ORIGINS,
  ALL_ANE_SKILLS,
  useCharacterCreator,
  MAX_ATTR_CREATION,
  MIN_ATTR_CREATION,
} from '../../hooks/useCharacterCreator';
import { AttributeKey, ATTRIBUTE_DICE_FORMULA } from '../../hooks/useDiceRoller';
import { SkillRank } from '../../types/database';
import { AvatarPortrait } from '../common/AvatarPortrait';

interface CharacterCreationWizardProps {
  campaigns: Array<{ id: string; name: string }>;
  onCompleteCreation: (payload: {
    name: string;
    archetype: string;
    avatar_url?: string | null;
    campaign_id: string | null;
    is_npc: boolean;
    pv_max: number;
    san_max: number;
    attr_for: number;
    attr_agi: number;
    attr_int: number;
    attr_pre: number;
    attr_vig: number;
    skills: Record<string, SkillRank>;
    wound_threshold: number;
    defense: number;
    initiative: number;
  }) => Promise<any>;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, title: 'Identidade', icon: User },
  { id: 2, title: 'Origem', icon: Briefcase },
  { id: 3, title: 'Atributos', icon: Sliders },
  { id: 4, title: 'Perícias', icon: Award },
  { id: 5, title: 'Revisão & Derivados', icon: CheckCircle2 },
];

const ATTRIBUTE_DESCRIPTIONS: Record<
  AttributeKey,
  { name: string; desc: string }
> = {
  FOR: {
    name: 'Força',
    desc: 'Potência muscular, combate corpo a corpo (Luta/Atletismo) e capacidade física.',
  },
  AGI: {
    name: 'Agilidade',
    desc: 'Coordenação motora, Pontaria, Furtividade, Defesa (10 + AGI) e Iniciativa (AGI + 1).',
  },
  INT: {
    name: 'Intelecto',
    desc: 'Raciocínio, Medicina, Mecânica e Perícias extras na criação (2 + INT).',
  },
  PRE: {
    name: 'Presença',
    desc: 'Força de vontade, Percepção, estabilidade mental e Sanidade máxima (50 + PRE×10).',
  },
  VIG: {
    name: 'Vigor',
    desc: 'Resistência biológica, Pontos de Vida (30 + VIG×2) e Limite de Ferimento (10 + VIG).',
  },
};

export const CharacterCreationWizard: React.FC<CharacterCreationWizardProps> = ({
  campaigns,
  onCompleteCreation,
  onCancel,
}) => {
  const {
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
    pointsRemaining,
    originGrantedSkills,
    selectedExtraSkills,
    maxExtraSkillsAllowed,
    toggleExtraSkill,
    derivedStats,
    canProceedFromStep,
    resetWizard,
  } = useCharacterCreator();

  const [originSearch, setOriginSearch] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string>(
    campaigns[0]?.id || ''
  );
  const [submitting, setSubmitting] = React.useState(false);

  const handleFinish = async () => {
    if (!selectedOrigin) return;
    setSubmitting(true);

    try {
      const finalSkills: Record<string, SkillRank> = {};
      ALL_ANE_SKILLS.forEach((sk) => {
        const isTrained =
          originGrantedSkills.includes(sk.key) ||
          selectedExtraSkills.includes(sk.key);
        finalSkills[sk.key] = isTrained ? 1 : 0;
      });

      await onCompleteCreation({
        name: identity.name.trim(),
        archetype: `${selectedOrigin.title} (${selectedOrigin.abilityName}) • ${identity.concept.trim()}`,
        avatar_url: avatarUrl,
        campaign_id: selectedCampaignId || null,
        is_npc: false,
        pv_max: derivedStats.pv,
        san_max: derivedStats.san,
        attr_for: attributes.FOR,
        attr_agi: attributes.AGI,
        attr_int: attributes.INT,
        attr_pre: attributes.PRE,
        attr_vig: attributes.VIG,
        skills: finalSkills,
        wound_threshold: derivedStats.lf,
        defense: derivedStats.def,
        initiative: derivedStats.ini,
      });

      resetWizard();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-card border border-muted-ash/20 rounded-2xl overflow-hidden shadow-2xl">
      {/* Barra de Progresso do Stepper (Estilo CRIS) */}
      <div className="bg-bg-main/90 border-b border-muted-ash/15 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-secondary-uv">
              CRIAÇÃO DE PERSONAGEM
            </span>
            <h2 className="text-xl font-extrabold text-text-main">
              Novo Sobrevivente: Passo {currentStep} de 5
            </h2>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-muted-ash hover:text-text-main px-3 py-1.5 rounded-lg border border-muted-ash/20"
            >
              Voltar para Fichas
            </button>
          )}
        </div>

        {/* Stepper Visual */}
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep || canProceedFromStep(currentStep)) {
                    if (step.id <= currentStep + 1) setCurrentStep(step.id);
                  }
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-secondary-uv/20 border-secondary-uv text-text-main shadow-uv-glow'
                    : isCompleted
                    ? 'bg-primary-blood/20 border-primary-blood/60 text-text-main'
                    : 'bg-bg-card/60 border-muted-ash/15 text-muted-ash'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isActive
                      ? 'bg-secondary-uv text-text-main'
                      : isCompleted
                      ? 'bg-primary-blood text-text-main'
                      : 'bg-bg-main text-muted-ash'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block truncate">
                  <div className="text-[10px] font-mono uppercase opacity-75">
                    Etapa 0{step.id}
                  </div>
                  <div className="text-xs font-bold truncate">{step.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Corpo Dinâmico de Cada Etapa */}
      <div className="p-6 min-h-[420px]">
        {/* PASSO 1: IDENTIDADE */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div>
              <h3 className="text-lg font-bold text-text-main">
                1. Quem Você Era & Conceito
              </h3>
              <p className="text-xs text-muted-ash">
                Quem era seu Sobrevivente antes do colapso e quem ele está tentando ser agora?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 bg-bg-main p-4 rounded-xl border border-muted-ash/20">
              <AvatarPortrait
                imageUrl={avatarUrl}
                name={identity.name || 'NV'}
                size="xl"
                editable={true}
                onChangeImage={setAvatarUrl}
              />
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-text-main block">
                  Foto do Personagem (Opcional)
                </span>
                <p className="text-[11px] text-muted-ash">
                  Passe o mouse sobre o retrato ao lado para <strong>enviar uma imagem do dispositivo</strong>, <strong>colar um link (URL)</strong> ou <strong>excluir a foto</strong>. Você também poderá alterá-la depois na aba de Personagens.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block text-xs font-medium text-muted-ash mb-1.5">
                  Nome do Sobrevivente *
                </label>
                <input
                  type="text"
                  value={identity.name}
                  onChange={(e) =>
                    setIdentity((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Camila Ferreira"
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-secondary-uv"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-muted-ash mb-1.5">
                  Idade
                </label>
                <input
                  type="number"
                  min={14}
                  max={90}
                  value={identity.age}
                  onChange={(e) =>
                    setIdentity((prev) => ({ ...prev, age: e.target.value }))
                  }
                  className="w-full bg-bg-main border border-muted-ash/30 rounded-xl px-4 py-2.5 text-sm font-mono text-text-main focus:outline-none focus:border-secondary-uv"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-ash mb-1.5">
                Conceito do Sobrevivente (Uma frase curta) *
              </label>
              <input
                type="text"
                value={identity.concept}
                onChange={(e) =>
                  setIdentity((prev) => ({ ...prev, concept: e.target.value }))
                }
                placeholder="Ex: Profissional de saúde procurando o irmão desaparecido"
                className="w-full bg-bg-main border border-muted-ash/30 rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-secondary-uv"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-ash mb-1.5">
                Personalidade, Aparência, Objetivos & Relações
              </label>
              <textarea
                rows={4}
                value={identity.backstory}
                onChange={(e) =>
                  setIdentity((prev) => ({ ...prev, backstory: e.target.value }))
                }
                placeholder="Descreva traços de personalidade, o que teme perder e seu objetivo atual..."
                className="w-full bg-bg-main border border-muted-ash/30 rounded-xl p-4 text-sm text-text-main focus:outline-none focus:border-secondary-uv resize-none"
              />
            </div>
          </div>
        )}

        {/* PASSO 2: AS 35 ORIGENS OFICIAIS */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-text-main">
                  2. Escolha sua Origem
                </h3>
                <p className="text-xs text-muted-ash">
                  Clique em uma Origem para ver sua{' '}
                  <strong className="text-secondary-uv">Habilidade de Origem</strong> e selecionar suas{' '}
                  <strong className="text-text-main">4 Perícias Treinadas (+2)</strong>.
                </p>
              </div>
              <input
                type="text"
                value={originSearch}
                onChange={(e) => setOriginSearch(e.target.value)}
                placeholder="Filtrar entre as 35 Origens..."
                className="bg-bg-main border border-muted-ash/30 rounded-xl px-3.5 py-2 text-xs text-text-main focus:outline-none focus:border-secondary-uv w-full md:w-64"
              />
            </div>

            {selectedOrigin && (
              <div className="bg-bg-main border-2 border-secondary-uv rounded-xl p-4 space-y-3 shadow-uv-glow">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-secondary-uv">
                      Origem Selecionada
                    </span>
                    <h4 className="text-base font-extrabold text-text-main">
                      {selectedOrigin.title} —{' '}
                      <span className="text-secondary-uv">{selectedOrigin.abilityName}</span>
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-bg-card border border-secondary-uv/50 text-text-main">
                    Perícias da Origem: {originGrantedSkills.length} / 4
                  </span>
                </div>

                <p className="text-xs text-muted-ash leading-relaxed">
                  {selectedOrigin.abilityDescription}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-muted-ash/15">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-muted-ash block mb-1.5">
                      Perícias Fixas ({selectedOrigin.fixedSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOrigin.fixedSkills.length === 0 ? (
                        <span className="text-xs text-muted-ash italic">
                          Nenhuma fixa (Escolha 4 livres ao lado)
                        </span>
                      ) : (
                        selectedOrigin.fixedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="text-xs font-mono px-2.5 py-1 rounded bg-primary-blood/30 border border-primary-blood text-text-main font-bold"
                          >
                            {sk} (+2 Fixa)
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {selectedOrigin.choiceCount > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase text-secondary-uv block mb-1.5">
                        Escolha {selectedOrigin.choiceCount} opções da Origem ({originChosenSkills.length}/{selectedOrigin.choiceCount}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedOrigin.choicePool
                          .filter((sk) => !selectedOrigin.fixedSkills.includes(sk))
                          .map((sk) => {
                            const isPicked = originChosenSkills.includes(sk);
                            return (
                              <button
                                key={sk}
                                type="button"
                                onClick={() => toggleOriginChoiceSkill(sk)}
                                className={`text-xs font-mono px-2.5 py-1 rounded border transition-all ${
                                  isPicked
                                    ? 'bg-secondary-uv text-text-main border-secondary-uv font-bold'
                                    : 'bg-bg-card text-muted-ash border-muted-ash/25 hover:border-text-main'
                                }`}
                              >
                                {sk} {isPicked ? '✓' : ''}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {ANE_ORIGINS.filter(
                (o) =>
                  o.title.toLowerCase().includes(originSearch.toLowerCase()) ||
                  o.subtitle.toLowerCase().includes(originSearch.toLowerCase()) ||
                  o.abilityName.toLowerCase().includes(originSearch.toLowerCase())
              ).map((origin) => {
                const isSelected = selectedOrigin?.id === origin.id;
                return (
                  <div
                    key={origin.id}
                    onClick={() => selectOrigin(origin.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-bg-main border-2 border-secondary-uv shadow-uv-glow'
                        : 'bg-bg-main/60 border-muted-ash/20 hover:border-muted-ash/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-text-main">
                          {origin.title}
                        </h4>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? 'bg-secondary-uv' : 'bg-muted-ash/30'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-muted-ash leading-relaxed">
                        {origin.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-muted-ash/15 space-y-2">
                      <div className="text-[11px] font-mono text-secondary-uv flex items-center gap-1 font-bold">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        {origin.abilityName}
                      </div>
                      <p className="text-[11px] text-text-main/80 line-clamp-2">
                        {origin.abilityDescription}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASSO 3: ATRIBUTOS (6 PONTOS, BASE 1, MÁX 3, SOMA 11) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-main p-4 rounded-xl border border-muted-ash/20">
              <div>
                <h3 className="text-lg font-bold text-text-main">
                  3. Distribuição de Atributos
                </h3>
                <p className="text-xs text-muted-ash">
                  Todos começam em <strong>1</strong>. Distribua <strong>6 pontos</strong>. Nenhum Atributo pode começar acima de{' '}
                  <strong>3</strong> (Soma total = 11).
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`px-4 py-2 rounded-xl border font-mono text-sm font-bold ${
                    pointsRemaining === 0
                      ? 'bg-secondary-uv/20 border-secondary-uv text-text-main'
                      : 'bg-warning-rust/20 border-warning-rust text-warning-rust'
                  }`}
                >
                  Pontos Restantes: {pointsRemaining} / 6
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['FOR', 'AGI', 'INT', 'PRE', 'VIG'] as AttributeKey[]).map((key) => {
                const val = attributes[key];
                const info = ATTRIBUTE_DESCRIPTIONS[key];

                return (
                  <div
                    key={key}
                    className="bg-bg-main border border-muted-ash/25 rounded-xl p-4 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-secondary-uv font-bold">
                          {key}
                        </span>
                        <span className="text-[11px] font-mono text-muted-ash">
                          {ATTRIBUTE_DICE_FORMULA[val]}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-text-main mt-0.5">
                        {info.name}
                      </h4>
                      <p className="text-[11px] text-muted-ash mt-1.5 leading-relaxed">
                        {info.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-muted-ash/15 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={val <= MIN_ATTR_CREATION}
                        onClick={() => updateAttribute(key, -1)}
                        className="w-9 h-9 rounded-lg bg-bg-card border border-muted-ash/30 hover:border-primary-blood disabled:opacity-30 font-mono font-bold text-lg text-text-main"
                      >
                        -
                      </button>

                      <span className="text-3xl font-extrabold font-mono text-text-main">
                        {val}
                      </span>

                      <button
                        type="button"
                        disabled={val >= MAX_ATTR_CREATION || pointsRemaining <= 0}
                        onClick={() => updateAttribute(key, 1)}
                        className="w-9 h-9 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 disabled:opacity-30 font-mono font-bold text-lg text-text-main"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-bg-main/70 border border-muted-ash/15 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-ash block">
                  PV (30 + VIG×2)
                </span>
                <span className="text-lg font-extrabold font-mono text-primary-blood">
                  {derivedStats.pv}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-ash block">
                  SAN (50 + PRE×10)
                </span>
                <span className="text-lg font-extrabold font-mono text-warning-rust">
                  {derivedStats.san}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-ash block">
                  LF (10 + VIG)
                </span>
                <span className="text-lg font-extrabold font-mono text-text-main">
                  {derivedStats.lf}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-ash block">
                  DEF (10 + AGI)
                </span>
                <span className="text-lg font-extrabold font-mono text-secondary-uv">
                  {derivedStats.def}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-ash block">
                  INI (AGI + BN)
                </span>
                <span className="text-lg font-extrabold font-mono text-text-main">
                  +{derivedStats.ini}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: AS 28 PERÍCIAS OFICIAIS (4 DA ORIGEM + [2 + INT] ADICIONAIS) */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-bg-main border border-primary-blood/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-text-main flex items-center gap-2 font-bold">
                  <Lock className="w-3.5 h-3.5 text-primary-blood" />
                  4 Perícias Concedidas pela Origem ({selectedOrigin?.title})
                </h4>
                <span className="text-[11px] font-mono text-muted-ash">
                  Treinadas (+2)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {originGrantedSkills.map((skKey) => {
                  const skObj = ALL_ANE_SKILLS.find((s) => s.key === skKey);
                  return (
                    <div
                      key={skKey}
                      className="bg-primary-blood/20 border border-primary-blood rounded-lg px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-text-main">
                        {skObj?.label || skKey}
                      </span>
                      <span className="font-mono text-[10px] text-text-main/80">
                        {skObj?.attr} • +2
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-text-main">
                    Escolha suas Perícias Adicionais (2 + INT {attributes.INT} ={' '}
                    {maxExtraSkillsAllowed})
                  </h4>
                  <p className="text-xs text-muted-ash">
                    Selecione exatamente {maxExtraSkillsAllowed} perícias diferentes das concedidas pela Origem.
                  </p>
                </div>

                <div
                  className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold ${
                    selectedExtraSkills.length === maxExtraSkillsAllowed
                      ? 'bg-secondary-uv/20 border-secondary-uv text-text-main'
                      : 'bg-warning-rust/20 border-warning-rust text-warning-rust'
                  }`}
                >
                  Escolhidas: {selectedExtraSkills.length} / {maxExtraSkillsAllowed}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {ALL_ANE_SKILLS.map((skill) => {
                  const isLockedByOrigin = originGrantedSkills.includes(skill.key);
                  const isSelectedExtra = selectedExtraSkills.includes(skill.key);

                  return (
                    <button
                      key={skill.key}
                      type="button"
                      disabled={isLockedByOrigin}
                      onClick={() => toggleExtraSkill(skill.key)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isLockedByOrigin
                          ? 'bg-primary-blood/15 border-primary-blood/40 opacity-60 cursor-not-allowed'
                          : isSelectedExtra
                          ? 'bg-secondary-uv/25 border-secondary-uv text-text-main shadow-uv-glow'
                          : 'bg-bg-main border-muted-ash/20 hover:border-muted-ash/50 text-muted-ash'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-text-main">
                          {skill.label}
                        </div>
                        <div className="text-[10px] font-mono text-muted-ash">
                          Atributo: {skill.attr}
                          {skill.altAttr ? `/${skill.altAttr}` : ''}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-card border border-muted-ash/20 text-text-main">
                        {isLockedByOrigin
                          ? 'ORIGEM'
                          : isSelectedExtra
                          ? '+2'
                          : '+0'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PASSO 5: REVISÃO E DERIVADOS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-text-main">
                  5. Revisão da Ficha & Valores Derivados
                </h3>
                <p className="text-xs text-muted-ash">
                  Confira as escolhas e os valores derivados antes de salvar a ficha.
                </p>
              </div>

              {campaigns.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-ash">Campanha:</span>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-1.5 text-xs text-text-main"
                  >
                    <option value="">Sem campanha vinculada</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-bg-main border border-muted-ash/20 rounded-xl p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-secondary-uv">
                    Dossiê do Sobrevivente (Nível 1 • BN +1)
                  </span>
                  <h4 className="text-xl font-extrabold text-text-main">
                    {identity.name} ({identity.age} anos)
                  </h4>
                  <p className="text-xs text-muted-ash mt-0.5">{identity.concept}</p>
                </div>

                {selectedOrigin && (
                  <div className="p-3.5 rounded-lg bg-bg-card border border-secondary-uv/30 space-y-1">
                    <div className="text-xs font-bold text-text-main">
                      Origem: {selectedOrigin.title}
                    </div>
                    <div className="text-[11px] text-secondary-uv font-mono">
                      Habilidade: {selectedOrigin.abilityName}
                    </div>
                    <p className="text-xs text-muted-ash leading-relaxed">
                      {selectedOrigin.abilityDescription}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold text-text-main block mb-2">
                    Total de Perícias Treinadas ({originGrantedSkills.length + selectedExtraSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[...originGrantedSkills, ...selectedExtraSkills].map((sk) => {
                      const skObj = ALL_ANE_SKILLS.find((s) => s.key === sk);
                      return (
                        <span
                          key={sk}
                          className="text-xs font-mono px-2.5 py-1 rounded bg-bg-card border border-secondary-uv/40 text-text-main"
                        >
                          {skObj?.label || sk} (+2)
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-5 gap-2 bg-bg-main border border-muted-ash/20 rounded-xl p-4 text-center">
                  {(['FOR', 'AGI', 'INT', 'PRE', 'VIG'] as AttributeKey[]).map(
                    (attr) => (
                      <div key={attr} className="p-2 bg-bg-card rounded-lg">
                        <div className="text-xs font-mono text-muted-ash">{attr}</div>
                        <div className="text-2xl font-extrabold font-mono text-text-main">
                          {attributes[attr]}
                        </div>
                        <div className="text-[10px] font-mono text-secondary-uv">
                          {ATTRIBUTE_DICE_FORMULA[attributes[attr]]}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-bg-main border border-primary-blood/50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-ash flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-primary-blood" />
                        Pontos de Vida (PV)
                      </span>
                      <span className="text-[11px] font-mono text-muted-ash">
                        Fórmula: 30 + (VIG × 2)
                      </span>
                    </div>
                    <span className="text-3xl font-extrabold font-mono text-primary-blood">
                      {derivedStats.pv}
                    </span>
                  </div>

                  <div className="bg-bg-main border border-warning-rust/50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-ash flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-warning-rust" />
                        Sanidade (SAN)
                      </span>
                      <span className="text-[11px] font-mono text-muted-ash">
                        Fórmula: 50 + (PRE × 10)
                      </span>
                    </div>
                    <span className="text-3xl font-extrabold font-mono text-warning-rust">
                      {derivedStats.san}
                    </span>
                  </div>

                  <div className="bg-bg-main border border-muted-ash/25 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-ash flex items-center gap-1.5">
                        <Skull className="w-4 h-4 text-primary-blood" />
                        Limite de Ferimento (LF)
                      </span>
                      <span className="text-[11px] font-mono text-muted-ash">
                        Fórmula: 10 + VIG
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold font-mono text-text-main">
                      {derivedStats.lf}
                    </span>
                  </div>

                  <div className="bg-bg-main border border-secondary-uv/40 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-ash flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-secondary-uv" />
                        Defesa (DEF) & Iniciativa (INI)
                      </span>
                      <span className="text-[11px] font-mono text-muted-ash">
                        DEF: 10+AGI | INI: AGI+BN(+1)
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xl font-extrabold text-secondary-uv">
                        DEF {derivedStats.def}
                      </span>
                      <span className="block text-xs text-warning-rust font-bold">
                        <Zap className="w-3 h-3 inline" /> INI +{derivedStats.ini}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé de Navegação do Wizard */}
      <div className="bg-bg-main/90 border-t border-muted-ash/15 px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          className="px-4 py-2 rounded-xl bg-bg-card border border-muted-ash/25 text-xs font-semibold text-text-main disabled:opacity-30 flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Passo Anterior
        </button>

        {currentStep < 5 ? (
          <button
            type="button"
            disabled={!canProceedFromStep(currentStep)}
            onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
            className="px-5 py-2.5 rounded-xl bg-secondary-uv hover:bg-secondary-uv/90 disabled:opacity-40 text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5 shadow-uv-glow transition-all"
          >
            Avançar Etapa
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-xl bg-primary-blood hover:bg-primary-blood/90 text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2 shadow-blood-glow transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Finalizando...' : 'Concluir e Gerar Ficha'}
          </button>
        )}
      </div>
    </div>
  );
};
