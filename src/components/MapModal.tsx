import React from 'react';
import { IBADAN_DISTRICTS } from '../game/IbadanWorld';
import { MapPin, Navigation, X } from 'lucide-react';

interface Props {
  currentDistrict: string;
  playerPosition: [number, number, number];
  onClose: () => void;
  onSelectDistrictFastTravel?: (districtName: string) => void;
}

export const MapModal: React.FC<Props> = ({
  currentDistrict,
  onClose,
  onSelectDistrictFastTravel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md">
      <div className="hud-card w-full max-w-2xl p-6 space-y-5 border border-amber-500/30 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">IBADAN CITY INTERACTIVE MAP</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border border-gray-800 p-4 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

          {IBADAN_DISTRICTS.map((d) => {
            const isCurrent = d.name === currentDistrict;
            const leftPct = Math.min(92, Math.max(8, 50 + (d.center[0] / 240) * 100));
            const topPct = Math.min(92, Math.max(8, 50 + (d.center[1] / 240) * 100));

            return (
              <div
                key={d.name}
                onClick={() => onSelectDistrictFastTravel && onSelectDistrictFastTravel(d.name)}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 flex flex-col items-center group"
              >
                <div className={`p-1.5 rounded-full border shadow-md ${
                  isCurrent
                    ? 'bg-amber-500 border-white ring-4 ring-amber-500/40 text-slate-950 animate-bounce'
                    : 'bg-slate-900/90 border-gray-700 text-emerald-400 hover:border-emerald-400'
                }`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded whitespace-nowrap mt-1 border ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 border-white'
                    : 'bg-slate-900/90 text-gray-300 border-gray-800 group-hover:border-emerald-500'
                }`}>
                  {d.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {IBADAN_DISTRICTS.map((d) => (
            <div
              key={d.name}
              className={`p-3 rounded-xl border text-xs transition-all ${
                d.name === currentDistrict
                  ? 'bg-amber-500/10 border-amber-500 text-amber-200'
                  : 'bg-gray-900/60 border-gray-800 text-gray-300'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>{d.name}</span>
                {d.name === currentDistrict && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                    YOU ARE HERE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{d.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
