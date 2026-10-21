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
} from 'lucide-react';

export type EquipmentSlotKey = 'primaryWeapon' | 'secondaryWeapon' | 'armor' | 'pocket1' | 'pocket2';

export interface SpatialGridItem {
  id: string;
  name: string;
  category: 'weapon' | 'medical' | 'water' | 'ration' | 'armor' | 'gear';
  width: number;  // Colunas ocupadas
  height: number; // Linhas ocupadas
  x: number;      // Coluna inicial na mochila (0 a 7)
  y: number;      // Linha inicial na mochila (0 a 5)
  rotated?: boolean;
  equippedSlot?: EquipmentSlotKey | null;
  description: string;
}

export const GRID_COLS = 8;
export const GRID_ROWS = 6;
export const CELL_SIZE_PX = 52; // 52x52px por slot tático

// Catálogo de templates de itens dimensionais para adicionar/testar rapidamente
export const SPATIAL_ITEM_TEMPLATES: Array<Omit<SpatialGridItem, 'id' | 'x' | 'y'>> = [
  {
    name: 'Pílulas Antivirais UV',
    category: 'medical',
    width: 1,
    height: 1,
    description: '1x1 slot • Suprime 10% do avanço de infecção.',
  },
  {
    name: 'Bandagem Compressiva',
    category: 'medical',
    width: 1,
    height: 1,
    description: '1x1 slot • Estanca sangramento e recupera +4 PV.',
  },
  {
    name: 'Garrafa de Água Purificada',
    category: 'water',
    width: 1,
    height: 2,
    description: '1x2 slots (Vertical) • Hidrata e reduz 1 nível de Fadiga.',
  },
  {
    name: 'Ração Militar Liofilizada',
    category: 'ration',
    width: 1,
    height: 2,
    description: '1x2 slots (Vertical) • Suprimento calórico concentrado.',
  },
  {
    name: 'Pistola Tática 9mm',
    category: 'weapon',
    width: 2,
    height: 2,
    description: '2x2 slots • Arma secundária confiável para curta distância.',
  },
  {
    name: 'Colete Balístico Kevlar',
    category: 'armor',
    width: 2,
    height: 3,
    description: '2x3 slots • Proteção corporal (+3 Defesa).',
  },
  {
    name: 'Espingarda Calibre 12',
    category: 'weapon',
    width: 4,
    height: 2,
    description: '4x2 slots • Arma primária de alto impacto.',
  },
];

// Estado inicial mockado na mochila 8x6
const INITIAL_MOCK_ITEMS: SpatialGridItem[] = [
  {
    id: 'sp-1',
    name: 'Espingarda Calibre 12',
    category: 'weapon',
    width: 4,
    height: 2,
    x: 0,
    y: 0,
    description: '4x2 slots • Arma primária de alto impacto.',
  },
  {
    id: 'sp-2',
    name: 'Pistola Tática 9mm',
    category: 'weapon',
    width: 2,
    height: 2,
    x: 4,
    y: 0,
    description: '2x2 slots • Arma secundária confiável.',
  },
  {
    id: 'sp-3',
    name: 'Garrafa de Água Purificada',
    category: 'water',
    width: 1,
    height: 2,
    x: 6,
    y: 0,
    description: '1x2 slots • Hidrata e reduz Fadiga.',
  },
  {
    id: 'sp-4',
    name: 'Ração Militar Liofilizada',
    category: 'ration',
    width: 1,
    height: 2,
    x: 7,
    y: 0,
    description: '1x2 slots • Porção de comida.',
  },
  {
    id: 'sp-5',
    name: 'Pílulas Antivirais UV',
    category: 'medical',
    width: 1,
    height: 1,
    x: 0,
    y: 2,
    description: '1x1 slot • Suprime infecção.',
  },
];

/**
 * Verifica se um item com dimensões (w, h) cabe na posição (targetX, targetY)
 * da matriz 8x6 sem sair da borda e sem colidir com outros itens na mochila.
 */
export function canItemFitAt(
  itemsInBackpack: SpatialGridItem[],
  targetX: number,
  targetY: number,
  width: number,
  height: number,
  ignoreItemId?: string
): boolean {
  // 1. Verifica limites da borda 8x6
  if (
    targetX < 0 ||
    targetY < 0 ||
    targetX + width > GRID_COLS ||
    targetY + height > GRID_ROWS
  ) {
    return false;
  }

  // 2. Verifica sobreposição de retângulos (AABB Collision) com demais itens da mochila
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
  const [items, setItems] = useState<SpatialGridItem[]>(INITIAL_MOCK_ITEMS);

  // Estado do item sendo arrastado no momento
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    width: number;
    height: number;
    rotated: boolean;
  } | null>(null);

  // Coordenada (x, y) da célula sob o cursor durante o Drag Over
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const backpackItems = items.filter((i) => !i.equippedSlot);

  // Atalho de teclado "R" para rotacionar o item em 90 graus enquanto arrasta
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

  // Verifica se a posição atual sob o cursor é válida (Verde) ou inválida (Vermelha)
  const isHoverValid = useCallback(() => {
    if (!draggingItem || !hoverCell) return false;
    return canItemFitAt(
      backpackItems,
      hoverCell.x,
      hoverCell.y,
      draggingItem.width,
      draggingItem.height,
      draggingItem.id
    );
  }, [backpackItems, draggingItem, hoverCell]);

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

  // Girar item diretamente com botão na grade (caso não esteja arrastando)
  const rotatePlacedItem = (item: SpatialGridItem) => {
    const newW = item.height;
    const newH = item.width;
    if (canItemFitAt(backpackItems, item.x, item.y, newW, newH, item.id)) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, width: newW, height: newH, rotated: !i.rotated }
            : i
        )
      );
    }
  };

  // Equipar item em um Slot de Equipamento Fixo
  const handleDropOnEquipmentSlot = (
    e: React.DragEvent,
    slotKey: EquipmentSlotKey,
    acceptedCategories: SpatialGridItem['category'][]
  ) => {
    e.preventDefault();
    if (!draggingItem) return;

    const draggedObj = items.find((i) => i.id === draggingItem.id);
    if (!draggedObj) return;

    // Verifica compatibilidade do slot e se já não está ocupado por outro item
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

  // Adicionar novo item na primeira posição livre da mochila 8x6
  const addTemplateToBackpack = (
    tpl: Omit<SpatialGridItem, 'id' | 'x' | 'y'>
  ) => {
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        if (canItemFitAt(backpackItems, x, y, tpl.width, tpl.height)) {
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
    alert('Espaço insuficiente na mochila (8x6)! Reorganize ou gire seus itens.');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Estilização por categoria de item
  const getCategoryTheme = (cat: SpatialGridItem['category']) => {
    switch (cat) {
      case 'weapon':
        return {
          bg: 'bg-primary-blood/35 border-primary-blood',
          badge: 'text-primary-blood',
          icon: Crosshair,
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
      {/* Cabeçalho do Inventário Espacial */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-muted-ash/15 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-secondary-uv">
            MÓDULO SURVIVAL HORROR // GRADE ESPACIAL 8x6
          </span>
          <h3 className="text-lg font-extrabold text-text-main mt-0.5">
            Mochila Tática & Slots de Equipamento
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-ash bg-bg-main px-3.5 py-2 rounded-xl border border-muted-ash/20">
          <Info className="w-4 h-4 text-secondary-uv shrink-0" />
          <span>
            Arraste itens para posicionar. Pressione{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-muted-ash/40 font-mono text-text-main">
              R
            </kbd>{' '}
            enquanto arrasta (ou clique no ícone de giro) para rotacionar 90°.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* COLUNA ESQUERDA: Slots de Equipamento Fixos (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-ash">
            Slots de Equipamento no Corpo
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                {
                  key: 'primaryWeapon',
                  label: 'Arma Primária',
                  hint: 'Aceita Armas (Ex: Espingarda 4x2)',
                  accepts: ['weapon'],
                },
                {
                  key: 'secondaryWeapon',
                  label: 'Arma Secundária',
                  hint: 'Aceita Armas (Ex: Pistola 2x2)',
                  accepts: ['weapon'],
                },
                {
                  key: 'armor',
                  label: 'Proteção Corporal',
                  hint: 'Aceita Coletes / Trajes',
                  accepts: ['armor', 'gear'],
                },
                {
                  key: 'pocket1',
                  label: 'Bolso Rápido 01',
                  hint: 'Médico / Ração / Água',
                  accepts: ['medical', 'water', 'ration'],
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
                  className={`min-h-[108px] rounded-xl p-3.5 border-2 border-dashed transition-all flex flex-col justify-between ${
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
                        ? `${equippedItem.width}x${equippedItem.height}`
                        : 'VAZIO'}
                    </span>
                  </div>

                  {equippedItem ? (
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, equippedItem)}
                      onDragEnd={handleDragEnd}
                      className="mt-2 p-2.5 rounded-lg bg-bg-card border border-secondary-uv/50 cursor-grab active:cursor-grabbing flex items-center justify-between"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-text-main truncate">
                          {equippedItem.name}
                        </div>
                        <div className="text-[10px] text-muted-ash truncate">
                          Arraste de volta para a grade 8x6
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(equippedItem.id)}
                        className="p-1 text-muted-ash hover:text-primary-blood"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-ash/60 italic py-3 text-center">
                      {slot.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suprimentos Rápidos para Testar Colisão na Grade */}
          <div className="bg-bg-main border border-muted-ash/20 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-ash block">
              Adicionar Item Dimensional na Grade:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SPATIAL_ITEM_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => addTemplateToBackpack(tpl)}
                  className="p-2 rounded-lg bg-bg-card hover:border-secondary-uv border border-muted-ash/25 text-left transition-all flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <div className="text-xs font-semibold text-text-main truncate">
                      {tpl.name}
                    </div>
                    <div className="text-[10px] font-mono text-secondary-uv">
                      {tpl.width}x{tpl.height} slots
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-muted-ash shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: A Matriz Principal 8x6 (Mochila Tática) (7 cols) */}
        <div className="xl:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-ash">
              Grade da Mochila ({GRID_COLS} Colunas × {GRID_ROWS} Linhas)
            </span>
            <span className="text-xs font-mono text-text-main">
              Slots Ocupados:{' '}
              <strong className="text-secondary-uv">
                {backpackItems.reduce((acc, i) => acc + i.width * i.height, 0)}
              </strong>{' '}
              / {GRID_COLS * GRID_ROWS}
            </span>
          </div>

          {/* Container da Matriz 8x6 */}
          <div
            className="relative bg-bg-main/95 border-2 border-muted-ash/30 rounded-xl p-2 shadow-2xl select-none overflow-x-auto"
            onDragLeave={() => setHoverCell(null)}
          >
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE_PX}px)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE_PX}px)`,
                width: `${GRID_COLS * CELL_SIZE_PX}px`,
                height: `${GRID_ROWS * CELL_SIZE_PX}px`,
              }}
            >
              {/* 1. Renderiza as 48 células (8x6) com feedback Verde/Vermelho em tempo real */}
              {Array.from({ length: GRID_ROWS }).map((_, rowIdx) =>
                Array.from({ length: GRID_COLS }).map((__, colIdx) => {
                  // Verifica se esta célula faz parte da pegada (footprint) do item sendo arrastado
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

              {/* 2. Renderiza os Itens Dimensionais posicionados na Matriz */}
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
