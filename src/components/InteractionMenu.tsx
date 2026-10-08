import React from 'react';
import { NetworkPlayer } from '../types';
import { MessageSquare, UserPlus, Footprints, Shield, X } from 'lucide-react';

interface Props {
  player: NetworkPlayer;
  onClose: () => void;
  onGreet: (player: NetworkPlayer) => void;
  onOpenDirectMessage: (player: NetworkPlayer) => void;
  onAddFriend: (player: NetworkPlayer) => void;
  onFollow: (player: NetworkPlayer) => void;
}

export const InteractionMenu: React.FC<Props> = ({
  player,
  onClose,
  onGreet,
  onOpenDirectMessage,
  onAddFriend,
  onFollow
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm">
      <div className="hud-card w-full max-w-sm p-5 space-y-4 border border-emerald-500/40">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {player.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{player.display_name}</h3>
              <p className="text-xs text-gray-400">{player.district} • Rep {player.reputation}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onGreet(player)}
            className="hud-button py-2.5 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
          >
            👋 Greet
          </button>

          <button
            onClick={() => onOpenDirectMessage(player)}
            className="hud-button py-2.5 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" /> Chat
          </button>

          <button
            onClick={() => onAddFriend(player)}
            className="hud-button py-2.5 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
          >
            <UserPlus className="w-4 h-4 text-purple-400" /> Add Friend
          </button>

          <button
            onClick={() => onFollow(player)}
            className="hud-button py-2.5 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
          >
            <Footprints className="w-4 h-4 text-amber-400" /> Follow
          </button>
        </div>

        <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center gap-2 text-[11px] text-gray-400">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Private socioeconomic background is hidden & protected.</span>
        </div>
      </div>
    </div>
  );
};
