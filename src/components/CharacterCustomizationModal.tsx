import React, { useState } from 'react';
import { OutfitOption, MALE_OUTFITS, FEMALE_OUTFITS } from '../data/outfits';
import { CharacterData } from '../types';
import { Shirt, Sparkles, X, Check } from 'lucide-react';

interface Props {
  gender: string;
  currentOutfitId?: string;
  onClose: () => void;
  onSelectOutfit: (outfit: OutfitOption, gender: 'Male' | 'Female') => void;
}

export const CharacterCustomizationModal: React.FC<Props> = ({
  gender: initialGender,
  currentOutfitId,
  onClose,
  onSelectOutfit
}) => {
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>(
    initialGender === 'Female' ? 'Female' : 'Male'
  );

  const outfits = selectedGender === 'Male' ? MALE_OUTFITS : FEMALE_OUTFITS;
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitOption>(
    outfits.find((o) => o.id === currentOutfitId) || outfits[0]
  );

  const handleGenderChange = (g: 'Male' | 'Female') => {
    setSelectedGender(g);
    const newOutfits = g === 'Male' ? MALE_OUTFITS : FEMALE_OUTFITS;
    setSelectedOutfit(newOutfits[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="hud-card w-full max-w-3xl max-h-[90vh] flex flex-col p-5 sm:p-6 text-white border border-purple-500/30">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-extrabold tracking-tight">CHARACTER OUTFIT CUSTOMIZATION</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs: Male / Female */}
        <div className="flex items-center gap-3 my-4">
          <button
            onClick={() => handleGenderChange('Male')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              selectedGender === 'Male'
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            👨 Male Collection (10 Outfits)
          </button>

          <button
            onClick={() => handleGenderChange('Female')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              selectedGender === 'Female'
                ? 'bg-pink-600 border-pink-400 text-white shadow-lg shadow-pink-500/30'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            👩 Female Collection (10 Outfits)
          </button>
        </div>

        {/* Outfit Selection Grid */}
        <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 p-1 max-h-[50vh]">
          {outfits.map((outfit) => {
            const isSelected = selectedOutfit.id === outfit.id;

            return (
              <div
                key={outfit.id}
                onClick={() => setSelectedOutfit(outfit)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-500/15 border-purple-400 ring-2 ring-purple-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{outfit.name}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-purple-300">{outfit.style}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{outfit.description}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: outfit.topColor }} title="Top" />
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: outfit.bottomColor }} title="Bottom" />
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Confirm Selection Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Selected: <span className="font-bold text-white">{selectedOutfit.name}</span>
          </div>

          <button
            onClick={() => {
              onSelectOutfit(selectedOutfit, selectedGender);
              onClose();
            }}
            className="hud-button-primary px-6 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-xl"
          >
            <Sparkles className="w-4 h-4" /> WEAR OUTFIT
          </button>
        </div>
      </div>
    </div>
  );
};
