import React, { useState } from 'react';
import {
  Send,
  Dices,
  MessageSquare,
  Radio,
} from 'lucide-react';
import { Character, SkillRank, VTTChatMessage } from '../../types/database';
import { AttributeKey, calculateANERoll, DiceRollResult } from '../../hooks/useDiceRoller';

interface VTTRealtimeChatProps {
  messages: VTTChatMessage[];
  activeCharacter: Character | undefined;
  onSendMessage: (text: string) => void;
  onBroadcastRoll: (roll: DiceRollResult) => void;
}

export const VTTRealtimeChat: React.FC<VTTRealtimeChatProps> = ({
  messages,
  activeCharacter,
  onSendMessage,
  onBroadcastRoll,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickRoll = (label: string, attr: AttributeKey, skillKey?: string) => {
    if (!activeCharacter) return;
    const attrMap: Record<AttributeKey, number> = {
      FOR: activeCharacter.attr_for,
      AGI: activeCharacter.attr_agi,
      INT: activeCharacter.attr_int,
      PRE: activeCharacter.attr_pre,
      VIG: activeCharacter.attr_vig,
    };

    const skillRank: SkillRank = skillKey
      ? ((activeCharacter.skills?.[skillKey] ?? 0) as SkillRank)
      : 0;

    const result = calculateANERoll({
      characterName: activeCharacter.name,
      label,
      attributeKey: attr,
      attributeValue: attrMap[attr],
      skillRank,
      flatModifier: -activeCharacter.fatigue,
    });

    onBroadcastRoll(result);
  };

  return (
    <div className="bg-bg-card border border-muted-ash/20 rounded-xl flex flex-col h-[540px]">
      {/* Cabeçalho do Chat Realtime */}
      <div className="p-3.5 border-b border-muted-ash/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-secondary-uv" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-main">
            Chat & Rolagens (Mesa Ao Vivo)
          </h3>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono text-secondary-uv">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          REALTIME
        </span>
      </div>

      {/* Barra de Rolagens Rápidas da Fase 2 direto para a Mesa */}
      {activeCharacter && (
        <div className="p-2.5 bg-bg-main/80 border-b border-muted-ash/15 space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-muted-ash flex items-center justify-between">
            <span>Rolagem Direta: {activeCharacter.name}</span>
            <span>Fadiga: -{activeCharacter.fatigue}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['FOR', 'AGI', 'INT', 'PRE', 'VIG'] as AttributeKey[]).map((attr) => (
              <button
                key={attr}
                type="button"
                onClick={() => handleQuickRoll(`Teste de ${attr}`, attr)}
                className="px-2 py-1 rounded bg-secondary-uv/25 hover:bg-secondary-uv border border-secondary-uv/60 text-[11px] font-mono font-bold text-text-main flex items-center gap-1 transition-colors"
              >
                <Dices className="w-3 h-3" />
                {attr}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleQuickRoll('Pontaria (AGI)', 'AGI', 'Pontaria')}
              className="px-2 py-1 rounded bg-bg-card hover:border-secondary-uv border border-muted-ash/30 text-[11px] font-mono text-text-main"
            >
              Pontaria
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoll('Furtividade (AGI)', 'AGI', 'Furtividade')}
              className="px-2 py-1 rounded bg-bg-card hover:border-secondary-uv border border-muted-ash/30 text-[11px] font-mono text-text-main"
            >
              Furtividade
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoll('Medicina (INT)', 'INT', 'Medicina')}
              className="px-2 py-1 rounded bg-bg-card hover:border-secondary-uv border border-muted-ash/30 text-[11px] font-mono text-text-main"
            >
              Medicina
            </button>
          </div>
        </div>
      )}

      {/* Feed de Mensagens e Rolagens */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map((msg) => {
          if (msg.message_type === 'alert') {
            return (
              <div
                key={msg.id}
                className="p-2.5 rounded-lg bg-warning-rust/15 border border-warning-rust/40 text-[11px] font-mono text-text-main"
              >
                <span className="text-warning-rust font-bold block mb-0.5">
                  [{msg.created_at}] {msg.sender_name}
                </span>
                {msg.content}
              </div>
            );
          }

          if (msg.message_type === 'roll' && msg.roll_payload) {
            const r = msg.roll_payload;
            return (
              <div
                key={msg.id}
                className="p-3 rounded-xl bg-bg-main border-l-4 border-secondary-uv border border-muted-ash/20 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-text-main">{msg.sender_name}</span>
                  <span className="font-mono text-muted-ash">{msg.created_at}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs font-semibold text-secondary-uv">{r.label}</div>
                    <div className="text-[10px] font-mono text-muted-ash">{r.formula}</div>
                  </div>
                  <span className="text-2xl font-extrabold font-mono text-text-main px-2.5 py-0.5 rounded bg-bg-card border border-secondary-uv/50">
                    {r.finalTotal}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-muted-ash pt-1 border-t border-muted-ash/10 flex items-center justify-between">
                  <span>
                    d20: [{r.d20Rolls.join(', ')}]
                    {r.bonusDieType ? ` | ${r.bonusDieType}: [${r.bonusDieRoll}]` : ''}
                  </span>
                  {r.isCriticalSuccess && (
                    <span className="text-secondary-uv font-bold">★ CRÍTICO!</span>
                  )}
                  {r.isCriticalFailure && (
                    <span className="text-primary-blood font-bold">☠ FALHA CRÍTICA!</span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="p-2.5 rounded-lg bg-bg-main border border-muted-ash/15 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-text-main">{msg.sender_name}</span>
                <span className="font-mono text-muted-ash">{msg.created_at}</span>
              </div>
              <p className="text-text-main/90 leading-relaxed">{msg.content}</p>
            </div>
          );
        })}
      </div>

      {/* Input de Mensagem de Texto */}
      <form onSubmit={handleSend} className="p-3 border-t border-muted-ash/15 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Transmitir mensagem na mesa..."
          className="flex-1 bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-2 text-xs text-text-main placeholder:text-muted-ash/50 focus:outline-none focus:border-secondary-uv"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-secondary-uv hover:bg-secondary-uv/90 text-text-main transition-all shadow-uv-glow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
