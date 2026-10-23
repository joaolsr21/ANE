import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Campaign, Character } from '../types/database';

const DEFAULT_SKILLS: Character['skills'] = {
  Medicina: 0,
  Furtividade: 0,
  Pontaria: 0,
  Luta: 0,
  Sobrevivencia: 0,
  Investigacao: 0,
  Percepcao: 0,
  Vontade: 0,
  Atletismo: 0,
  Tecnologia: 0,
};

export function useCampaigns(userId?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      setCampaigns([]);
      setCharacters([]);
      return;
    }

    setLoading(true);
    setDbError(null);
    try {
      const [campRes, charRes] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('characters').select('*').order('created_at', { ascending: false }),
      ]);

      if (campRes.error) throw campRes.error;
      if (charRes.error) throw charRes.error;

      setCampaigns((campRes.data as Campaign[]) || []);
      setCharacters((charRes.data as Character[]) || []);
    } catch (err: any) {
      console.warn('Aviso ao consultar banco Supabase:', err.message);
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const createCampaign = async (name: string, description: string) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('campaigns')
      .insert([{ name, description, master_id: userId }])
      .select()
      .single();

    if (error) {
      const localCamp: Campaign = {
        id: `camp-${Date.now()}`,
        name,
        description,
        master_id: userId,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        active_map_url: null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCampaigns((prev) => [localCamp, ...prev]);
      return localCamp;
    }

    setCampaigns((prev) => [data as Campaign, ...prev]);
    return data as Campaign;
  };

  const deleteCampaign = async (campaignId: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    await supabase.from('campaigns').delete().eq('id', campaignId);
  };

  const joinCampaignByCode = async (inviteCode: string) => {
    const { data, error } = await supabase.rpc('join_campaign_by_code', {
      code: inviteCode,
    });
    if (error) throw error;
    await fetchDashboardData();
    return data;
  };

  const createCharacter = async (params: {
    name: string;
    archetype: string;
    campaign_id: string | null;
    is_npc: boolean;
    avatar_url?: string | null;
    pv_max?: number;
    san_max?: number;
    attr_for?: number;
    attr_agi?: number;
    attr_int?: number;
    attr_pre?: number;
    attr_vig?: number;
    skills?: Character['skills'];
    wound_threshold?: number;
    defense?: number;
    initiative?: number;
  }) => {
    if (!userId) return;

    const attr_for = params.attr_for ?? 1;
    const attr_agi = params.attr_agi ?? 1;
    const attr_int = params.attr_int ?? 1;
    const attr_pre = params.attr_pre ?? 1;
    const attr_vig = params.attr_vig ?? 1;
    const pv_max = params.pv_max ?? (params.is_npc ? 25 : 30 + attr_vig * 2);
    const san_max = params.san_max ?? (params.is_npc ? 0 : 50 + attr_pre * 10);

    const payload = {
      user_id: userId,
      campaign_id: params.campaign_id,
      name: params.name,
      archetype: params.archetype || (params.is_npc ? 'Monstro / Ameaça' : 'Sobrevivente'),
      avatar_url: params.avatar_url ?? null,
      is_npc: params.is_npc,
      attr_for,
      attr_agi,
      attr_int,
      attr_pre,
      attr_vig,
      pv_current: pv_max,
      pv_max,
      san_current: san_max,
      san_max,
      wound_threshold: params.wound_threshold ?? 10 + attr_vig,
      defense: params.defense ?? 10 + attr_agi,
      initiative: params.initiative ?? attr_agi + 1,
      infection_level: params.is_npc ? 100 : 0,
      food_portions: params.is_npc ? 0 : 2,
      water_portions: params.is_npc ? 0 : 2,
      fatigue: 0,
      skills: params.skills ?? DEFAULT_SKILLS,
      inventory: [],
      token_x: 0,
      token_y: 0,
    };

    const { data, error } = await supabase
      .from('characters')
      .insert([payload])
      .select()
      .single();

    if (error) {
      const localChar: Character = {
        id: `char-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCharacters((prev) => [localChar, ...prev]);
      return localChar;
    }

    setCharacters((prev) => [data as Character, ...prev]);
    return data as Character;
  };

  const updateCharacter = async (updatedChar: Character) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === updatedChar.id ? updatedChar : c))
    );

    const { data, error } = await supabase
      .from('characters')
      .update({
        name: updatedChar.name,
        archetype: updatedChar.archetype,
        avatar_url: updatedChar.avatar_url,
        campaign_id: updatedChar.campaign_id,
        is_npc: updatedChar.is_npc,
        attr_for: updatedChar.attr_for,
        attr_agi: updatedChar.attr_agi,
        attr_int: updatedChar.attr_int,
        attr_pre: updatedChar.attr_pre,
        attr_vig: updatedChar.attr_vig,
        pv_current: updatedChar.pv_current,
        pv_max: updatedChar.pv_max,
        san_current: updatedChar.san_current,
        san_max: updatedChar.san_max,
        wound_threshold: updatedChar.wound_threshold,
        defense: updatedChar.defense,
        initiative: updatedChar.initiative,
        infection_level: updatedChar.infection_level,
        food_portions: updatedChar.food_portions,
        water_portions: updatedChar.water_portions,
        fatigue: updatedChar.fatigue,
        skills: updatedChar.skills,
        inventory: updatedChar.inventory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedChar.id)
      .select()
      .single();

    if (error) {
      console.warn('Atualização mantida localmente:', error.message);
      return updatedChar;
    }
    return data as Character;
  };

  const deleteCharacter = async (characterId: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== characterId));
    await supabase.from('characters').delete().eq('id', characterId);
  };

  return {
    campaigns,
    characters,
    loading,
    dbError,
    createCampaign,
    deleteCampaign,
    joinCampaignByCode,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    refreshDashboard: fetchDashboardData,
  };
}
