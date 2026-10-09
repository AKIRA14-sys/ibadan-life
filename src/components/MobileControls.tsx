import React, { useRef, useState } from 'react';
import { Zap, MessageSquare, ArrowUpCircle } from 'lucide-react';

interface Props {
  onMove: (vector: { x: number; y: number }) => void;
  onCameraRotate: (delta: { x: number; y: number }) => void;
  onToggleSprint: (sprinting: boolean) => void;
  onJump?: () => void;
  onInteract: () => void;
  onOpenMap?: () => void;
  onOpenTravel?: () => void;
  isNearPlayerOrObject: boolean;
  currentDistrict?: string;
  lagosTime?: string;
}

export const MobileControls: React.FC<Props> = ({
  onMove,
  onCameraRotate,
  onToggleSprint,
  onJump,
  onInteract,
  isNearPlayerOrObject
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
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Touch Camera Swipe Area (Right half of viewport) */}
      <div
        className="absolute right-0 top-16 w-3/5 h-[calc(100%-120px)] pointer-events-auto"
        onTouchStart={handleCameraTouchStart}
        onTouchMove={handleCameraTouchMove}
        onTouchEnd={handleCameraTouchEnd}
      />

      {/* Bottom Touch Controls Area */}
      <div className="mt-auto flex items-end justify-between w-full pointer-events-auto pb-1 sm:pb-2">
        {/* Virtual Movement Joystick */}
        <div
          ref={joystickRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/80 border-2 border-emerald-500/40 backdrop-blur-md flex items-center justify-center touch-none shadow-2xl"
        >
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl border border-white/50 absolute transition-transform duration-75"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          />
        </div>

        {/* Action Buttons: Interact, Jump, Sprint */}
        <div className="flex flex-col gap-2.5 items-end">
          {isNearPlayerOrObject && (
            <button
              onClick={onInteract}
              className="hud-button-primary px-5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-2xl animate-pulse"
            >
              <MessageSquare className="w-4 h-4" /> INTERACT
            </button>
          )}

          <div className="flex items-center gap-3">
            {onJump && (
              <button
                onClick={onJump}
                className="w-12 h-12 rounded-full border border-emerald-400/40 shadow-xl flex items-center justify-center bg-slate-900/90 text-emerald-400 active:scale-95 active:bg-emerald-500/20"
                title="Jump"
              >
                <ArrowUpCircle className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={toggleSprint}
              className={`w-12 h-12 rounded-full border shadow-xl flex items-center justify-center transition-all ${
                isSprinting
                  ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110 shadow-amber-500/50'
                  : 'bg-slate-900/90 text-gray-300 border-white/20 active:scale-95'
              }`}
              title="Sprint"
            >
              <Zap className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
