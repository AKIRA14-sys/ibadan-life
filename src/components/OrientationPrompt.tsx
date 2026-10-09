import React, { useEffect, useState } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';

export const OrientationPrompt: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if screen width < height and device is mobile/tablet size
      const isMobile = window.innerWidth <= 1024 || 'ontouchstart' in window;
      const portrait = isMobile && window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
          <Smartphone className="w-10 h-10 text-emerald-400 rotate-90 transition-transform duration-500" />
        </div>
        <RotateCcw className="w-8 h-8 text-amber-400 absolute -bottom-2 -right-2 animate-spin" style={{ animationDuration: '4s' }} />
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
        Landscape Orientation Required
      </h2>

      <p className="text-sm text-slate-300 max-w-xs leading-relaxed mb-6">
        IBADAN LIFE 3D is designed for widescreen landscape gameplay. Please rotate your device to landscape mode for optimal view and touch controls.
      </p>

      <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Rotate device to play</span>
      </div>
    </div>
  );
};
