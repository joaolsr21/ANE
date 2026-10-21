export type SkillRank = 0 | 1 | 2; // 0 = Destreinado (+0), 1 = Treinado (+2), 2 = Especialista (+5)

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  master_id: string;
  invite_code: string;
  active_map_url: string | null;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id: string;
  role: 'master' | 'player';
  joined_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  weight: number;
  quantity: number;
  category: 'weapon' | 'ration' | 'water' | 'medical' | 'gear';
}

export interface Character {
  id: string;
  campaign_id: string | null;
  user_id: string;
  name: string;
  archetype: string;
  avatar_url: string | null;
  is_npc: boolean;

  // Atributos (1 a 5)
  attr_for: number;
  attr_agi: number;
  attr_int: number;
  attr_pre: number;
  attr_vig: number;

  // Estatísticas Derivadas
  pv_current: number;
  pv_max: number;
  san_current: number;
  san_max: number;
  wound_threshold: number;
  defense: number;
  initiative: number;
  infection_level: number; // 0 a 100%

  // Sobrevivência
  food_portions: number;
  water_portions: number;
  fatigue: number;

  // Perícias e Inventário
  skills: Record<string, SkillRank>;
  inventory: InventoryItem[];

  // Posição VTT
  token_x: number;
  token_y: number;

  created_at: string;
  updated_at: string;
}

export interface VTTToken {
  id: string;
  characterId?: string;
  name: string;
  label: string;
  isNpc: boolean;
  x: number;
  y: number;
  pvCurrent: number;
  pvMax: number;
  infectionLevel: number;
  color: 'blood' | 'uv' | 'rust';
}

export interface VTTChatMessage {
  id: string;
  campaign_id: string;
  sender_name: string;
  message_type: 'text' | 'roll' | 'alert';
  content: string;
  roll_payload?: {
    label: string;
    formula: string;
    d20Rolls: number[];
    bonusDieType: string | null;
    bonusDieRoll: number | null;
    skillBonus: number;
    flatModifier: number;
    finalTotal: number;
    isCriticalSuccess: boolean;
    isCriticalFailure: boolean;
  };
  created_at: string;
}

export interface Combatant {
  id: string;
  characterId?: string;
  name: string;
  isNpc: boolean;
  initiative: number;
  pvCurrent: number;
  pvMax: number;
  infectionLevel: number;
}
