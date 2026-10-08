import React, { useState } from 'react';
import { Property } from '../types';
import { Home, MapPin, Key, X } from 'lucide-react';

interface Props {
  properties: Property[];
  onClose: () => void;
  onBuyProperty: (property: Property) => void;
}

export const HousingModal: React.FC<Props> = ({ properties, onClose, onBuyProperty }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
      <div className="hud-card w-full max-w-lg p-6 space-y-5 border border-blue-500/30 text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">IBADAN REAL ESTATE & HOUSING</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {properties.map((prop) => (
            <div key={prop.id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-blue-500/40 transition-all space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-400 font-semibold uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {prop.location} District
                  </div>
                  <h3 className="font-bold text-sm text-white mt-0.5">{prop.type}</h3>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  ₦{prop.price.toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => onBuyProperty(prop)}
                className="w-full mt-2 py-2 rounded-lg hud-button text-xs font-bold border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-white flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-blue-400" /> Rent / Purchase Property
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
