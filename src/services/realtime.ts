import { supabase, isSupabaseConfigured } from '../supabase';
import { NetworkPlayer, ChatMessage, CharacterData } from '../types';

export type OnPlayersUpdated = (players: NetworkPlayer[]) => void;
export type OnChatMessageReceived = (msg: ChatMessage) => void;

export class RealtimeService {
  private channelName: string;
  private channel: any = null;
  private localPlayer: NetworkPlayer;
  private remotePlayers: Map<string, NetworkPlayer> = new Map();
  private onPlayersUpdated: OnPlayersUpdated;
  private onChatMessageReceived: OnChatMessageReceived;

  constructor(
    district: string,
    localPlayer: {
      id: string;
      guest_id: string;
      display_name: string;
      character: CharacterData;
      reputation: number;
      status: string;
    },
    onPlayersUpdated: OnPlayersUpdated,
    onChatMessageReceived: OnChatMessageReceived
  ) {
    this.channelName = `game:ibadan:${district.toLowerCase().replace(/\s+/g, '-')}`;
    this.onPlayersUpdated = onPlayersUpdated;
    this.onChatMessageReceived = onChatMessageReceived;

    this.localPlayer = {
      id: localPlayer.id,
      guest_id: localPlayer.guest_id,
      display_name: localPlayer.display_name,
      district,
      position: [0, 0.5, 0],
      rotation: 0,
      character: localPlayer.character,
      reputation: localPlayer.reputation,
      status: localPlayer.status,
      lastSeen: Date.now()
    };

    this.initRealtime();
  }

  private initRealtime() {
    if (!isSupabaseConfigured) {
      console.warn('Supabase Realtime unavailable: Running in local offline broadcast mode.');
      this.startLocalPruningLoop();
      return;
    }

    this.channel = supabase.channel(this.channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: this.localPlayer.id }
      }
    });

    this.channel.on('broadcast', { event: 'player-transform' }, (payload: { payload: NetworkPlayer }) => {
      const p = payload.payload;
      if (p && p.id !== this.localPlayer.id) {
        const safePlayer: NetworkPlayer = {
          ...p,
          lastSeen: Date.now()
        };
        this.remotePlayers.set(p.id, safePlayer);
        this.notifyPlayersChanged();
      }
    });

    this.channel.on('broadcast', { event: 'chat-message' }, (payload: { payload: ChatMessage }) => {
      if (payload.payload) {
        this.onChatMessageReceived(payload.payload);
      }
    });

    this.channel.on('presence', { event: 'sync' }, () => {
      const presenceState = this.channel.presenceState();
      Object.keys(presenceState).forEach((key) => {
        if (key !== this.localPlayer.id) {
          const presences = presenceState[key];
          if (presences && presences.length > 0) {
            const p = presences[0] as NetworkPlayer;
            if (p && p.id !== this.localPlayer.id) {
              if (!this.remotePlayers.has(p.id)) {
                this.remotePlayers.set(p.id, { ...p, lastSeen: Date.now() });
              }
            }
          }
        }
      });
      this.notifyPlayersChanged();
    });

    this.channel.on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
      if (this.remotePlayers.has(key)) {
        this.remotePlayers.delete(key);
        this.notifyPlayersChanged();
      }
    });

    this.channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        await this.channel.track({
          id: this.localPlayer.id,
          display_name: this.localPlayer.display_name,
          district: this.localPlayer.district,
          character: this.localPlayer.character,
          reputation: this.localPlayer.reputation,
          status: this.localPlayer.status
        });
      }
    });

    this.startLocalPruningLoop();
  }

  public sendTransform(position: [number, number, number], rotation: number) {
    this.localPlayer.position = position;
    this.localPlayer.rotation = rotation;
    this.localPlayer.lastSeen = Date.now();

    if (this.channel && isSupabaseConfigured) {
      this.channel.send({
        type: 'broadcast',
        event: 'player-transform',
        payload: {
          id: this.localPlayer.id,
          guest_id: this.localPlayer.guest_id,
          display_name: this.localPlayer.display_name,
          district: this.localPlayer.district,
          position,
          rotation,
          character: this.localPlayer.character,
          reputation: this.localPlayer.reputation,
          status: this.localPlayer.status
        }
      });
    }
  }

  public sendChatMessage(text: string, type: 'nearby' | 'district' | 'direct' = 'nearby', receiverId?: string) {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sender_id: this.localPlayer.id,
      sender_name: this.localPlayer.display_name,
      receiver_id: receiverId,
      district: this.localPlayer.district,
      text,
      timestamp: Date.now(),
      type
    };

    if (this.channel && isSupabaseConfigured) {
      this.channel.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: msg
      });
    }

    this.onChatMessageReceived(msg);
  }

  public changeDistrict(newDistrict: string) {
    if (this.localPlayer.district === newDistrict) return;

    this.localPlayer.district = newDistrict;
    if (this.channel && isSupabaseConfigured) {
      this.channel.unsubscribe();
    }

    this.remotePlayers.clear();
    this.channelName = `game:ibadan:${newDistrict.toLowerCase().replace(/\s+/g, '-')}`;
    this.initRealtime();
  }

  private startLocalPruningLoop() {
    setInterval(() => {
      const now = Date.now();
      let changed = false;
      this.remotePlayers.forEach((p, id) => {
        if (now - p.lastSeen > 10000) {
          this.remotePlayers.delete(id);
          changed = true;
        }
      });
      if (changed) {
        this.notifyPlayersChanged();
      }
    }, 3000);
  }

  private notifyPlayersChanged() {
    this.onPlayersUpdated(Array.from(this.remotePlayers.values()));
  }

  public disconnect() {
    if (this.channel && isSupabaseConfigured) {
      this.channel.unsubscribe();
    }
    this.remotePlayers.clear();
  }
}
