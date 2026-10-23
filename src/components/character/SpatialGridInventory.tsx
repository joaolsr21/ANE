import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  Shield,
  Crosshair,
  Package,
  Pill,
  Droplets,
  Utensils,
  Plus,
  Trash2,
  Info,
  Swords,
} from 'lucide-react';
import { ANE_BACKPACKS } from '../../data/aneSystemRules';

// Slots oficiais do Capítulo 15.1.3:
// 1 Arma Principal, 1 Arma Secundária, 2 Armas Corpo a Corpo + Proteção Corporal
export type EquipmentSlotKey =
  | 'primaryWeapon'
  | 'secondaryWeapon'
  | 'meleeWeapon1'
  | 'meleeWeapon2'
  | 'armor';

export interface SpatialGridItem {
  id: string;
  name: string;
  category: 'firearm' | 'melee' | 'medical' | 'water' | 'ration' | 'armor' | 'gear';
  width: number;  // Colunas ocupadas
  height: number; // Linhas ocupadas
  x: number;      // Coluna inicial na mochila (0 a 7)
  y: number;      // Linha inicial na mochila
  rotated?: boolean;
  equippedSlot?: EquipmentSlotKey | null;
  statsSummary: string;
}

export const CELL_SIZE_PX = 50;

// Catálogo oficial do Capítulo 15 e Capítulo 16 (Armas Corpo a Corpo, Armas de Fogo, Proteções e Suprimentos)
export const SPATIAL_ITEM_TEMPLATES: Array<Omit<SpatialGridItem, 'id' | 'x' | 'y'>> = [
  // Armas Corpo a Corpo (Cap. 16.2)
  {
    name: 'Canivete',
    category: 'melee',
    width: 1,
    height: 1,
    statsSummary: '1×1 • 1d4 Perfuração (Crít 19/×2) • Pequena',
  },
  {
    name: 'Faca Tática',
    category: 'melee',
    width: 1,
    height: 2,
    statsSummary: '1×2 • 1d6 Corte/Perfuração (19/×2) • Arremesso',
  },
  {
    name: 'Machadinha',
    category: 'melee',
    width: 1,
    height: 2,
    statsSummary: '1×2 • 1d8+2 Corte (20/×2) • Arremesso',
  },
  {
    name: 'Pé de Cabra',
    category: 'melee',
    width: 1,
    height: 3,
    statsSummary: '1×3 • 1d8+2 Impacto (20/×2) • Ferramenta',
  },
  {
    name: 'Facão',
    category: 'melee',
    width: 1,
    height: 3,
    statsSummary: '1×3 • 1d10 Corte (19/×2)',
  },
  {
    name: 'Machado de Bombeiro',
    category: 'melee',
    width: 2,
    height: 3,
    statsSummary: '2×3 • 1d12+2 Corte (20/×2) • Pesada',
  },
  {
    name: 'Marreta',
    category: 'melee',
    width: 2,
    height: 4,
    statsSummary: '2×4 • 2d8 Impacto (20/×2) • Pesada',
  },
  // Armas de Disparo & Fogo (Cap. 16.3)
  {
    name: 'Glock 17 (9mm)',
    category: 'firearm',
    width: 1,
    height: 2,
    statsSummary: '1×2 • 2d6 Balístico (19/×2) • Alc 18m • Cap 17',
  },
  {
    name: 'Taurus 82 (.38)',
    category: 'firearm',
    width: 1,
    height: 2,
    statsSummary: '1×2 • 2d6 Balístico (19/×2) • Confiável • Cap 6',
  },
  {
    name: 'Desert Eagle (.50)',
    category: 'firearm',
    width: 1,
    height: 2,
    statsSummary: '1×2 • 2d8 Balístico (20/×3) • Pesada • Cap 7',
  },
  {
    name: 'MP5 (9mm)',
    category: 'firearm',
    width: 1,
    height: 3,
    statsSummary: '1×3 • 2d6 Balístico (20/×2) • Automática • Cap 30',
  },
  {
    name: 'M1014 (Cal. 12)',
    category: 'firearm',
    width: 4,
    height: 2,
    statsSummary: '2×4 • 3d6 Balístico (20/×2) • Dispersão • Cap 7',
  },
  {
    name: 'M4 (5.56)',
    category: 'firearm',
    width: 4,
    height: 2,
    statsSummary: '2×4 • 2d10 Balístico (20/×2) • Automática • Cap 30',
  },
  {
    name: 'AK (7.62×39)',
    category: 'firearm',
    width: 4,
    height: 2,
    statsSummary: '2×4 • 2d12 Balístico (20/×2) • Confiável • Cap 30',
  },
  {
    name: 'Rifle .308',
    category: 'firearm',
    width: 5,
    height: 2,
    statsSummary: '2×5 • 2d12 Balístico (19/×2) • Ferrolho, Precisão',
  },
  {
    name: 'Besta Tática',
    category: 'firearm',
    width: 4,
    height: 2,
    statsSummary: '2×4 • 1d10+2 Perfuração (19/×2) • Silenciosa',
  },
  // Proteções (Cap. 16.5)
  {
    name: 'Jaqueta de Moto',
    category: 'armor',
    width: 2,
    height: 2,
    statsSummary: '2×2 • PR 3 Corte, PR 2 Impacto • Resistente a Mordidas',
  },
  {
    name: 'Colete Balístico',
    category: 'armor',
    width: 2,
    height: 3,
    statsSummary: '2×3 • PR 5 Balístico (Cancela -2 LF Balístico)',
  },
  {
    name: 'Mangas/Luvas Anticorte',
    category: 'armor',
    width: 1,
    height: 2,
    statsSummary: '1×2 • PR 3 Corte • Resistente a Mordidas',
  },
  // Suprimentos, Água, Comida e UV
  {
    name: 'Curativo / Bandagem',
    category: 'medical',
    width: 1,
    height: 1,
    statsSummary: '1×1 • Auxilia em Estancar Sangramento e Medicina',
  },
  {
    name: 'Kit Médico de Triagem',
    category: 'medical',
    width: 2,
    height: 2,
    statsSummary: '2×2 • Ferramenta adequada p/ tratar Ferimentos Graves/Críticos',
  },
  {
    name: 'Garrafa de Água (1L)',
    category: 'water',
    width: 1,
    height: 2,
    statsSummary: '1×2 • 1 Litro = 2 Porções de Água (Cap. 12.1.3)',
  },
  {
    name: 'Porção de Comida / Lata',
    category: 'ration',
    width: 1,
    height: 1,
    statsSummary: '1×1 • 1 Porção de Comida (Sustenta 12 horas)',
  },
  {
    name: 'Lanterna UV Portátil',
    category: 'gear',
    width: 1,
    height: 2,
    statsSummary: '1×2 • Alcance 6m • Deixa Fotossensíveis Repelidos (Cap. 19.4.2)',
  },
];

const INITIAL_MOCK_ITEMS: SpatialGridItem[] = [
  {
    id: 'sp-1',
    name: 'Glock 17 (9mm)',
    category: 'firearm',
    width: 1,
    height: 2,
    x: 0,
    y: 0,
    statsSummary: '1×2 • 2d6 Balístico (19/×2) • Alc 18m • Cap 17',
  },
  {
    id: 'sp-2',
    name: 'Faca Tática',
    category: 'melee',
    width: 1,
    height: 2,
    x: 1,
    y: 0,
    statsSummary: '1×2 • 1d6 Corte/Perfuração (19/×2)',
  },
  {
    id: 'sp-3',
    name: 'Garrafa de Água (1L)',
    category: 'water',
    width: 1,
    height: 2,
    x: 2,
    y: 0,
    statsSummary: '1×2 • 2 Porções de Água',
  },
  {
    id: 'sp-4',
    name: 'Porção de Comida / Lata',
    category: 'ration',
    width: 1,
    height: 1,
    x: 3,
    y: 0,
    statsSummary: '1×1 • 1 Porção de Comida',
  },
  {
    id: 'sp-5',
    name: 'Curativo / Bandagem',
    category: 'medical',
    width: 1,
    height: 1,
    x: 3,
    y: 1,
    statsSummary: '1×1 • Material médico',
  },
];

export function canItemFitAt(
  itemsInBackpack: SpatialGridItem[],
  targetX: number,
  targetY: number,
  width: number,
  height: number,
  gridCols: number,
  gridRows: number,
  ignoreItemId?: string
): boolean {
  if (
    targetX < 0 ||
    targetY < 0 ||
    targetX + width > gridCols ||
    targetY + height > gridRows
  ) {
    return false;
  }

  for (const other of itemsInBackpack) {
    if (other.id === ignoreItemId || other.equippedSlot) continue;

    const overlapX = targetX < other.x + other.width && targetX + width > other.x;
    const overlapY = targetY < other.y + other.height && targetY + height > other.y;

    if (overlapX && overlapY) {
      return false;
    }
  }

  return true;
}

export const SpatialGridInventory: React.FC = () => {
  const [selectedBackpackId, setSelectedBackpackId] = useState<string>('expedicao');
  const [items, setItems] = useState<SpatialGridItem[]>(INITIAL_MOCK_ITEMS);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number>(0);

  const activeBackpack =
    ANE_BACKPACKS.find((b) => b.id === selectedBackpackId) || ANE_BACKPACKS[6];

  const gridCols = activeBackpack.cols;
  const gridRows = activeBackpack.rows;

  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    width: number;
    height: number;
    rotated: boolean;
  } | null>(null);

  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const backpackItems = items.filter((i) => !i.equippedSlot);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'r' || e.key === 'R') && draggingItem) {
        e.preventDefault();
        setDraggingItem((prev) =>
          prev
            ? {
                ...prev,
                width: prev.height,
                height: prev.width,
                rotated: !prev.rotated,
              }
            : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draggingItem]);

  const isHoverValid = useCallback(() => {
    if (!draggingItem || !hoverCell) return false;
    return canItemFitAt(
      backpackItems,
      hoverCell.x,
      hoverCell.y,
      draggingItem.width,
      draggingItem.height,
      gridCols,
      gridRows,
      draggingItem.id
    );
  }, [backpackItems, draggingItem, hoverCell, gridCols, gridRows]);

  const handleDragStart = (e: React.DragEvent, item: SpatialGridItem) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingItem({
      id: item.id,
      width: item.width,
      height: item.height,
      rotated: Boolean(item.rotated),
    });
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
    setHoverCell(null);
  };

  const handleCellDragOver = (e: React.DragEvent, cellX: number, cellY: number) => {
    e.preventDefault();
    if (!hoverCell || hoverCell.x !== cellX || hoverCell.y !== cellY) {
      setHoverCell({ x: cellX, y: cellY });
    }
  };

  const handleCellDrop = (e: React.DragEvent, cellX: number, cellY: number) => {
    e.preventDefault();
    if (!draggingItem) return;

    const valid = canItemFitAt(
      backpackItems,
      cellX,
      cellY,
      draggingItem.width,
      draggingItem.height,
      gridCols,
      gridRows,
      draggingItem.id
    );

    if (valid) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === draggingItem.id
            ? {
                ...item,
                x: cellX,
                y: cellY,
                width: draggingItem.width,
                height: draggingItem.height,
                rotated: draggingItem.rotated,
                equippedSlot: null,
              }
            : item
        )
      );
    }

    setDraggingItem(null);
    setHoverCell(null);
  };

  const rotatePlacedItem = (item: SpatialGridItem) => {
    const newW = item.height;
    const newH = item.width;
    if (
      canItemFitAt(backpackItems, item.x, item.y, newW, newH, gridCols, gridRows, item.id)
    ) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, width: newW, height: newH, rotated: !i.rotated }
            : i
        )
      );
    }
  };

  const handleDropOnEquipmentSlot = (
    e: React.DragEvent,
    slotKey: EquipmentSlotKey,
    acceptedCategories: SpatialGridItem['category'][]
  ) => {
    e.preventDefault();
    if (!draggingItem) return;

    const draggedObj = items.find((i) => i.id === draggingItem.id);
    if (!draggedObj) return;

    const alreadyEquipped = items.find(
      (i) => i.equippedSlot === slotKey && i.id !== draggedObj.id
    );
    if (alreadyEquipped || !acceptedCategories.includes(draggedObj.category)) {
      setDraggingItem(null);
      setHoverCell(null);
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === draggedObj.id ? { ...i, equippedSlot: slotKey } : i
      )
    );
    setDraggingItem(null);
    setHoverCell(null);
  };

  const addTemplateToBackpack = (
    tpl: Omit<SpatialGridItem, 'id' | 'x' | 'y'>
  ) => {
    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        if (canItemFitAt(backpackItems, x, y, tpl.width, tpl.height, gridCols, gridRows)) {
          const newItem: SpatialGridItem = {
            ...tpl,
            id: `sp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            x,
            y,
          };
          setItems((prev) => [...prev, newItem]);
          return;
        }
      }
    }
    alert(
      `Espaço insuficiente na ${activeBackpack.name} (${gridCols}×${gridRows})! Reorganize, gire itens ou troque para uma mochila maior.`
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const getCategoryTheme = (cat: SpatialGridItem['category']) => {
    switch (cat) {
      case 'firearm':
        return {
          bg: 'bg-primary-blood/35 border-primary-blood',
          badge: 'text-primary-blood',
          icon: Crosshair,
        };
      case 'melee':
        return {
          bg: 'bg-warning-rust/30 border-warning-rust',
          badge: 'text-warning-rust',
          icon: Swords,
        };
      case 'medical':
        return {
          bg: 'bg-secondary-uv/35 border-secondary-uv',
          badge: 'text-secondary-uv',
          icon: Pill,
        };
      case 'water':
        return {
          bg: 'bg-secondary-uv/25 border-secondary-uv/70',
          badge: 'text-secondary-uv',
          icon: Droplets,
        };
      case 'ration':
        return {
          bg: 'bg-warning-rust/35 border-warning-rust',
          badge: 'text-warning-rust',
          icon: Utensils,
        };
      case 'armor':
        return {
          bg: 'bg-muted-ash/25 border-text-main/60',
          badge: 'text-text-main',
          icon: Shield,
        };
      default:
        return {
          bg: 'bg-bg-card border-muted-ash/50',
          badge: 'text-muted-ash',
          icon: Package,
        };
    }
  };

  const validPlacement = isHoverValid();

  return (
    <div className="bg-bg-card border border-muted-ash/20 rounded-2xl p-6 space-y-6">
      {/* Cabeçalho do Inventário Espacial (Cap. 15 e Cap. 16) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-muted-ash/15 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-secondary-uv">
            CAPÍTULO 15 & 16 // MOCHILAS, ARMAS & PROTEÇÕES EM GRADE
          </span>
          <h3 className="text-lg font-extrabold text-text-main mt-0.5">
            Inventário Espacial ({activeBackpack.name} — {gridCols}×{gridRows})
          </h3>
          <p className="text-xs text-muted-ash">
            Característica da Mochila: <strong className="text-text-main">{activeBackpack.specialFeature}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor das 7 Mochilas Oficiais do Livro */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-ash">Mochila:</span>
            <select
              value={selectedBackpackId}
              onChange={(e) => setSelectedBackpackId(e.target.value)}
              className="bg-bg-main border border-muted-ash/30 rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:outline-none focus:border-secondary-uv"
            >
              {ANE_BACKPACKS.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.name} ({bp.cols}×{bp.rows})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-ash bg-bg-main px-3 py-2 rounded-xl border border-muted-ash/20">
            <Info className="w-4 h-4 text-secondary-uv shrink-0" />
            <span>
              Tecla{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/40 font-mono text-text-main">
                R
              </kbd>{' '}
              gira o item 90°.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: Slots Equipados no Corpo (Cap. 15.1.3) + Catálogo Oficial (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-ash">
            Itens Equipados no Corpo (1 Principal • 1 Secundária • 2 Corpo a Corpo • Proteção)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(
              [
                {
                  key: 'primaryWeapon',
                  label: '1. Arma Principal',
                  hint: 'Fuzil, Espingarda, Rifle, Besta...',
                  accepts: ['firearm', 'melee'],
                },
                {
                  key: 'secondaryWeapon',
                  label: '2. Arma Secundária',
                  hint: 'Pistola, Revólver, Submetralhadora...',
                  accepts: ['firearm', 'melee'],
                },
                {
                  key: 'meleeWeapon1',
                  label: '3. Corpo a Corpo (01)',
                  hint: 'Faca, Facão, Machado, Pé de Cabra...',
                  accepts: ['melee'],
                },
                {
                  key: 'meleeWeapon2',
                  label: '4. Corpo a Corpo (02)',
                  hint: 'Canivete, Bastão, Machadinha...',
                  accepts: ['melee'],
                },
                {
                  key: 'armor',
                  label: '5. Proteção Corporal',
                  hint: 'Colete Balístico, Jaqueta de Moto...',
                  accepts: ['armor'],
                },
              ] as Array<{
                key: EquipmentSlotKey;
                label: string;
                hint: string;
                accepts: SpatialGridItem['category'][];
              }>
            ).map((slot) => {
              const equippedItem = items.find((i) => i.equippedSlot === slot.key);

              return (
                <div
                  key={slot.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) =>
                    handleDropOnEquipmentSlot(e, slot.key, slot.accepts)
                  }
                  className={`min-h-[96px] rounded-xl p-3 border-2 border-dashed transition-all flex flex-col justify-between ${
                    equippedItem
                      ? 'bg-bg-main border-secondary-uv shadow-uv-glow'
                      : 'bg-bg-main/60 border-muted-ash/25 hover:border-secondary-uv/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="uppercase text-muted-ash font-bold">
                      {slot.label}
                    </span>
                    <span className="text-[10px] text-secondary-uv">
                      {equippedItem
                        ? `${equippedItem.width}×${equippedItem.height}`
                        : 'LIVRE'}
                    </span>
                  </div>

                  {equippedItem ? (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, equippedItem)}
                      onDragEnd={handleDragEnd}
                      className="mt-1.5 p-2 rounded-lg bg-bg-card border border-secondary-uv/50 cursor-grab active:cursor-grabbing flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-text-main truncate">
                          {equippedItem.name}
                        </div>
                        <div className="text-[10px] font-mono text-muted-ash truncate">
                          {equippedItem.statsSummary}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(equippedItem.id)}
                        className="p-1 text-muted-ash hover:text-primary-blood shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-ash/60 italic py-2 text-center">
                      {slot.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Catálogo Oficial de Armas, Proteções e Recursos (Cap. 16) */}
          <div className="bg-bg-main border border-muted-ash/20 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-secondary-uv block font-bold">
              Catálogo Oficial do Livro (Cap. 15 e 16):
            </span>

            <div className="flex gap-2">
              <select
                value={selectedTemplateIdx}
                onChange={(e) => setSelectedTemplateIdx(Number(e.target.value))}
                className="flex-1 bg-bg-card border border-muted-ash/30 rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-secondary-uv"
              >
                {SPATIAL_ITEM_TEMPLATES.map((tpl, idx) => (
                  <option key={tpl.name} value={idx}>
                    [{tpl.width}×{tpl.height}] {tpl.name} — {tpl.statsSummary.split('•')[1]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  addTemplateToBackpack(SPATIAL_ITEM_TEMPLATES[selectedTemplateIdx])
                }
                className="px-3.5 py-2 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-uv-glow"
              >
                <Plus className="w-4 h-4" />
                Guardar
              </button>
            </div>

            <div className="text-[11px] font-mono text-muted-ash bg-bg-card p-2.5 rounded-lg border border-muted-ash/15">
              {SPATIAL_ITEM_TEMPLATES[selectedTemplateIdx]?.statsSummary}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: A Matriz Dinâmica da Mochila (8 × N) (7 cols) */}
        <div className="xl:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-ash">
              Grade da {activeBackpack.name} ({gridCols} Colunas × {gridRows} Linhas)
            </span>
            <span className="text-xs font-mono text-text-main">
              Espaços Ocupados:{' '}
              <strong className="text-secondary-uv">
                {backpackItems.reduce((acc, i) => acc + i.width * i.height, 0)}
              </strong>{' '}
              / {gridCols * gridRows}
            </span>
          </div>

          <div
            className="relative bg-bg-main/95 border-2 border-muted-ash/30 rounded-xl p-2 shadow-2xl select-none overflow-x-auto"
            onDragLeave={() => setHoverCell(null)}
          >
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, ${CELL_SIZE_PX}px)`,
                gridTemplateRows: `repeat(${gridRows}, ${CELL_SIZE_PX}px)`,
                width: `${gridCols * CELL_SIZE_PX}px`,
                height: `${gridRows * CELL_SIZE_PX}px`,
              }}
            >
              {Array.from({ length: gridRows }).map((_, rowIdx) =>
                Array.from({ length: gridCols }).map((__, colIdx) => {
                  let isWithinHoverFootprint = false;
                  if (draggingItem && hoverCell) {
                    isWithinHoverFootprint =
                      colIdx >= hoverCell.x &&
                      colIdx < hoverCell.x + draggingItem.width &&
                      rowIdx >= hoverCell.y &&
                      rowIdx < hoverCell.y + draggingItem.height;
                  }

                  return (
                    <div
                      key={`cell-${colIdx}-${rowIdx}`}
                      onDragOver={(e) => handleCellDragOver(e, colIdx, rowIdx)}
                      onDrop={(e) => handleCellDrop(e, colIdx, rowIdx)}
                      className={`border border-muted-ash/15 transition-colors flex items-end justify-end p-1 ${
                        isWithinHoverFootprint
                          ? validPlacement
                            ? 'bg-emerald-500/35 border-emerald-400'
                            : 'bg-red-600/40 border-red-400'
                          : 'bg-bg-card/40 hover:bg-bg-card/70'
                      }`}
                    >
                      <span className="text-[8px] font-mono text-muted-ash/30 pointer-events-none">
                        {colIdx},{rowIdx}
                      </span>
                    </div>
                  );
                })
              )}

              {backpackItems.map((item) => {
                const theme = getCategoryTheme(item.category);
                const Icon = theme.icon;
                const isBeingDragged = draggingItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    title={item.statsSummary}
                    style={{
                      left: `${item.x * CELL_SIZE_PX}px`,
                      top: `${item.y * CELL_SIZE_PX}px`,
                      width: `${item.width * CELL_SIZE_PX}px`,
                      height: `${item.height * CELL_SIZE_PX}px`,
                    }}
                    className={`absolute p-2 rounded-lg border-2 backdrop-blur-sm cursor-grab active:cursor-grabbing flex flex-col justify-between transition-transform group ${
                      theme.bg
                    } ${isBeingDragged ? 'opacity-35 scale-95' : 'opacity-100 hover:z-20'}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-bold text-text-main leading-tight line-clamp-2">
                        {item.name}
                      </span>

                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 shrink-0">
                        {item.width !== item.height && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              rotatePlacedItem(item);
                            }}
                            title="Girar 90°"
                            className="p-0.5 rounded bg-bg-main/70 text-text-main hover:text-secondary-uv"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          title="Descartar"
                          className="p-0.5 rounded bg-bg-main/70 text-muted-ash hover:text-primary-blood"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <Icon className={`w-3.5 h-3.5 ${theme.badge}`} />
                      <span className="px-1 rounded bg-bg-main/80 text-text-main">
                        {item.width}×{item.height}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
