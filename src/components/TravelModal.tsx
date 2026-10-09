import React from 'react';
import { IBADAN_DISTRICTS, DistrictZone } from '../game/IbadanWorld';
import { Navigation, Footprints, Play, Zap, X, MapPin } from 'lucide-react';

interface Props {
  currentDistrict: string;
  playerPosition: [number, number, number];
  onClose: () => void;
  onSelectTravel: (destination: DistrictZone, mode: 'trek' | 'autowalk' | 'teleport') => void;
}

export const TravelModal: React.FC<Props> = ({
  currentDistrict,
  playerPosition,
  onClose,
  onSelectTravel
}) => {
  const [px, , pz] = playerPosition;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="hud-card w-full max-w-2xl max-h-[90vh] flex flex-col p-5 sm:p-6 text-white border border-teal-500/30">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-extrabold tracking-tight">IBADAN LOCATIONS & TRAVEL</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 py-4 pr-1">
          {IBADAN_DISTRICTS.map((district) => {
            const [cx, cz] = district.center;
            const dx = cx - px;
            const dz = cz - pz;
            const distanceMeters = Math.round(Math.sqrt(dx * dx + dz * dz));
            const isCurrent = district.name === currentDistrict;

            return (
              <div
                key={district.name}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-extrabold text-base text-white">{district.name}</h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          YOU ARE HERE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{district.description}</p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {district.landmarks.map((lm) => (
                        <span key={lm} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          📍 {lm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <span className="text-xs font-mono font-bold text-amber-300">{distanceMeters}m away</span>
                  </div>
                </div>

                {!isCurrent && (
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onSelectTravel(district, 'trek')}
                      className="hud-button py-2 px-3 rounded-lg text-xs font-bold text-teal-300 border border-teal-500/30 flex items-center justify-center gap-1 hover:bg-teal-500/20"
                    >
                      <Footprints className="w-3.5 h-3.5" /> Trek
                    </button>

                    <button
                      onClick={() => onSelectTravel(district, 'autowalk')}
                      className="hud-button py-2 px-3 rounded-lg text-xs font-bold text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1 hover:bg-blue-500/20"
                    >
                      <Play className="w-3.5 h-3.5" /> Auto-Walk
                    </button>

                    <button
                      onClick={() => onSelectTravel(district, 'teleport')}
                      className="hud-button-accent py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md"
                    >
                      <Zap className="w-3.5 h-3.5" /> Teleport
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
