import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Dices,
  Sparkles,
  Package,
  Utensils,
  Trash2,
  Crown,
  User,
} from 'lucide-react';

export type CampaignChatEntryType =
  | 'message'
  | 'roll'
  | 'ability'
  | 'item_consumed'
  | 'item_info';

export interface CampaignChatEntry {
  id: string;
  campaignId: string;
  senderName: string;
  senderRole?: 'Mestre' | 'Player';
  type: CampaignChatEntryType;
  title: string;
  description?: string;
  formula?: string;
  total?: number;
  details?: string;
  isCriticalSuccess?: boolean;
  isCriticalFailure?: boolean;
  timestamp: string;
}

interface CampaignChatFeedProps {
  campaignId: string;
  campaignName: string;
  senderName: string;
  isMaster: boolean;
  entries: CampaignChatEntry[];
  onAddEntry: (entry: Omit<CampaignChatEntry, 'id' | 'timestamp' | 'campaignId'>) => void;
  onClearChat?: () => void;
}

export const CampaignChatFeed: React.FC<CampaignChatFeedProps> = ({
  campaignName,
  senderName,
  isMaster,
  entries,
  onAddEntry,
  onClearChat,
}) => {
  const [textInput, setTextInput] = useState('');
  const [filterType, setFilterType] = useState<'all' | CampaignChatEntryType>('all');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onAddEntry({
      senderName,
      senderRole: isMaster ? 'Mestre' : 'Player',
      type: 'message',
      title: textInput.trim(),
    });
    setTextInput('');
  };

  const filteredEntries =
    filterType === 'all'
      ? entries
      : entries.filter((e) => e.type === filterType);

  return (
    <div className="bg-bg-card border border-muted-ash/25 rounded-2xl flex flex-col h-[640px] shadow-2xl overflow-hidden">
      {/* Cabeçalho do Chat da Campanha */}
      <div className="p-4 bg-bg-main/90 border-b border-muted-ash/15 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-secondary-uv" />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-main">
                Chat & Logs da Campanha
              </h3>
              <p className="text-[10px] font-mono text-muted-ash truncate max-w-[200px]">
                {campaignName}
              </p>
            </div>
          </div>

          {onClearChat && entries.length > 0 && (
            <button
              type="button"
              onClick={onClearChat}
              title="Limpar histórico do chat"
              className="p-1.5 rounded-lg bg-bg-card text-muted-ash hover:text-primary-blood transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Rápidos */}
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: 'all', label: 'Tudo' },
              { id: 'roll', label: 'Dados' },
              { id: 'ability', label: 'Habilidades' },
              { id: 'item_consumed', label: 'Consumo' },
              { id: 'item_info', label: 'Itens' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                filterType === f.id
                  ? 'bg-secondary-uv text-text-main border-secondary-uv font-bold'
                  : 'bg-bg-card text-muted-ash border-muted-ash/20 hover:text-text-main'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Mensagens / Logs */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-muted-ash space-y-2">
            <MessageSquare className="w-8 h-8 text-muted-ash/40" />
            <p className="font-semibold text-text-main">Nenhuma atividade registrada</p>
            <p className="text-[11px]">
              Role dados na ficha, clique em <strong>Mostrar no Chat</strong> em qualquer Habilidade ou Item, ou consuma ração/água/medicamentos para exibir os logs aqui!
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            // 1. LOG DE ROLAGEM DE DADOS
            if (entry.type === 'roll') {
              return (
                <div
                  key={entry.id}
                  className="bg-bg-main border-l-4 border-l-secondary-uv border border-muted-ash/20 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-ash">
                    <span className="flex items-center gap-1 font-bold text-text-main">
                      <Dices className="w-3.5 h-3.5 text-secondary-uv" />
                      {entry.senderName}
                    </span>
                    <span>{entry.timestamp}</span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-text-main">{entry.title}</div>
                      {entry.formula && (
                        <div className="text-[10px] font-mono text-secondary-uv">
                          {entry.formula}
                        </div>
                      )}
                    </div>
                    {typeof entry.total === 'number' && (
                      <span className="text-2xl font-extrabold font-mono px-2.5 py-0.5 rounded-lg bg-bg-card border border-secondary-uv/50 text-text-main">
                        {entry.total}
                      </span>
                    )}
                  </div>

                  {entry.details && (
                    <div className="text-[10px] font-mono text-muted-ash pt-1 border-t border-muted-ash/10">
                      {entry.details}
                    </div>
                  )}

                  {entry.isCriticalSuccess && (
                    <div className="text-[10px] font-mono font-bold text-secondary-uv">
                      ★ 20 Natural no d20!
                    </div>
                  )}
                  {entry.isCriticalFailure && (
                    <div className="text-[10px] font-mono font-bold text-primary-blood">
                      ☠ 1 Natural no d20!
                    </div>
                  )}
                </div>
              );
            }

            // 2. LOG DE HABILIDADE COMPARTILHADA NO CHAT
            if (entry.type === 'ability') {
              return (
                <div
                  key={entry.id}
                  className="bg-bg-main border-l-4 border-l-primary-blood border border-primary-blood/35 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-ash">
                    <span className="flex items-center gap-1 font-bold text-text-main">
                      <Sparkles className="w-3.5 h-3.5 text-primary-blood" />
                      {entry.senderName} • Habilidade
                    </span>
                    <span>{entry.timestamp}</span>
                  </div>

                  <div className="text-xs font-extrabold text-secondary-uv">
                    {entry.title}
                  </div>

                  {entry.description && (
                    <p className="text-xs text-text-main/90 leading-relaxed bg-bg-card/80 p-2.5 rounded-lg border border-muted-ash/15">
                      {entry.description}
                    </p>
                  )}
                </div>
              );
            }

            // 3. LOG DE ITEM CONSUMIDO (COMIDA, ÁGUA, MEDICAMENTO)
            if (entry.type === 'item_consumed') {
              return (
                <div
                  key={entry.id}
                  className="bg-bg-main border-l-4 border-l-warning-rust border border-warning-rust/40 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-ash">
                    <span className="flex items-center gap-1 font-bold text-warning-rust">
                      <Utensils className="w-3.5 h-3.5 text-warning-rust" />
                      {entry.senderName} • Consumiu Item
                    </span>
                    <span>{entry.timestamp}</span>
                  </div>

                  <div className="text-xs font-bold text-text-main">{entry.title}</div>

                  {entry.description && (
                    <p className="text-[11px] text-muted-ash leading-relaxed">
                      {entry.description}
                    </p>
                  )}
                </div>
              );
            }

            // 4. LOG DE DESCRIÇÃO DE ITEM / ARMA / EQUIPAMENTO NO CHAT
            if (entry.type === 'item_info') {
              return (
                <div
                  key={entry.id}
                  className="bg-bg-main border-l-4 border-l-secondary-uv/80 border border-muted-ash/25 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-ash">
                    <span className="flex items-center gap-1 font-bold text-text-main">
                      <Package className="w-3.5 h-3.5 text-secondary-uv" />
                      {entry.senderName} • Equipamento / Item
                    </span>
                    <span>{entry.timestamp}</span>
                  </div>

                  <div className="text-xs font-bold text-text-main">{entry.title}</div>

                  {entry.description && (
                    <p className="text-[11px] font-mono text-muted-ash bg-bg-card p-2 rounded-lg border border-muted-ash/15">
                      {entry.description}
                    </p>
                  )}
                </div>
              );
            }

            // 5. MENSAGEM DE TEXTO PADRÃO
            return (
              <div
                key={entry.id}
                className="bg-bg-main border border-muted-ash/20 rounded-xl p-3 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-ash">
                  <span className="flex items-center gap-1 font-bold text-text-main">
                    {entry.senderRole === 'Mestre' ? (
                      <Crown className="w-3 h-3 text-primary-blood" />
                    ) : (
                      <User className="w-3 h-3 text-secondary-uv" />
                    )}
                    {entry.senderName}
                  </span>
                  <span>{entry.timestamp}</span>
                </div>
                <p className="text-xs text-text-main leading-relaxed">{entry.title}</p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Campo de Envio de Mensagem no Chat */}
      <form
        onSubmit={handleSendText}
        className="p-3 bg-bg-main/90 border-t border-muted-ash/15 flex items-center gap-2"
      >
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enviar mensagem ou ação no chat..."
          className="flex-1 bg-bg-card border border-muted-ash/30 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-secondary-uv hover:bg-secondary-uv/90 text-text-main shadow-uv-glow transition-all"
          title="Enviar para o chat"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
