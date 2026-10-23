import React, { useState } from 'react';
import {
  Dices,
  HeartPulse,
  Droplet,
  Bandage,
  Stethoscope,
  Trash2,
  Plus,
  AlertOctagon,
  Skull,
  ShieldCheck,
} from 'lucide-react';

export type BodyPartId =
  | 'head'
  | 'leftArm'
  | 'rightArm'
  | 'torso'
  | 'leftLeg'
  | 'rightLeg';

export type WoundSeverity = 'leve' | 'grave' | 'critico' | 'devastador';

export interface AnatomicalWound {
  id: string;
  part: BodyPartId;
  severity: WoundSeverity;
  bleedingDice: '1d4' | '1d6' | '1d8';
  isStaunched: boolean; // Sangramento estancado?
  isTreated: boolean;   // Ferimento tratado com Medicina?
  description?: string;
}

export interface BodyWoundsMetadata {
  _meta: 'ane_v2';
  wounds: AnatomicalWound[];
  conditions: string[];
  dyingSuccesses: number;
  dyingFailures: number;
  isStabilized: boolean;
  ruptures: Array<{ id: string; trigger: string; effect: string; progress: number }>;
}

export const BODY_PART_LABELS: Record<
  BodyPartId,
  { name: string; d20Range: string; targetedPenalty: number }
> = {
  head: { name: 'Cabeça', d20Range: '1', targetedPenalty: -5 },
  leftArm: { name: 'Braço Esquerdo', d20Range: '2–4', targetedPenalty: -3 },
  rightArm: { name: 'Braço Direito', d20Range: '5–7', targetedPenalty: -3 },
  torso: { name: 'Torso', d20Range: '8–14', targetedPenalty: -2 },
  leftLeg: { name: 'Perna Esquerda', d20Range: '15–17', targetedPenalty: -3 },
  rightLeg: { name: 'Perna Direita', d20Range: '18–20', targetedPenalty: -3 },
};

export const SEVERITY_INFO: Record<
  WoundSeverity,
  {
    label: string;
    bleeding: '1d4' | '1d6' | '1d8';
    medDT: number;
    treatTime: string;
    healTime: string;
    badgeClass: string;
  }
> = {
  leve: {
    label: 'Leve (1× LF)',
    bleeding: '1d4',
    medDT: 10,
    treatTime: '15 min',
    healTime: '2 dias',
    badgeClass: 'bg-warning-rust/25 border-warning-rust text-warning-rust',
  },
  grave: {
    label: 'Grave (2× LF)',
    bleeding: '1d6',
    medDT: 15,
    treatTime: '1 hora',
    healTime: '5 dias (→ Leve)',
    badgeClass: 'bg-primary-blood/35 border-primary-blood text-text-main',
  },
  critico: {
    label: 'Crítico (3× LF)',
    bleeding: '1d8',
    medDT: 20,
    treatTime: '4 horas',
    healTime: '10 dias (→ Grave)',
    badgeClass: 'bg-red-700/60 border-red-400 text-white font-bold',
  },
  devastador: {
    label: 'Devastador',
    bleeding: '1d8',
    medDT: 20,
    treatTime: '4 horas+',
    healTime: 'Sequela / Mutilação',
    badgeClass: 'bg-red-900 border-red-300 text-white font-extrabold',
  },
};

export function rollHitLocation1d20(): { roll: number; part: BodyPartId } {
  const roll = Math.floor(Math.random() * 20) + 1;
  if (roll === 1) return { roll, part: 'head' };
  if (roll <= 4) return { roll, part: 'leftArm' };
  if (roll <= 7) return { roll, part: 'rightArm' };
  if (roll <= 14) return { roll, part: 'torso' };
  if (roll <= 17) return { roll, part: 'leftLeg' };
  return { roll, part: 'rightLeg' };
}

interface BodyWoundDiagramProps {
  entityName: string;
  isNpc?: boolean;
  woundThreshold: number; // LF = 10 + VIG
  pvCurrent: number;
  pvMax: number;
  wounds: AnatomicalWound[];
  dyingSuccesses?: number;
  dyingFailures?: number;
  onChangeWounds: (nextWounds: AnatomicalWound[]) => void;
  onApplyDamageAndBleed?: (pvDelta: number) => void;
  onChangeDying?: (successes: number, failures: number) => void;
  compact?: boolean;
}

export const BodyWoundDiagram: React.FC<BodyWoundDiagramProps> = ({
  entityName,
  isNpc = false,
  woundThreshold,
  pvCurrent,
  wounds,
  dyingSuccesses = 0,
  dyingFailures = 0,
  onChangeWounds,
  onApplyDamageAndBleed,
  onChangeDying,
  compact = false,
}) => {
  const [selectedPart, setSelectedPart] = useState<BodyPartId>('torso');
  const [incomingDamage, setIncomingDamage] = useState<number>(woundThreshold);
  const [isBallistic, setIsBallistic] = useState<boolean>(false);
  const [hasBallisticArmor, setHasBallisticArmor] = useState<boolean>(false);
  const [lastLocRoll, setLastLocRoll] = useState<{ roll: number; part: BodyPartId } | null>(null);
  const [bleedLog, setBleedLog] = useState<string | null>(null);

  // Calcula a cor de preenchimento SVG de cada região corporal conforme a gravidade mais alta
  const getPartColor = (part: BodyPartId) => {
    const partWounds = wounds.filter((w) => w.part === part);
    const isSelected = selectedPart === part;

    if (partWounds.some((w) => w.severity === 'critico' || w.severity === 'devastador')) {
      return {
        fill: '#991B1B',
        stroke: isSelected ? '#E2E8F0' : '#EF4444',
        pulse: true,
      };
    }
    if (partWounds.some((w) => w.severity === 'grave')) {
      return {
        fill: '#8B1E1E',
        stroke: isSelected ? '#E2E8F0' : '#F87171',
        pulse: false,
      };
    }
    if (partWounds.some((w) => w.severity === 'leve')) {
      return {
        fill: '#B45309',
        stroke: isSelected ? '#E2E8F0' : '#FBBF24',
        pulse: false,
      };
    }
    return {
      fill: isSelected ? 'rgba(93, 63, 211, 0.45)' : '#1A1A24',
      stroke: isSelected ? '#5D3FD3' : '#9CA3AF',
      pulse: false,
    };
  };

  // Rolagem automática 1d20 de Localização (Cap. 10.3.6 / 11.2.5)
  const handleRollLocation = () => {
    const res = rollHitLocation1d20();
    setLastLocRoll(res);
    setSelectedPart(res.part);
  };

  // Adicionar ferimento manualmente na parte selecionada
  const handleAddWound = (severity: WoundSeverity) => {
    const info = SEVERITY_INFO[severity];
    const newWound: AnatomicalWound = {
      id: `wnd-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      part: selectedPart,
      severity,
      bleedingDice: info.bleeding,
      isStaunched: false,
      isTreated: false,
    };
    onChangeWounds([...wounds, newWound]);
  };

  // Calculadora Oficial de Dano vs Limite de Ferimento (Cap. 11.2 e 11.6.1)
  const handleCalculateDamageHit = (e: React.FormEvent) => {
    e.preventDefault();
    const dmg = Math.max(0, Number(incomingDamage) || 0);
    if (dmg <= 0) return;

    // Regra Cap. 11.6.1: Dano Balístico sem Proteção Balística reduz LF em -2
    const effectiveLF =
      isBallistic && !hasBallisticArmor
        ? Math.max(1, woundThreshold - 2)
        : woundThreshold;

    let producedSeverity: WoundSeverity | null = null;
    if (dmg >= effectiveLF * 3) {
      producedSeverity = 'critico';
    } else if (dmg >= effectiveLF * 2) {
      producedSeverity = 'grave';
    } else if (dmg >= effectiveLF) {
      producedSeverity = 'leve';
    }

    if (producedSeverity) {
      const info = SEVERITY_INFO[producedSeverity];
      const newWound: AnatomicalWound = {
        id: `wnd-${Date.now()}`,
        part: selectedPart,
        severity: producedSeverity,
        bleedingDice: info.bleeding,
        isStaunched: false,
        isTreated: false,
        description: `${dmg} dano (LF efetivo ${effectiveLF})`,
      };
      onChangeWounds([...wounds, newWound]);
    }

    if (onApplyDamageAndBleed) {
      onApplyDamageAndBleed(-dmg);
    }
  };

  // Rolar todos os Sangramentos ativos no turno (Cap. 11.3.1)
  const handleRollActiveBleedings = () => {
    const activeBleeds = wounds.filter((w) => !w.isStaunched);
    if (activeBleeds.length === 0) {
      setBleedLog('Nenhum sangramento ativo no momento.');
      return;
    }

    let totalBleedLoss = 0;
    const details: string[] = [];

    activeBleeds.forEach((w) => {
      const maxDie = w.bleedingDice === '1d4' ? 4 : w.bleedingDice === '1d6' ? 6 : 8;
      const roll = Math.floor(Math.random() * maxDie) + 1;
      totalBleedLoss += roll;
      details.push(`${BODY_PART_LABELS[w.part].name} (${w.bleedingDice}): -${roll} PV`);
    });

    setBleedLog(`Sangramento Total: -${totalBleedLoss} PV [${details.join(' | ')}]`);
    if (onApplyDamageAndBleed) {
      onApplyDamageAndBleed(-totalBleedLoss);
    }
  };

  const toggleStaunched = (id: string) => {
    onChangeWounds(
      wounds.map((w) => (w.id === id ? { ...w, isStaunched: !w.isStaunched } : w))
    );
  };

  const toggleTreated = (id: string) => {
    onChangeWounds(
      wounds.map((w) =>
        w.id === id
          ? { ...w, isTreated: !w.isTreated, isStaunched: !w.isTreated ? true : w.isStaunched }
          : w
      )
    );
  };

  const removeWound = (id: string) => {
    onChangeWounds(wounds.filter((w) => w.id !== id));
  };

  // Regra Cap. 20.1.4: Destruição Cerebral em Infectados (Ferimento Crítico na Cabeça)
  const hasHeadCriticalOnInfected =
    isNpc &&
    wounds.some(
      (w) =>
        w.part === 'head' &&
        (w.severity === 'critico' || w.severity === 'devastador')
    );

  return (
    <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-5">
      {/* Cabeçalho do Sistema Anatômico de Ferimentos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-muted-ash/15 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary-blood">
            CAPÍTULO 11 // SISTEMA ANATÔMICO DE FERIMENTOS & SANGRAMENTO
          </span>
          <h3 className="text-base font-bold text-text-main flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-primary-blood" />
            Corpo & Localização de Lesões — {entityName}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-bg-main border border-muted-ash/25 text-text-main">
            LF Base: <strong className="text-primary-blood">{woundThreshold}</strong>
          </span>
          <button
            type="button"
            onClick={handleRollLocation}
            className="px-3 py-1 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main font-semibold flex items-center gap-1.5 shadow-uv-glow transition-all"
          >
            <Dices className="w-3.5 h-3.5" />
            Rolar Localização (1d20)
          </button>
        </div>
      </div>

      {hasHeadCriticalOnInfected && (
        <div className="p-3 rounded-lg bg-primary-blood/30 border-2 border-primary-blood text-xs text-text-main flex items-center gap-2 font-bold">
          <Skull className="w-5 h-5 text-primary-blood shrink-0" />
          <span>
            DESTRUIÇÃO CEREBRAL ATINGIDA (Cap. 20.1.4): Ferimento Crítico na Cabeça neutraliza imediatamente o Infectado!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* COLUNA ESQUERDA: Silhueta Corporal SVG Padrão Interativa (5 cols) */}
        <div className="md:col-span-5 bg-bg-main border border-muted-ash/20 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-muted-ash mb-2">
            <span>Clique em um membro:</span>
            {lastLocRoll && (
              <span className="text-secondary-uv font-bold">
                1d20 = [{lastLocRoll.roll}] → {BODY_PART_LABELS[lastLocRoll.part].name}
              </span>
            )}
          </div>

          {/* Silhueta Anatômica Padrão (SVG Interativo com as 6 Regiões do Livro) */}
          <svg
            viewBox="0 0 220 340"
            className="w-48 h-72 select-none"
            aria-label="Diagrama Anatômico de Ferimentos"
          >
            {/* 1. CABEÇA (1 no d20 | Penalidade -5) */}
            {(() => {
              const c = getPartColor('head');
              return (
                <g
                  onClick={() => setSelectedPart('head')}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <circle
                    cx="110"
                    cy="42"
                    r="26"
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth="2.5"
                  />
                  <text
                    x="110"
                    y="45"
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    CABEÇA (1)
                  </text>
                </g>
              );
            })()}

            {/* 2. TORSO (8-14 no d20 | Penalidade -2) */}
            {(() => {
              const c = getPartColor('torso');
              return (
                <g
                  onClick={() => setSelectedPart('torso')}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <rect
                    x="74"
                    y="76"
                    width="72"
                    height="112"
                    rx="10"
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth="2.5"
                  />
                  <text
                    x="110"
                    y="130"
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    TORSO
                  </text>
                  <text
                    x="110"
                    y="143"
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    (8–14)
                  </text>
                </g>
              );
            })()}

            {/* 3. BRAÇO ESQUERDO (2-4 no d20 | Penalidade -3) */}
            {(() => {
              const c = getPartColor('leftArm');
              return (
                <g
                  onClick={() => setSelectedPart('leftArm')}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <rect
                    x="34"
                    y="80"
                    width="32"
                    height="104"
                    rx="12"
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth="2.5"
                  />
                  <text
                    x="50"
                    y="130"
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    B. ESQ
                  </text>
                  <text
                    x="50"
                    y="142"
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    (2–4)
                  </text>
                </g>
              );
            })()}

            {/* 4. BRAÇO DIREITO (5-7 no d20 | Penalidade -3) */}
            {(() => {
              const c = getPartColor('rightArm');
              return (
                <g
                  onClick={() => setSelectedPart('rightArm')}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <rect
                    x="154"
                    y="80"
                    width="32"
                    height="104"
                    rx="12"
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth="2.5"
                  />
                  <text
                    x="170"
                    y="130"
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    B. DIR
                  </text>
                  <text
                    x="170"
                    y="142"
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    (5–7)
                  </text>
                </g>
              );
            })()}

            {/* 5. PERNA ESQUERDA (15-17 no d20 | Penalidade -3) */}
            {(() => {
              const c = getPartColor('leftLeg');
              return (
                <g
                  onClick={() => setSelectedPart('leftLeg')}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <rect
                    x="74"
                    y="196"
                    width="33"
                    height="126"
                    rx="12"
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth="2.5"
                  />
                  <text
                    x="90.5"
                    y="255"
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    P. ESQ
                  </text>
                  <text
                    x="90.5"
                    y="267"
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    (15–17)
                  </text>
                </g>
              );
            })()}

            {/* 6. PERNA DIREITA (18-20 no d20 | Penalidade -3) */}
            {(() => {
              const c = getPartColor('rightLeg');
              return (
                <g
                  onClick={() => setSelectedPart('rightLeg')}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <rect
                    x="113"
                    y="196"
                    width="33"
                    height="126"
                    rx="12"
                    fill={c.fill}
                    stroke={c.stroke}
                    strokeWidth="2.5"
                  />
                  <text
                    x="129.5"
                    y="255"
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    P. DIR
                  </text>
                  <text
                    x="129.5"
                    y="267"
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    (18–20)
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Legenda Anatômica */}
          <div className="w-full pt-2 border-t border-muted-ash/15 flex items-center justify-around text-[10px] font-mono text-muted-ash">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-bg-card border border-muted-ash" /> Intacto
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-warning-rust" /> Leve
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary-blood" /> Grave
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600" /> Crítico
            </span>
          </div>
        </div>

        {/* COLUNA DIREITA: Controles da Região Selecionada, Calculadora de Golpe e Lista de Ferimentos (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Região Ativa + Botões Rápidos de Adicionar Ferimento */}
          <div className="bg-bg-main border border-secondary-uv/40 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-secondary-uv">
                  Região Selecionada (1d20: {BODY_PART_LABELS[selectedPart].d20Range})
                </span>
                <h4 className="text-sm font-bold text-text-main">
                  {BODY_PART_LABELS[selectedPart].name}{' '}
                  <span className="text-xs font-mono font-normal text-muted-ash">
                    (Ataque Direcionado: {BODY_PART_LABELS[selectedPart].targetedPenalty})
                  </span>
                </h4>
              </div>
            </div>

            {/* Adicionar Ferimento Direto na Região */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['leve', 'grave', 'critico', 'devastador'] as WoundSeverity[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => handleAddWound(sev)}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1 transition-all ${SEVERITY_INFO[sev].badgeClass}`}
                >
                  <Plus className="w-3 h-3" />
                  {sev.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Calculadora Automática de Dano vs LF (com Regra de Dano Balístico) */}
            {!compact && (
              <form
                onSubmit={handleCalculateDamageHit}
                className="pt-2.5 border-t border-muted-ash/15 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-ash">Dano pós-PR:</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={incomingDamage}
                    onChange={(e) => setIncomingDamage(Number(e.target.value))}
                    className="w-16 bg-bg-card border border-muted-ash/30 rounded px-2 py-1 font-mono font-bold text-text-main"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-[11px] text-muted-ash cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBallistic}
                    onChange={(e) => setIsBallistic(e.target.checked)}
                    className="accent-primary-blood"
                  />
                  Balístico (-2 LF)
                </label>

                {isBallistic && (
                  <label className="flex items-center gap-1.5 text-[11px] text-secondary-uv cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBallisticArmor}
                      onChange={(e) => setHasBallisticArmor(e.target.checked)}
                      className="accent-secondary-uv"
                    />
                    Proteção Balística
                  </label>
                )}

                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-primary-blood hover:bg-primary-blood/90 text-text-main font-semibold text-[11px]"
                >
                  Aplicar Golpe
                </button>
              </form>
            )}
          </div>

          {/* Lista de Ferimentos Ativos no Corpo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-muted-ash">
                Ferimentos Registrados ({wounds.length})
              </span>

              {wounds.some((w) => !w.isStaunched) && (
                <button
                  type="button"
                  onClick={handleRollActiveBleedings}
                  className="px-2.5 py-1 rounded bg-primary-blood/30 border border-primary-blood text-text-main text-[11px] font-mono font-bold flex items-center gap-1 hover:bg-primary-blood"
                >
                  <Droplet className="w-3.5 h-3.5 text-primary-blood" />
                  Rolar Sangramentos do Turno
                </button>
              )}
            </div>

            {bleedLog && (
              <div className="p-2 rounded bg-primary-blood/20 border border-primary-blood/50 text-[11px] font-mono text-text-main">
                {bleedLog}
              </div>
            )}

            {wounds.length === 0 ? (
              <div className="bg-bg-main/60 border border-dashed border-muted-ash/20 rounded-xl p-5 text-center text-xs text-muted-ash">
                Nenhuma lesão anatômica ativa. O corpo está íntegro.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {wounds.map((w) => {
                  const sev = SEVERITY_INFO[w.severity];
                  return (
                    <div
                      key={w.id}
                      className="bg-bg-main border border-muted-ash/20 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${sev.badgeClass}`}>
                            {sev.label}
                          </span>
                          <strong className="text-text-main">
                            {BODY_PART_LABELS[w.part].name}
                          </strong>
                        </div>
                        <div className="text-[11px] font-mono text-muted-ash">
                          Sangramento: <strong className="text-primary-blood">{w.bleedingDice}</strong> •
                          Estancar/Tratar: <strong>Medicina DT {sev.medDT}</strong> ({sev.treatTime}) •
                          Cura: {sev.healTime}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleStaunched(w.id)}
                          className={`px-2 py-1 rounded border text-[10px] font-mono flex items-center gap-1 ${
                            w.isStaunched
                              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                              : 'bg-primary-blood/25 border-primary-blood text-text-main'
                          }`}
                        >
                          <Bandage className="w-3 h-3" />
                          {w.isStaunched ? 'Estancado' : `Sangrando (${w.bleedingDice})`}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTreated(w.id)}
                          className={`px-2 py-1 rounded border text-[10px] font-mono flex items-center gap-1 ${
                            w.isTreated
                              ? 'bg-secondary-uv/30 border-secondary-uv text-text-main'
                              : 'bg-bg-card border-muted-ash/30 text-muted-ash'
                          }`}
                        >
                          <Stethoscope className="w-3 h-3" />
                          {w.isTreated ? 'Tratado' : 'Tratar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeWound(w.id)}
                          title="Curar / Remover Ferimento"
                          className="p-1 text-muted-ash hover:text-primary-blood"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rastreador de Estado MORRENDO (Cap. 11.5: 3 Sucessos vs 3 Falhas, Fortitude DT 15) */}
          {!isNpc && pvCurrent <= 0 && onChangeDying && (
            <div className="bg-primary-blood/20 border-2 border-primary-blood rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-main flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-primary-blood" />
                  ESTADO MORRENDO (0 PV) — Teste: Fortitude DT 15
                </span>
                <span className="text-[10px] font-mono text-muted-ash">
                  20 Natural = Estabiliza | 1 Natural = 2 Falhas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-bg-main p-2.5 rounded-lg border border-secondary-uv/40 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-secondary-uv font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sucessos ({dyingSuccesses}/3)
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeDying(Math.max(0, dyingSuccesses - 1), dyingFailures)
                      }
                      className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/30"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeDying(Math.min(3, dyingSuccesses + 1), dyingFailures)
                      }
                      className="px-2 py-0.5 rounded bg-secondary-uv text-text-main font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-bg-main p-2.5 rounded-lg border border-primary-blood/50 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-primary-blood font-bold">
                    <Skull className="w-3.5 h-3.5" /> Falhas ({dyingFailures}/3)
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeDying(dyingSuccesses, Math.max(0, dyingFailures - 1))
                      }
                      className="px-2 py-0.5 rounded bg-bg-card border border-muted-ash/30"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChangeDying(dyingSuccesses, Math.min(3, dyingFailures + 1))
                      }
                      className="px-2 py-0.5 rounded bg-primary-blood text-text-main font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
