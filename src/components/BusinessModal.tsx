import React, { useState } from 'react';
import { Building2, Plus, X } from 'lucide-react';

interface Props {
  businesses: any[];
  onClose: () => void;
  onCreateBusiness: (name: string, type: string, location: string) => void;
}

export const BusinessModal: React.FC<Props> = ({ businesses, onClose, onCreateBusiness }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Food Shop');
  const [location, setLocation] = useState('Iwo Road');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateBusiness(name.trim(), type, location);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
      <div className="hud-card w-full max-w-lg p-6 space-y-5 border border-purple-500/30 text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">IBADAN BUSINESS ENTERPRISE HUB</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Owned Enterprises ({businesses.length})</h3>
          {businesses.length === 0 ? (
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-center text-xs text-gray-500">
              You do not own any businesses in Ibadan yet. Start your enterprise below!
            </div>
          ) : (
            businesses.map((b, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-purple-300">{b.name}</div>
                  <div className="text-xs text-gray-400">{b.type} • {b.location}</div>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  Balance: ₦{(b.balance || 0).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
          <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-purple-400" /> Register New Ibadan Business (₦100,000)
          </h3>

          <input
            type="text"
            required
            placeholder="Business Name (e.g. Ibadan Tech Cafe)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white"
            >
              <option value="Food Shop">Food Shop / Bukka</option>
              <option value="Clothing Store">Clothing Boutique</option>
              <option value="Phone Shop">Phone Repair & Accessories</option>
              <option value="Market Stall">Market Stall</option>
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white"
            >
              <option value="Iwo Road">Iwo Road</option>
              <option value="Dugbe">Dugbe</option>
              <option value="Bodija">Bodija</option>
              <option value="Challenge">Challenge</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg hud-button text-xs font-bold bg-purple-600 border border-purple-400 text-white hover:bg-purple-700"
          >
            Launch Business
          </button>
        </form>
      </div>
    </div>
  );
};
