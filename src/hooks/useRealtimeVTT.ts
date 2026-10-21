import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Character, Combatant, VTTChatMessage, VTTToken } from '../types/database';
import { DiceRollResult } from './useDiceRoller';

interface OnlineOperator {
  userId: string;
  username: string;
  role: 'master' | 'player';
  onlineAt: string;
}

export function useRealtimeVTT(params: {
  campaignId: string;
  currentUserId: string;
  currentUsername: string;
  isMaster: boolean;
  characters: Character[];
}) {
  const { campaignId, currentUserId, currentUsername, isMaster, characters } = params;

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Tokens iniciais derivados dos personagens + 1 infectado hostil (NPC)
  const [tokens, setTokens] = useState<VTTToken[]>(() => {
    const charTokens: VTTToken[] = characters.map((c, idx) => ({
      id: `token-${c.id}`,
      characterId: c.id,
      name: c.name,
      label: c.name.slice(0, 2).toUpperCase(),
      isNpc: c.is_npc,
      x: c.token_x || 140 + idx * 120,
      y: c.token_y || 200,
      pvCurrent: c.pv_current,
      pvMax: c.pv_max,
      infectionLevel: c.infection_level,
      color: 'uv',
    }));

    return [
      ...charTokens,
      {
        id: 'token-npc-1',
        name: 'Espreitador Cego (Estágio 3)',
        label: 'EC',
        isNpc: true,
        x: 420,
        y: 180,
        pvCurrent: 28,
        pvMax: 28,
        infectionLevel: 100,
        color: 'blood',
      },
    ];
  });

  const [messages, setMessages] = useState<VTTChatMessage[]>([
    {
      id: 'msg-init-1',
      campaign_id: campaignId,
      sender_name: 'SISTEMA ANE // TERMINAL UV',
      message_type: 'alert',
      content: 'Canal Realtime estabelecido. Posições de tokens e rolagens de dados sincronizadas na mesa.',
      created_at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [combatants, setCombatants] = useState<Combatant[]>(() => [
    {
      id: 'comb-1',
      characterId: characters[0]?.id,
      name: characters[0]?.name || 'Dra. Helena Vance',
      isNpc: false,
      initiative: 19,
      pvCurrent: characters[0]?.pv_current ?? 11,
      pvMax: characters[0]?.pv_max ?? 14,
      infectionLevel: characters[0]?.infection_level ?? 28,
    },
    {
      id: 'comb-npc-1',
      name: 'Espreitador Cego (Estágio 3)',
      isNpc: true,
      initiative: 16,
      pvCurrent: 28,
      pvMax: 28,
      infectionLevel: 100,
    },
    {
      id: 'comb-2',
      characterId: characters[1]?.id,
      name: characters[1]?.name || 'Jonas "Ferrugem" Moura',
      isNpc: false,
      initiative: 14,
      pvCurrent: characters[1]?.pv_current ?? 9,
      pvMax: characters[1]?.pv_max ?? 22,
      infectionLevel: characters[1]?.infection_level ?? 64,
    },
  ]);

  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineOperator[]>([
    {
      userId: currentUserId,
      username: currentUsername,
      role: isMaster ? 'master' : 'player',
      onlineAt: new Date().toISOString(),
    },
  ]);

  // Configuração do canal Supabase Realtime (Broadcast + Presence)
  useEffect(() => {
    if (!isSupabaseConfigured || !campaignId) return;

    const channel = supabase.channel(`ane-vtt:${campaignId}`, {
      config: {
        presence: { key: currentUserId },
        broadcast: { self: false },
      },
    });

    // 1. Presence: Operadores conectados na mesa
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<OnlineOperator>();
      const list: OnlineOperator[] = [];
      Object.values(state).forEach((presences) => {
        presences.forEach((p) => list.push(p));
      });
      if (list.length > 0) setOnlineUsers(list);
    });

    // 2. Broadcast: Movimento de Tokens em Tempo Real (x, y)
    channel.on('broadcast', { event: 'token_move' }, ({ payload }) => {
      const { tokenId, x, y } = payload as { tokenId: string; x: number; y: number };
      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
      );
    });

    // 3. Broadcast: Mensagens de Chat e Rolagens de Dados
    channel.on('broadcast', { event: 'chat_or_roll' }, ({ payload }) => {
      const incoming = payload as VTTChatMessage;
      setMessages((prev) => [...prev, incoming]);
    });

    // 4. Broadcast: Atualização do Mapa Tático
    channel.on('broadcast', { event: 'map_change' }, ({ payload }) => {
      const { url } = payload as { url: string | null };
      setMapUrl(url);
    });

    // 5. Broadcast: Sincronização do Tracker de Combate
    channel.on('broadcast', { event: 'combat_sync' }, ({ payload }) => {
      const { combatants: nextCombatants, activeTurnIndex: nextTurn, roundNumber: nextRound } = payload;
      if (nextCombatants) setCombatants(nextCombatants);
      if (typeof nextTurn === 'number') setActiveTurnIndex(nextTurn);
      if (typeof nextRound === 'number') setRoundNumber(nextRound);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: currentUserId,
          username: currentUsername,
          role: isMaster ? 'master' : 'player',
          onlineAt: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [campaignId, currentUserId, currentUsername, isMaster]);

  // Mover token localmente e transmitir via Supabase Realtime Broadcast
  const moveToken = useCallback(
    (tokenId: string, x: number, y: number, persistToDb = false) => {
      const clampedX = Math.max(24, Math.min(860, Math.round(x)));
      const clampedY = Math.max(24, Math.min(540, Math.round(y)));

      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, x: clampedX, y: clampedY } : t))
      );

      if (channelRef.current && isSupabaseConfigured) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'token_move',
          payload: { tokenId, x: clampedX, y: clampedY },
        });
      }

      if (persistToDb && isSupabaseConfigured) {
        const target = tokens.find((t) => t.id === tokenId);
        if (target?.characterId) {
          supabase
            .from('characters')
            .update({ token_x: clampedX, token_y: clampedY })
            .eq('id', target.characterId)
            .then();
        }
      }
    },
    [tokens]
  );

  // Adicionar novo Token ao Mapa
  const addToken = useCallback((name: string, isNpc: boolean) => {
    const newToken: VTTToken = {
      id: `token-${Date.now()}`,
      name,
      label: name.slice(0, 2).toUpperCase(),
      isNpc,
      x: 280 + Math.floor(Math.random() * 120),
      y: 220 + Math.floor(Math.random() * 80),
      pvCurrent: isNpc ? 20 : 12,
      pvMax: isNpc ? 20 : 12,
      infectionLevel: isNpc ? 100 : 0,
      color: isNpc ? 'blood' : 'uv',
    };
    setTokens((prev) => [...prev, newToken]);
  }, []);

  // Enviar mensagem de texto para o Chat em Tempo Real
  const sendChatMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const msg: VTTChatMessage = {
        id: `msg-${Date.now()}`,
        campaign_id: campaignId,
        sender_name: currentUsername,
        message_type: 'text',
        content: text.trim(),
        created_at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, msg]);

      if (channelRef.current && isSupabaseConfigured) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'chat_or_roll',
          payload: msg,
        });

        await supabase.from('campaign_messages').insert([
          {
            campaign_id: campaignId,
            sender_name: currentUsername,
            message_type: 'text',
            content: msg.content,
          },
        ]);
      }
    },
    [campaignId, currentUsername]
  );

  // Publicar resultado de rolagem da Fase 2 diretamente no Chat da Mesa
  const broadcastDiceRoll = useCallback(
    async (roll: DiceRollResult) => {
      const msg: VTTChatMessage = {
        id: `roll-msg-${roll.id}`,
        campaign_id: campaignId,
        sender_name: roll.characterName,
        message_type: 'roll',
        content: `${roll.label}: ${roll.finalTotal}`,
        roll_payload: {
          label: roll.label,
          formula: roll.formula,
          d20Rolls: roll.d20Rolls,
          bonusDieType: roll.bonusDieType,
          bonusDieRoll: roll.bonusDieRoll,
          skillBonus: roll.skillBonus,
          flatModifier: roll.flatModifier,
          finalTotal: roll.finalTotal,
          isCriticalSuccess: roll.isCriticalSuccess,
          isCriticalFailure: roll.isCriticalFailure,
        },
        created_at: roll.timestamp,
      };

      setMessages((prev) => [...prev, msg]);

      if (channelRef.current && isSupabaseConfigured) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'chat_or_roll',
          payload: msg,
        });

        await supabase.from('campaign_messages').insert([
          {
            campaign_id: campaignId,
            sender_name: roll.characterName,
            message_type: 'roll',
            content: msg.content,
            roll_payload: msg.roll_payload,
          },
        ]);
      }
    },
    [campaignId]
  );

  // Upload de Mapa para o Supabase Storage (ou ObjectURL em modo local)
  const uploadMapImage = useCallback(
    async (file: File) => {
      if (!isSupabaseConfigured) {
        const localUrl = URL.createObjectURL(file);
        setMapUrl(localUrl);
        return localUrl;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${campaignId}/map-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vtt-maps')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('vtt-maps').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setMapUrl(publicUrl);

      await supabase
        .from('campaigns')
        .update({ active_map_url: publicUrl })
        .eq('id', campaignId);

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'map_change',
          payload: { url: publicUrl },
        });
      }

      return publicUrl;
    },
    [campaignId]
  );

  // Funções do Tracker de Combate
  const syncCombatState = useCallback(
    (nextCombatants: Combatant[], nextTurn: number, nextRound: number) => {
      const sorted = [...nextCombatants].sort((a, b) => b.initiative - a.initiative);
      setCombatants(sorted);
      setActiveTurnIndex(nextTurn);
      setRoundNumber(nextRound);

      if (channelRef.current && isSupabaseConfigured) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'combat_sync',
          payload: {
            combatants: sorted,
            activeTurnIndex: nextTurn,
            roundNumber: nextRound,
          },
        });
      }
    },
    []
  );

  const nextCombatTurn = useCallback(() => {
    if (combatants.length === 0) return;
    const isEndOfRound = activeTurnIndex + 1 >= combatants.length;
    const nextTurn = isEndOfRound ? 0 : activeTurnIndex + 1;
    const nextRound = isEndOfRound ? roundNumber + 1 : roundNumber;
    syncCombatState(combatants, nextTurn, nextRound);
  }, [combatants, activeTurnIndex, roundNumber, syncCombatState]);

  const addCombatant = useCallback(
    (name: string, initiative: number, isNpc: boolean, pvMax = 15) => {
      const newEntry: Combatant = {
        id: `comb-${Date.now()}`,
        name,
        isNpc,
        initiative,
        pvCurrent: pvMax,
        pvMax,
        infectionLevel: isNpc ? 100 : 0,
      };
      syncCombatState([...combatants, newEntry], activeTurnIndex, roundNumber);
    },
    [combatants, activeTurnIndex, roundNumber, syncCombatState]
  );

  const removeCombatant = useCallback(
    (id: string) => {
      const filtered = combatants.filter((c) => c.id !== id);
      syncCombatState(filtered, 0, roundNumber);
    },
    [combatants, roundNumber, syncCombatState]
  );

  return {
    tokens,
    messages,
    combatants,
    activeTurnIndex,
    roundNumber,
    mapUrl,
    onlineUsers,
    setMapUrl,
    moveToken,
    addToken,
    sendChatMessage,
    broadcastDiceRoll,
    uploadMapImage,
    nextCombatTurn,
    addCombatant,
    removeCombatant,
  };
}
