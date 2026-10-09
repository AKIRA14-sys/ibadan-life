import React, { useState } from 'react';
import { CharacterData, HiddenBackground } from '../types';
import { OutfitOption, MALE_OUTFITS, FEMALE_OUTFITS } from '../data/outfits';
import { Sparkles, User, Shield, Shirt } from 'lucide-react';

interface Props {
  onComplete: (data: {
    displayName: string;
    character: CharacterData;
    background: HiddenBackground;
  }) => void;
}

const SKIN_TONES = ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac', '#4a2c11'];
const DISTRICTS = [
  'Dugbe Commercial Hub', 'Iwo Road Transport Hub', 'Bodija Market & Estate',
  'Oke-Ado Schools Corridor', 'Jericho Residential Zone'
];

export const CharacterCreator: React.FC<Props> = ({ onComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [skinTone, setSkinTone] = useState(SKIN_TONES[0]);
  const [startingNeighborhood, setStartingNeighborhood] = useState(DISTRICTS[0]);
  const [background, setBackground] = useState<HiddenBackground>('LAPO Baby');

  const outfits = gender === 'Male' ? MALE_OUTFITS : FEMALE_OUTFITS;
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitOption>(outfits[0]);

  const handleGenderSelect = (g: 'Male' | 'Female') => {
    setGender(g);
    const newOutfits = g === 'Male' ? MALE_OUTFITS : FEMALE_OUTFITS;
    setSelectedOutfit(newOutfits[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const character: CharacterData = {
      age: 22,
      gender,
      skin_tone: skinTone,
      hairstyle: 'Default',
      hair_color: '#111827',
      face_style: 'Standard',
      clothing: {
        top: selectedOutfit.topColor,
        bottom: selectedOutfit.bottomColor,
        shoes: '#0f172a'
      },
      personality: 'Resourceful',
      starting_neighborhood: startingNeighborhood
    };

    onComplete({
      displayName: displayName.trim(),
      character,
      background
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="hud-card w-full max-w-2xl p-6 sm:p-8 space-y-6 my-auto text-white border border-emerald-500/30">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> IBADAN LIFE SIMULATOR
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
            CREATE YOUR CHARACTER
          </h1>
          <p className="text-sm text-slate-400">
            Select your character presentation, skin tone, and authentic 3D Nigerian outfit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> Full Name / Display Tag
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Adebayo Ogunlesi"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Presentation</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleGenderSelect('Male')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                    gender === 'Male' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  👨 Male
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect('Female')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                    gender === 'Female' ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  👩 Female
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Starting District</label>
              <select
                value={startingNeighborhood}
                onChange={(e) => setStartingNeighborhood(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-purple-400" /> Select Outfit ({outfits.length} Options Available)
            </label>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-900/60 rounded-xl border border-slate-800">
              {outfits.map((outfit) => {
                const isSelected = selectedOutfit.id === outfit.id;
                return (
                  <div
                    key={outfit.id}
                    onClick={() => setSelectedOutfit(outfit)}
                    className={`p-2.5 rounded-lg border cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400 text-white font-bold ring-1 ring-purple-400'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate font-semibold">{outfit.name}</div>
                    <div className="text-[10px] text-purple-300 truncate">{outfit.style}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Private Socioeconomic Background
              </label>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                TOP SECRET
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setBackground('LAPO Baby')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  background === 'LAPO Baby'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="font-bold text-amber-400 text-xs">LAPO Baby</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">₦5,000 Cash</div>
              </div>

              <div
                onClick={() => setBackground('Middle-Class Kid')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  background === 'Middle-Class Kid'
                    ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="font-bold text-blue-400 text-xs">Middle-Class Kid</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">₦50,000 Cash</div>
              </div>

              <div
                onClick={() => setBackground('Nepo Baby')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  background === 'Nepo Baby'
                    ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="font-bold text-purple-400 text-xs">Nepo Baby</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">₦500,000 Cash</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl hud-button-primary text-base font-bold tracking-wide shadow-lg"
          >
            ENTER IBADAN CITY
          </button>
        </form>
      </div>
    </div>
  );
};
