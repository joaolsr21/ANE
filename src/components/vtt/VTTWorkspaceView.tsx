import React, { useState } from 'react';
import { Crown, Users, Radio } from 'lucide-react';
import { Campaign, Character } from '../../types/database';
import { useRealtimeVTT } from '../../hooks/useRealtimeVTT';
import { VTTMapCanvas } from './VTTMapCanvas';
import { CombatTracker } from './CombatTracker';
import { VTTRealtimeChat } from './VTTRealtimeChat';

interface VTTWorkspaceViewProps {
  campaigns: Campaign[];
  characters: Character[];
  currentUserId: string;
  currentUsername: string;
}

export const VTTWorkspaceView: React.FC<VTTWorkspaceViewProps> = ({
  campaigns,
  characters,
  currentUserId,
  currentUsername,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || 'camp-1'
  );
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(
    characters[0]?.id || 'char-1'
  );
  const [simulateMasterMode, setSimulateMasterMode] = useState<boolean>(true);

  const activeCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
  const activeCharacter =
    characters.find((c) => c.id === selectedCharacterId) || characters[0];

  const isMaster =
    simulateMasterMode || activeCampaign?.master_id === currentUserId;

  const {
    tokens,
    messages,
    combatants,
    activeTurnIndex,
    roundNumber,
    mapUrl,
    onlineUsers,
    moveToken,
    addToken,
    sendChatMessage,
    broadcastDiceRoll,
    uploadMapImage,
    nextCombatTurn,
    addCombatant,
    removeCombatant,
  } = useRealtimeVTT({
    campaignId: activeCampaign?.id || 'camp-1',
    currentUserId,
    currentUsername,
    isMaster,
    characters,
  });

  return (
    <div className="space-y-6">
      {/* Barra Superior de Controle da Sessão VTT (Fase 3) */}
      <div className="bg-bg-card border border-muted-ash/20 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-secondary-uv flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Fase 3 // Mesa VTT Online & Supabase Realtime
            </span>
          </div>
          <h2 className="text-xl font-bold text-text-main mt-0.5">
            {activeCampaign?.name || 'Sessão Tática ANE'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Presença Online (Presence) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-main border border-muted-ash/20 text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-secondary-uv" />
            <span>Na Mesa:</span>
            <strong className="text-text-main">{onlineUsers.length}</strong>
          </div>

          {/* Seletor de Campanha */}
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-1.5 text-xs font-medium text-text-main focus:outline-none focus:border-secondary-uv"
          >
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                Campanha: {camp.name}
              </option>
            ))}
          </select>

          {/* Seletor de Personagem para Rolagem Rápida */}
          <select
            value={selectedCharacterId}
            onChange={(e) => setSelectedCharacterId(e.target.value)}
            className="bg-bg-main border border-muted-ash/30 rounded-lg px-3 py-1.5 text-xs font-medium text-text-main focus:outline-none focus:border-secondary-uv"
          >
            {characters.map((char) => (
              <option key={char.id} value={char.id}>
                Ficha: {char.name}
              </option>
            ))}
          </select>

          {/* Alternador Papel Mestre / Jogador */}
          <button
            type="button"
            onClick={() => setSimulateMasterMode((m) => !m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase border flex items-center gap-1.5 transition-all ${
              isMaster
                ? 'bg-primary-blood/25 border-primary-blood text-text-main'
                : 'bg-bg-main border-muted-ash/30 text-muted-ash'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-primary-blood" />
            {isMaster ? 'Visão do Mestre' : 'Visão do Jogador'}
          </button>
        </div>
      </div>

      {/* Layout Principal da Mesa VTT: Canvas + Tracker à Esquerda (8 cols) | Chat & Rolagens à Direita (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <VTTMapCanvas
            mapUrl={mapUrl}
            tokens={tokens}
            isMaster={isMaster}
            onMoveToken={moveToken}
            onUploadMap={uploadMapImage}
            onAddToken={addToken}
          />

          <CombatTracker
            combatants={combatants}
            activeTurnIndex={activeTurnIndex}
            roundNumber={roundNumber}
            isMaster={isMaster}
            onNextTurn={nextCombatTurn}
            onAddCombatant={addCombatant}
            onRemoveCombatant={removeCombatant}
          />
        </div>

        <div className="lg:col-span-4">
          <VTTRealtimeChat
            messages={messages}
            activeCharacter={activeCharacter}
            onSendMessage={sendChatMessage}
            onBroadcastRoll={broadcastDiceRoll}
          />
        </div>
      </div>
    </div>
  );
};
