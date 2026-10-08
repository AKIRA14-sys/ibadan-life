import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { MessageSquare, Send, X, Users } from 'lucide-react';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentDistrict: string;
}

export const ChatOverlay: React.FC<Props> = ({
  messages,
  onSendMessage,
  currentDistrict
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-sm w-full pointer-events-none">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hud-button pointer-events-auto px-4 py-2.5 rounded-full bg-slate-900/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-md"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>District Chat ({currentDistrict})</span>
        </button>
      )}

      {isOpen && (
        <div className="hud-card pointer-events-auto p-3 flex flex-col h-64 border border-emerald-500/30">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs font-bold text-gray-300">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Users className="w-4 h-4" />
              <span>{currentDistrict} Broadcast</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 text-xs">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center pt-8">No messages yet. Say hello to Ibadan!</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="bg-gray-900/60 p-2 rounded-lg border border-gray-800">
                  <span className="font-bold text-emerald-400">{m.sender_name}: </span>
                  <span className="text-gray-200">{m.text}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-gray-800">
            <input
              type="text"
              placeholder="Type message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button type="submit" className="hud-button-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
