import React, { useRef, useState } from 'react';
import {
  Upload,
  Grid,
  UserPlus,
  Skull,
  Crosshair,
  Eye,
} from 'lucide-react';
import { VTTToken } from '../../types/database';

interface VTTMapCanvasProps {
  mapUrl: string | null;
  tokens: VTTToken[];
  isMaster: boolean;
  onMoveToken: (tokenId: string, x: number, y: number, persistToDb?: boolean) => void;
  onUploadMap: (file: File) => Promise<any>;
  onAddToken: (name: string, isNpc: boolean) => void;
}

export const VTTMapCanvas: React.FC<VTTMapCanvasProps> = ({
  mapUrl,
  tokens,
  isMaster,
  onMoveToken,
  onUploadMap,
  onAddToken,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [newTokenName, setNewTokenName] = useState<string>('');

  const GRID_SIZE = 48;

  const getRelativeCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 100, y: 100 };
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;

    if (snapToGrid) {
      x = Math.round(x / GRID_SIZE) * GRID_SIZE;
      y = Math.round(y / GRID_SIZE) * GRID_SIZE;
    }
    return { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTokenId) return;
    const { x, y } = getRelativeCoords(e.clientX, e.clientY);
    onMoveToken(draggingTokenId, x, y, false);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingTokenId) return;
    const { x, y } = getRelativeCoords(e.clientX, e.clientY);
    onMoveToken(draggingTokenId, x, y, true);
    setDraggingTokenId(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUploadMap(file);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateQuickToken = (isNpc: boolean) => {
    const label = newTokenName.trim() || (isNpc ? 'Infectado Hostil' : 'Sobrevivente');
    onAddToken(label, isNpc);
    setNewTokenName('');
  };

  return (
    <div className="bg-bg-card border border-muted-ash/20 rounded-xl overflow-hidden flex flex-col">
      {/* Barra de Ferramentas Tática do Mapa (Mestre e Jogadores) */}
      <div className="p-3 bg-bg-card border-b border-muted-ash/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              showGrid
                ? 'bg-secondary-uv/20 border-secondary-uv text-text-main'
                : 'bg-bg-main border-muted-ash/25 text-muted-ash'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Grid Tático
          </button>

          <button
            type="button"
            onClick={() => setSnapToGrid((s) => !s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors ${
              snapToGrid
                ? 'bg-secondary-uv/20 border-secondary-uv text-text-main'
                : 'bg-bg-main border-muted-ash/25 text-muted-ash'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            Snap (48px)
          </button>
        </div>

        {/* Ferramentas exclusivas ou prioritárias do Mestre */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            placeholder="Nome do Token..."
            className="bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-1.5 text-xs text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv w-36"
          />

          <button
            type="button"
            onClick={() => handleCreateQuickToken(false)}
            className="px-2.5 py-1.5 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            +Token
          </button>

          <button
            type="button"
            onClick={() => handleCreateQuickToken(true)}
            className="px-2.5 py-1.5 rounded-lg bg-primary-blood hover:bg-primary-blood/90 text-text-main text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Skull className="w-3.5 h-3.5" />
            +Ameaça
          </button>

          {isMaster && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-bg-main hover:border-secondary-uv border border-muted-ash/30 text-text-main text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-secondary-uv" />
                {uploading ? 'Enviando...' : 'Upload Mapa (Storage)'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Área Central do Canvas VTT */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full h-[540px] bg-bg-main overflow-hidden select-none touch-none cursor-crosshair"
        style={{
          backgroundImage: mapUrl
            ? `url(${mapUrl})`
            : 'radial-gradient(circle at 50% 50%, rgba(93, 63, 211, 0.10), rgba(13, 13, 18, 0.98) 75%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Grid Tático Sobreposto */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(to right, #9CA3AF 1px, transparent 1px),
                linear-gradient(to bottom, #9CA3AF 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          />
        )}

        {/* Marca D'água Tática quando nenhum mapa externo foi enviado */}
        {!mapUrl && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-25">
            <Eye className="w-12 h-12 text-secondary-uv mb-2" />
            <span className="font-mono text-xs uppercase tracking-widest text-text-main">
              ANE // SETOR SUBTERRÂNEO — ARRASTE OS TOKENS EM TEMPO REAL
            </span>
          </div>
        )}

        {/* Renderização dos Tokens Arrastáveis */}
        {tokens.map((token) => {
          const isDragging = draggingTokenId === token.id;
          const pvPct = Math.max(0, Math.min(100, Math.round((token.pvCurrent / token.pvMax) * 100)));

          return (
            <div
              key={token.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                setDraggingTokenId(token.id);
              }}
              style={{
                transform: `translate(${token.x - 26}px, ${token.y - 26}px)`,
              }}
              className={`absolute top-0 left-0 w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-shadow ${
                isDragging ? 'scale-110 z-30' : 'z-20'
              } ${
                token.isNpc
                  ? 'bg-primary-blood/90 border-2 border-text-main shadow-blood-glow'
                  : 'bg-secondary-uv/90 border-2 border-text-main shadow-uv-glow'
              }`}
            >
              {/* Sigla do Token */}
              <span className="font-mono font-extrabold text-xs text-text-main tracking-wider">
                {token.label}
              </span>

              {/* Coordenada discreta */}
              <span className="text-[9px] font-mono text-text-main/80">
                {Math.round(token.x)},{Math.round(token.y)}
              </span>

              {/* Barra de PV Flutuante Acima do Token */}
              <div className="absolute -top-3 w-12 h-1.5 bg-bg-main rounded-full overflow-hidden border border-muted-ash/40">
                <div
                  className={`h-full ${token.isNpc ? 'bg-primary-blood' : 'bg-secondary-uv'}`}
                  style={{ width: `${pvPct}%` }}
                />
              </div>

              {/* Nome do Personagem / Ameaça Abaixo do Token */}
              <div className="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-bg-card/95 border border-muted-ash/30 text-[10px] font-semibold text-text-main shadow">
                {token.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
