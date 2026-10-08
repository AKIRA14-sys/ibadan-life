import React, { useState } from 'react';
import { ShoppingBag, Box, X } from 'lucide-react';

interface Props {
  items: any[];
  inventory: any[];
  onClose: () => void;
  onBuyItem: (item: any) => void;
}

export const MarketModal: React.FC<Props> = ({ items, inventory, onClose, onBuyItem }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'inventory'>('market');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
      <div className="hud-card w-full max-w-lg p-6 space-y-5 border border-amber-500/30 text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'market'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Market
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" /> My Inventory ({inventory.length})
            </button>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeTab === 'market' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-amber-400 font-semibold uppercase">{item.category}</div>
                  <h3 className="font-bold text-sm text-white">{item.name}</h3>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                    ₦{item.price.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => onBuyItem(item)}
                  className="w-full mt-2 py-2 rounded-lg hud-button-accent text-xs font-bold"
                >
                  Buy Item
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-2">
            {inventory.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">Your inventory is empty. Visit the market to buy items!</div>
            ) : (
              inventory.map((invItem, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{invItem.name || 'Purchased Item'}</div>
                    <div className="text-[10px] text-gray-400">Category: {invItem.category || 'General'}</div>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded font-mono font-bold">
                    Qty: {invItem.quantity || 1}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
