import React, { useState } from 'react';
import {
  Swords,
  ChevronRight,
  Plus,
  Trash2,
  Skull,
  Shield,
  Heart,
} from 'lucide-react';
import { Combatant } from '../../types/database';

interface CombatTrackerProps {
  combatants: Combatant[];
  activeTurnIndex: number;
  roundNumber: number;
  isMaster: boolean;
  onNextTurn: () => void;
  onAddCombatant: (name: string, initiative: number, isNpc: boolean, pvMax?: number) => void;
  onRemoveCombatant: (id: string) => void;
}

export const CombatTracker: React.FC<CombatTrackerProps> = ({
  combatants,
  activeTurnIndex,
  roundNumber,
  isMaster,
  onNextTurn,
  onAddCombatant,
  onRemoveCombatant,
}) => {
  const [name, setName] = useState('');
  const [initiative, setInitiative] = useState<number>(12);
  const [isNpc, setIsNpc] = useState<boolean>(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCombatant(name.trim(), Number(initiative) || 10, isNpc, isNpc ? 24 : 15);
    setName('');
    setInitiative(12);
  };

  return (
    <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-4 space-y-4">
      {/* Cabeçalho do Tracker */}
      <div className="flex items-center justify-between border-b border-muted-ash/15 pb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary-blood" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-main">
              Tracker de Combate
            </h3>
            <span className="text-[11px] font-mono text-muted-ash">
              RODADA ATUAL: <strong className="text-warning-rust">#{roundNumber}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextTurn}
          className="px-3 py-1.5 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-xs font-semibold flex items-center gap-1 shadow-blood-glow transition-all"
        >
          Próximo Turno
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lista Ordenada por Iniciativa */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {combatants.map((c, idx) => {
          const isTurn = idx === activeTurnIndex;
          return (
            <div
              key={c.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                isTurn
                  ? 'bg-primary-blood/20 border-primary-blood shadow-blood-glow'
                  : 'bg-bg-main border-muted-ash/15'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-7 h-7 rounded-md font-mono font-bold flex items-center justify-center shrink-0 ${
                    c.isNpc
                      ? 'bg-primary-blood text-text-main'
                      : 'bg-secondary-uv text-text-main'
                  }`}
                >
                  {c.initiative}
                </span>

                <div className="truncate">
                  <div className="font-semibold text-text-main flex items-center gap-1.5 truncate">
                    {c.isNpc ? (
                      <Skull className="w-3.5 h-3.5 text-primary-blood shrink-0" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-secondary-uv shrink-0" />
                    )}
                    <span className="truncate">{c.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-ash flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-primary-blood" />
                      {c.pvCurrent}/{c.pvMax} PV
                    </span>
                    {isTurn && (
                      <span className="text-warning-rust font-bold uppercase">
                        • EM AÇÃO
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isMaster && (
                <button
                  type="button"
                  onClick={() => onRemoveCombatant(c.id)}
                  title="Remover do combate"
                  className="p-1 text-muted-ash hover:text-primary-blood transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Formulário Rápido para Adicionar Combatente / NPC */}
      <form onSubmit={handleAdd} className="pt-2 border-t border-muted-ash/15 grid grid-cols-12 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (Personagem ou Criatura)..."
          className="col-span-6 bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-1.5 text-xs text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
        />
        <input
          type="number"
          value={initiative}
          onChange={(e) => setInitiative(Number(e.target.value))}
          title="Valor de Iniciativa"
          className="col-span-2 bg-bg-main border border-muted-ash/30 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-text-main focus:outline-none focus:border-secondary-uv"
        />
        <button
          type="button"
          onClick={() => setIsNpc((v) => !v)}
          className={`col-span-2 rounded-lg text-[10px] font-mono uppercase border ${
            isNpc
              ? 'bg-primary-blood/25 border-primary-blood text-text-main'
              : 'bg-secondary-uv/25 border-secondary-uv text-text-main'
          }`}
        >
          {isNpc ? 'NPC' : 'PJ'}
        </button>
        <button
          type="submit"
          className="col-span-2 bg-secondary-uv hover:bg-secondary-uv/90 text-text-main rounded-lg flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
