export type HiddenBackground = 'LAPO Baby' | 'Middle-Class Kid' | 'Nepo Baby';

export interface Player {
  id: string;
  guest_id: string;
  display_name: string;
  created_at: string;
  last_seen: string;
  current_district: string;
  public_avatar_data: Record<string, any>;
  reputation: number;
  status: string;
}

export interface PlayerPrivate {
  player_id: string;
  hidden_background: HiddenBackground;
  private_financial_info: Record<string, any>;
  private_progression_info: Record<string, any>;
}

export interface CharacterData {
  player_id?: string;
  age: number;
  gender: string;
  skin_tone: string;
  hairstyle: string;
  hair_color: string;
  face_style: string;
  clothing: {
    top: string;
    bottom: string;
    shoes: string;
  };
  personality: string;
  starting_neighborhood: string;
}

export interface Wallet {
  player_id: string;
  cash: number;
  bank_balance: number;
}

export interface Job {
  id: string;
  name: string;
  description: string;
  salary: number;
  requirements?: any;
}

export interface Property {
  id: string;
  type: string;
  location: string;
  price: number;
  metadata?: any;
}

export interface NetworkPlayer {
  id: string;
  guest_id: string;
  display_name: string;
  district: string;
  position: [number, number, number];
  rotation: number;
  character: CharacterData;
  reputation: number;
  status: string;
  lastSeen: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id?: string;
  district?: string;
  text: string;
  timestamp: number;
  type: 'nearby' | 'district' | 'direct';
}
