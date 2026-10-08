import { supabase, isSupabaseConfigured } from '../supabase';
import {
  Player,
  PlayerPrivate,
  CharacterData,
  Wallet,
  HiddenBackground,
  Job,
  Property
} from '../types';

const LOCAL_GAME_STATE_KEY = 'ibadan_life_local_game_state_v1';

export class GameDataService {
  static getStartingCash(background: HiddenBackground): number {
    switch (background) {
      case 'LAPO Baby':
        return 5000;
      case 'Middle-Class Kid':
        return 50000;
      case 'Nepo Baby':
        return 500000;
      default:
        return 5000;
    }
  }

  static async loadFullPlayerData(guestId: string): Promise<{
    player: Player;
    playerPrivate: PlayerPrivate;
    character: CharacterData;
    wallet: Wallet;
  } | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: players, error: pErr } = await supabase
          .from('players')
          .select('*')
          .eq('guest_id', guestId)
          .single();

        if (pErr || !players) return null;

        const playerId = players.id;

        const [{ data: pPrivate }, { data: character }, { data: wallet }] = await Promise.all([
          supabase.from('player_private').select('*').eq('player_id', playerId).single(),
          supabase.from('characters').select('*').eq('player_id', playerId).single(),
          supabase.from('wallets').select('*').eq('player_id', playerId).single()
        ]);

        if (!pPrivate || !character || !wallet) return null;

        return {
          player: players as Player,
          playerPrivate: pPrivate as PlayerPrivate,
          character: character as CharacterData,
          wallet: wallet as Wallet
        };
      } catch (err) {
        console.warn('Error loading player data from Supabase, falling back to local storage:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${LOCAL_GAME_STATE_KEY}_${guestId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('LocalStorage error reading fallback player data:', err);
    }

    return null;
  }

  static async createNewPlayer(
    guestId: string,
    displayName: string,
    character: CharacterData,
    background: HiddenBackground
  ): Promise<{
    player: Player;
    playerPrivate: PlayerPrivate;
    character: CharacterData;
    wallet: Wallet;
  }> {
    const initialCash = this.getStartingCash(background);
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const { data: newPlayer, error: pErr } = await supabase
          .from('players')
          .insert({
            guest_id: guestId,
            display_name: displayName,
            current_district: character.starting_neighborhood || 'Iwo Road',
            reputation: 100,
            status: 'Exploring Ibadan'
          })
          .select()
          .single();

        if (pErr) throw pErr;

        const playerId = newPlayer.id;

        await Promise.all([
          supabase.from('characters').insert({
            player_id: playerId,
            ...character
          }),
          supabase.from('wallets').insert({
            player_id: playerId,
            cash: initialCash,
            bank_balance: 0
          }),
          supabase.from('player_private').insert({
            player_id: playerId,
            hidden_background: background,
            private_financial_info: { initial_background: background, starting_cash: initialCash },
            private_progression_info: { joined_date: now }
          })
        ]);

        const fullData = {
          player: newPlayer as Player,
          playerPrivate: {
            player_id: playerId,
            hidden_background: background,
            private_financial_info: {},
            private_progression_info: {}
          },
          character: { ...character, player_id: playerId },
          wallet: { player_id: playerId, cash: initialCash, bank_balance: 0 }
        };

        localStorage.setItem(`${LOCAL_GAME_STATE_KEY}_${guestId}`, JSON.stringify(fullData));
        return fullData;
      } catch (err) {
        console.warn('Error creating player on Supabase server, falling back to local state:', err);
      }
    }

    const mockPlayerId = `player_local_${Date.now()}`;
    const localFullData = {
      player: {
        id: mockPlayerId,
        guest_id: guestId,
        display_name: displayName,
        created_at: now,
        last_seen: now,
        current_district: character.starting_neighborhood || 'Iwo Road',
        public_avatar_data: {},
        reputation: 100,
        status: 'Exploring Ibadan'
      },
      playerPrivate: {
        player_id: mockPlayerId,
        hidden_background: background,
        private_financial_info: { starting_cash: initialCash },
        private_progression_info: {}
      },
      character: { ...character, player_id: mockPlayerId },
      wallet: { player_id: mockPlayerId, cash: initialCash, bank_balance: 0 }
    };

    localStorage.setItem(`${LOCAL_GAME_STATE_KEY}_${guestId}`, JSON.stringify(localFullData));
    return localFullData;
  }

  static async updateWalletBalance(
    playerId: string,
    guestId: string,
    cashDelta: number,
    transactionType: 'Earned' | 'Spent' | 'Transfer' | 'Business',
    metadata: any = {}
  ): Promise<Wallet | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: currentWallet } = await supabase
          .from('wallets')
          .select('cash, bank_balance')
          .eq('player_id', playerId)
          .single();

        if (currentWallet) {
          const newCash = Math.max(0, Number(currentWallet.cash) + cashDelta);

          const { data: updated, error } = await supabase
            .from('wallets')
            .update({ cash: newCash, updated_at: new Date().toISOString() })
            .eq('player_id', playerId)
            .select()
            .single();

          if (!error && updated) {
            await supabase.from('transactions').insert({
              player_id: playerId,
              type: transactionType,
              amount: Math.abs(cashDelta),
              metadata
            });

            return updated as Wallet;
          }
        }
      } catch (err) {
        console.warn('Failed to update wallet on server:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${LOCAL_GAME_STATE_KEY}_${guestId}`);
      if (raw) {
        const fullData = JSON.parse(raw);
        fullData.wallet.cash = Math.max(0, fullData.wallet.cash + cashDelta);
        localStorage.setItem(`${LOCAL_GAME_STATE_KEY}_${guestId}`, JSON.stringify(fullData));
        return fullData.wallet;
      }
    } catch (err) {
      console.warn('Local wallet update error:', err);
    }

    return null;
  }

  static async getCatalogItems(): Promise<any[]> {
    return [
      { id: 'item_1', name: 'Tecno Smart Phone', category: 'Electronics', price: 35000, metadata: { type: 'Phone' } },
      { id: 'item_2', name: 'Ankara Traditional Wear', category: 'Clothing', price: 12000, metadata: { style: 'Native' } },
      { id: 'item_3', name: 'Jollof Rice & Chicken', category: 'Food', price: 2500, metadata: { health: 30 } },
      { id: 'item_4', name: 'Ibadan School Uniform', category: 'Clothing', price: 8000, metadata: { type: 'School' } },
      { id: 'item_5', name: 'Mechanic Tool Set', category: 'Tools', price: 25000, metadata: { durability: 100 } }
    ];
  }

  static async getJobsCatalog(): Promise<Job[]> {
    return [
      { id: 'job_1', name: 'Shop Assistant at Dugbe', description: 'Assist customers and manage stock at Dugbe Commercial Hub.', salary: 15000 },
      { id: 'job_2', name: 'Keke Driver (Iwo Road)', description: 'Transport passengers between Iwo Road and Bodija.', salary: 25000 },
      { id: 'job_3', name: 'Market Vendor Helper', description: 'Help vendors unpack and organize goods at Oja-Oba Market.', salary: 12000 },
      { id: 'job_4', name: 'Secondary School Teacher', description: 'Teach students at Oke-Ado High School.', salary: 45000 }
    ];
  }

  static async getPropertiesCatalog(): Promise<Property[]> {
    return [
      { id: 'prop_1', type: 'Single Room Self-Contain', location: 'Oke-Ado', price: 80000, metadata: { period: 'Yearly' } },
      { id: 'prop_2', type: '2 Bedroom Apartment', location: 'Bodija', price: 350000, metadata: { period: 'Yearly' } },
      { id: 'prop_3', type: '3 Bedroom Bungalow', location: 'Jericho', price: 1200000, metadata: { type: 'Buy' } },
      { id: 'prop_4', type: 'Commercial Shop Stall', location: 'Dugbe', price: 150000, metadata: { type: 'Business' } }
    ];
  }
}
