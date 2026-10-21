import React, { useState } from 'react';
import {
  Package,
  Utensils,
  Droplets,
  AlertTriangle,
  Plus,
  Trash2,
  Scale,
  Flame,
} from 'lucide-react';
import { Character, InventoryItem } from '../../types/database';

interface InventorySurvivalPanelProps {
  character: Character;
  onUpdateCharacter: (updated: Character) => void;
}

const CATEGORY_LABELS: Record<InventoryItem['category'], string> = {
  weapon: 'Armamento',
  ration: 'Comida / Ração',
  water: 'Água',
  medical: 'Médico / Antiviral',
  gear: 'Equipamento',
};

export const InventorySurvivalPanel: React.FC<InventorySurvivalPanelProps> = ({
  character,
  onUpdateCharacter,
}) => {
  const [itemName, setItemName] = useState('');
  const [itemWeight, setItemWeight] = useState<number>(1);
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemCategory, setItemCategory] = useState<InventoryItem['category']>('gear');

  // Cálculo de Carga Máxima: Base 5 + (FOR * 3) + VIG
  const maxCarryCapacity = 5 + character.attr_for * 3 + character.attr_vig;
  const currentWeight = (character.inventory || []).reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0
  );
  const isOverloaded = currentWeight > maxCarryCapacity;
  const loadPercentage = Math.min(100, Math.round((currentWeight / maxCarryCapacity) * 100));

  const consumeFood = () => {
    if (character.food_portions <= 0) return;
    onUpdateCharacter({
      ...character,
      food_portions: character.food_portions - 1,
      pv_current: Math.min(character.pv_max, character.pv_current + 2),
    });
  };

  const consumeWater = () => {
    if (character.water_portions <= 0) return;
    onUpdateCharacter({
      ...character,
      water_portions: character.water_portions - 1,
      fatigue: Math.max(0, character.fatigue - 1),
    });
  };

  const adjustPortion = (field: 'food_portions' | 'water_portions' | 'fatigue', delta: number) => {
    const nextVal = Math.max(0, (character[field] as number) + delta);
    onUpdateCharacter({
      ...character,
      [field]: nextVal,
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      weight: Number(itemWeight) || 0,
      quantity: Math.max(1, Number(itemQty) || 1),
      category: itemCategory,
    };

    const nextInventory = [...(character.inventory || []), newItem];
    const nextWeight = nextInventory.reduce((s, i) => s + i.weight * i.quantity, 0);

    // Se o novo item ultrapassar a capacidade máxima, aplica +1 de Fadiga por Sobrecarga
    const nextFatigue =
      nextWeight > maxCarryCapacity && !isOverloaded
        ? character.fatigue + 1
        : character.fatigue;

    onUpdateCharacter({
      ...character,
      inventory: nextInventory,
      fatigue: nextFatigue,
    });

    setItemName('');
    setItemWeight(1);
    setItemQty(1);
  };

  const handleRemoveItem = (id: string) => {
    onUpdateCharacter({
      ...character,
      inventory: character.inventory.filter((i) => i.id !== id),
    });
  };

  const handleChangeItemQty = (id: string, delta: number) => {
    const nextInventory = character.inventory
      .map((item) => {
        if (item.id !== id) return item;
        return { ...item, quantity: item.quantity + delta };
      })
      .filter((item) => item.quantity > 0);

    onUpdateCharacter({
      ...character,
      inventory: nextInventory,
    });
  };

  return (
    <div className="space-y-6">
      {/* Controle de Sobrevivência: Porções (Comida/Água) e Fadiga */}
      <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
            <Flame className="w-4 h-4 text-warning-rust" />
            Racionamento & Sobrevivência (Fome / Sede / Fadiga)
          </h3>
          <span className="text-[11px] font-mono text-warning-rust">
            ALERTA DE ESCASSEZ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Porções de Comida */}
          <div className="bg-bg-main border border-warning-rust/30 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-ash flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-warning-rust" />
                Porções de Comida
              </span>
              <span className="text-lg font-mono font-bold text-text-main">
                {character.food_portions}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustPortion('food_portions', -1)}
                  className="px-2 py-1 rounded bg-bg-card border border-muted-ash/20 text-xs hover:border-warning-rust"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => adjustPortion('food_portions', 1)}
                  className="px-2 py-1 rounded bg-bg-card border border-muted-ash/20 text-xs hover:border-warning-rust"
                >
                  +1
                </button>
              </div>
              <button
                type="button"
                disabled={character.food_portions <= 0}
                onClick={consumeFood}
                className="px-2.5 py-1 rounded bg-warning-rust hover:bg-warning-rust/90 disabled:opacity-40 text-text-main text-xs font-semibold transition-all"
              >
                Consumir (+2 PV)
              </button>
            </div>
          </div>

          {/* Porções de Água */}
          <div className="bg-bg-main border border-secondary-uv/30 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-ash flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-secondary-uv" />
                Porções de Água
              </span>
              <span className="text-lg font-mono font-bold text-text-main">
                {character.water_portions}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustPortion('water_portions', -1)}
                  className="px-2 py-1 rounded bg-bg-card border border-muted-ash/20 text-xs hover:border-secondary-uv"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => adjustPortion('water_portions', 1)}
                  className="px-2 py-1 rounded bg-bg-card border border-muted-ash/20 text-xs hover:border-secondary-uv"
                >
                  +1
                </button>
              </div>
              <button
                type="button"
                disabled={character.water_portions <= 0}
                onClick={consumeWater}
                className="px-2.5 py-1 rounded bg-secondary-uv hover:bg-secondary-uv/90 disabled:opacity-40 text-text-main text-xs font-semibold transition-all"
              >
                Hidratar (-1 Fadiga)
              </button>
            </div>
          </div>

          {/* Nível de Fadiga */}
          <div className="bg-bg-main border border-primary-blood/30 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-ash flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-primary-blood" />
                Nível de Fadiga
              </span>
              <span className="text-lg font-mono font-bold text-primary-blood">
                {character.fatigue}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-ash">
              <span>Penalidade nos testes: <strong className="text-primary-blood">-{character.fatigue}</strong></span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustPortion('fatigue', -1)}
                  className="px-2 py-1 rounded bg-bg-card border border-muted-ash/20 text-text-main hover:border-primary-blood"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => adjustPortion('fatigue', 1)}
                  className="px-2 py-1 rounded bg-bg-card border border-muted-ash/20 text-text-main hover:border-primary-blood"
                >
                  +1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gerenciador de Inventário e Carga */}
      <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
            <Package className="w-4 h-4 text-secondary-uv" />
            Inventário Tático & Controle de Carga
          </h3>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-muted-ash" />
              Carga: <strong className={isOverloaded ? 'text-primary-blood' : 'text-text-main'}>{currentWeight}</strong> / {maxCarryCapacity} esp.
            </span>
            {isOverloaded && (
              <span className="px-2 py-0.5 rounded bg-primary-blood/20 border border-primary-blood text-primary-blood font-bold">
                SOBRECARGA (+FADIGA)
              </span>
            )}
          </div>
        </div>

        {/* Barra de Progresso de Carga */}
        <div className="w-full h-2 bg-bg-main rounded-full overflow-hidden border border-muted-ash/15">
          <div
            className={`h-full transition-all ${
              isOverloaded
                ? 'bg-primary-blood'
                : loadPercentage > 75
                ? 'bg-warning-rust'
                : 'bg-secondary-uv'
            }`}
            style={{ width: `${loadPercentage}%` }}
          />
        </div>

        {/* Lista de Itens */}
        <div className="space-y-2">
          {(character.inventory || []).length === 0 ? (
            <p className="text-xs text-muted-ash italic py-3 text-center bg-bg-main/50 rounded-lg">
              Mochila vazia. Adicione armamentos, suprimentos ou equipamentos abaixo.
            </p>
          ) : (
            character.inventory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-bg-main border border-muted-ash/15 rounded-lg px-3.5 py-2.5 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-text-main truncate">{item.name}</div>
                  <div className="text-[11px] text-muted-ash font-mono">
                    {CATEGORY_LABELS[item.category]} • Peso unitário: {item.weight} • Total: {item.weight * item.quantity}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleChangeItemQty(item.id, -1)}
                    className="w-6 h-6 rounded bg-bg-card border border-muted-ash/25 hover:border-text-main text-text-main"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold w-6 text-center">{item.quantity}x</span>
                  <button
                    type="button"
                    onClick={() => handleChangeItemQty(item.id, 1)}
                    className="w-6 h-6 rounded bg-bg-card border border-muted-ash/25 hover:border-text-main text-text-main"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Descartar item"
                    className="p-1.5 text-muted-ash hover:text-primary-blood transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulário para Adicionar Novo Item */}
        <form onSubmit={handleAddItem} className="pt-3 border-t border-muted-ash/15 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <input
            type="text"
            placeholder="Nome do item (Ex: Lanterna UV, Munição)..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="sm:col-span-5 bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-2 text-xs text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
          />
          <select
            value={itemCategory}
            onChange={(e) => setItemCategory(e.target.value as InventoryItem['category'])}
            className="sm:col-span-3 bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-secondary-uv"
          >
            <option value="gear">Equipamento</option>
            <option value="weapon">Armamento</option>
            <option value="medical">Médico / Antiviral</option>
            <option value="ration">Comida / Ração</option>
            <option value="water">Água</option>
          </select>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={itemWeight}
            onChange={(e) => setItemWeight(Number(e.target.value))}
            title="Peso / Espaços"
            placeholder="Peso"
            className="sm:col-span-2 bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-secondary-uv"
          />
          <button
            type="submit"
            className="sm:col-span-2 flex items-center justify-center gap-1.5 bg-secondary-uv hover:bg-secondary-uv/90 text-text-main text-xs font-semibold rounded-lg py-2 px-3 transition-all shadow-uv-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
};
