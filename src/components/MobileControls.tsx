import React, { useRef, useState } from 'react';
import { Compass, Zap, MessageSquare, MapPin } from 'lucide-react';

interface Props {
  onMove: (vector: { x: number; y: number }) => void;
  onCameraRotate: (delta: { x: number; y: number }) => void;
  onToggleSprint: (sprinting: boolean) => void;
  onInteract: () => void;
  onOpenMap: () => void;
  isNearPlayerOrObject: boolean;
  currentDistrict: string;
}

export const MobileControls: React.FC<Props> = ({
  onMove,
  onCameraRotate,
  onToggleSprint,
  onInteract,
  onOpenMap,
  isNearPlayerOrObject,
  currentDistrict
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isSprinting, setIsSprinting] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setJoystickActive(true);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!joystickRef.current) return;

    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    const maxRadius = rect.width / 2;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    const clampedDist = Math.min(distance, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    const normX = knobX / maxRadius;
    const normY = knobY / maxRadius;
    onMove({ x: normX, y: normY });
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setJoystickActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  const handleCameraTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCameraTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    onCameraRotate({ x: dx, y: dy });
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCameraTouchEnd = () => {
    touchStartRef.current = null;
  };

  const toggleSprint = () => {
    const nextState = !isSprinting;
    setIsSprinting(nextState);
    onToggleSprint(nextState);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 select-none">
      {/* Top District Status Badge & Map Toggle */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="hud-card px-3.5 py-1.5 flex items-center gap-2 border border-emerald-500/30 text-xs font-bold text-white">
          <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>{currentDistrict}</span>
        </div>

        <button
          onClick={onOpenMap}
          className="hud-button px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 pointer-events-auto"
        >
          <Compass className="w-4 h-4 text-amber-400" /> MAP
        </button>
      </div>

      {/* Touch camera swipe zone (Right side) */}
      <div
        className="absolute right-0 top-0 w-1/2 h-full pointer-events-auto"
        onTouchStart={handleCameraTouchStart}
        onTouchMove={handleCameraTouchMove}
        onTouchEnd={handleCameraTouchEnd}
      />

      {/* Bottom Controls Area */}
      <div className="mt-auto flex items-end justify-between w-full pointer-events-auto pb-2">
        {/* Virtual Joystick */}
        <div
          ref={joystickRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          className="relative w-28 h-28 rounded-full bg-slate-900/60 border-2 border-white/20 backdrop-blur-md flex items-center justify-center touch-none"
        >
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg border border-white/40 absolute transition-transform duration-75"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 items-end">
          {isNearPlayerOrObject && (
            <button
              onClick={onInteract}
              className="hud-button-primary px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl animate-pulse"
            >
              <MessageSquare className="w-4 h-4" /> INTERACT
            </button>
          )}

          <button
            onClick={toggleSprint}
            className={`p-3.5 rounded-full border shadow-xl flex items-center justify-center transition-all ${
              isSprinting
                ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110'
                : 'bg-slate-900/80 text-gray-300 border-white/20'
            }`}
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
