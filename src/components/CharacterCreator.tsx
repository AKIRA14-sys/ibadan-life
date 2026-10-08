import React, { useState } from 'react';
import { CharacterData, HiddenBackground } from '../types';
import { Sparkles, User, Shield } from 'lucide-react';

interface Props {
  onComplete: (data: {
    displayName: string;
    character: CharacterData;
    background: HiddenBackground;
  }) => void;
}

const SKIN_TONES = ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac', '#4a2c11'];
const HAIR_STYLES = ['Afro Short', 'Buzz Cut', 'Dreadlocks', 'Braids', 'Side Part', 'Bald'];
const HAIR_COLORS = ['#1c1917', '#451a03', '#78350f', '#d97706', '#dc2626'];
const DISTRICTS = [
  'Iwo Road', 'Challenge', 'Oke-Ado', 'Oke-Bola', 'NTC Road', 'Ring Road',
  'Dugbe', 'Bodija', 'Mokola', 'Sango', 'Odo-Ona', 'Apata', 'Jericho', 'Mapo/Oja-Oba'
];
const PERSONALITIES = ['Energetic', 'Resourceful', 'Calm', 'Ambitious', 'Friendly', 'Street-Smart'];

export const CharacterCreator: React.FC<Props> = ({ onComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState(20);
  const [gender] = useState('Male');
  const [skinTone, setSkinTone] = useState(SKIN_TONES[0]);
  const [hairstyle, setHairstyle] = useState(HAIR_STYLES[0]);
  const [hairColor] = useState(HAIR_COLORS[0]);
  const [topColor, setTopColor] = useState('#2563eb');
  const [bottomColor, setBottomColor] = useState('#1e293b');
  const [personality] = useState(PERSONALITIES[0]);
  const [startingNeighborhood, setStartingNeighborhood] = useState(DISTRICTS[0]);
  const [background, setBackground] = useState<HiddenBackground>('LAPO Baby');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const character: CharacterData = {
      age,
      gender,
      skin_tone: skinTone,
      hairstyle,
      hair_color: hairColor,
      face_style: 'Standard',
      clothing: {
        top: topColor,
        bottom: bottomColor,
        shoes: '#0f172a'
      },
      personality,
      starting_neighborhood: startingNeighborhood
    };

    onComplete({
      displayName: displayName.trim(),
      character,
      background
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md overflow-y-auto">
      <div className="hud-card w-full max-w-2xl p-6 sm:p-8 space-y-6 my-auto text-white border border-emerald-500/30">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> IBADAN LIFE SIMULATOR
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
            CREATE YOUR CHARACTER
          </h1>
          <p className="text-sm text-gray-400">
            Build your unique identity and start your journey in 3D Ibadan alongside real players.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> Full Name / Display Tag
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Adebayo Ogunlesi"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Age ({age})</label>
              <input
                type="range"
                min="16"
                max="65"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full mt-2 accent-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Starting District</label>
              <select
                value={startingNeighborhood}
                onChange={(e) => setStartingNeighborhood(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Skin Tone</label>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {SKIN_TONES.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSkinTone(color)}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${
                    skinTone === color ? 'scale-110 border-emerald-400 ring-2 ring-emerald-400/50' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Hairstyle</label>
              <select
                value={hairstyle}
                onChange={(e) => setHairstyle(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white"
              >
                {HAIR_STYLES.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Shirt Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={topColor}
                  onChange={(e) => setTopColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-700 bg-transparent"
                />
                <span className="text-xs text-gray-400 font-mono">{topColor}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Private Starting Background
              </label>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono">
                TOP SECRET / NEVER PUBLIC
              </span>
            </div>

            <p className="text-xs text-gray-400">
              Your socioeconomic origin determines your starting funds and items. This background is <strong>completely hidden</strong> from other players in multiplayer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setBackground('LAPO Baby')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  background === 'LAPO Baby'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="font-bold text-amber-400 text-sm">LAPO Baby</div>
                <div className="text-xs text-emerald-400 font-mono mt-1 font-semibold">₦5,000 Starting Cash</div>
              </div>

              <div
                onClick={() => setBackground('Middle-Class Kid')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  background === 'Middle-Class Kid'
                    ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/40'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="font-bold text-blue-400 text-sm">Middle-Class Kid</div>
                <div className="text-xs text-emerald-400 font-mono mt-1 font-semibold">₦50,000 Starting Cash</div>
              </div>

              <div
                onClick={() => setBackground('Nepo Baby')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  background === 'Nepo Baby'
                    ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/40'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="font-bold text-purple-400 text-sm">Nepo Baby</div>
                <div className="text-xs text-emerald-400 font-mono mt-1 font-semibold">₦500,000 Starting Cash</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl hud-button-primary text-base font-bold tracking-wide shadow-lg"
          >
            ENTER IBADAN CITY
          </button>
        </form>
      </div>
    </div>
  );
};
