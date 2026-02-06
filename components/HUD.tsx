
import React, { useState, useCallback } from 'react';
import { PlayerStats, CameraPOV } from '../types';

interface HUDProps {
  stats: PlayerStats;
  isPaused: boolean;
  mobile: boolean;
  onResume: () => void;
  onPause?: () => void;
  onRestart?: () => void;
  onQuitToMenu?: () => void;
  onJoystickUpdate?: (data: { x: number; y: number } | null) => void;
  onJumpPress?: () => void;
  onSuperJumpPress?: () => void;
  onPOVChange?: () => void;
  currentPOV?: CameraPOV;
}

const HUD: React.FC<HUDProps> = ({
  stats,
  isPaused,
  mobile,
  onResume,
  onPause,
  onRestart,
  onQuitToMenu,
  onJoystickUpdate,
  onJumpPress,
  onSuperJumpPress,
  onPOVChange,
  currentPOV
}) => {
  const speedKmh = Math.floor(stats.speed * 3.6);
  const flowProgress = Math.min((stats.speed / 55) * 100, 100);
  const isExtreme = stats.speed > 45;

  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  const handleJoystickStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxDist = 80;
    
    const limitedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * (limitedDist / maxDist);
    const ny = Math.sin(angle) * (limitedDist / maxDist);
    
    setJoystickPos({ x: Math.cos(angle) * limitedDist, y: Math.sin(angle) * limitedDist });
    onJoystickUpdate?.({ x: nx, y: ny });
  }, [touchStart, onJoystickUpdate]);

  const handleJoystickEnd = () => {
    setTouchStart(null);
    setJoystickPos({ x: 0, y: 0 });
    onJoystickUpdate?.(null);
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-4 md:p-8 flex flex-col justify-between text-[#1a1a1a] font-orbitron select-none">
      
      {/* Top Section */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-2 max-w-xs sm:max-w-sm">
           <div className="bg-white/95 px-3 sm:px-5 py-2 border-l-4 border-cyan-500 shadow-2xl rounded-sm">
             <div className="text-[9px] sm:text-[10px] text-cyan-600 font-black mb-1 tracking-[0.3em] sm:tracking-widest uppercase">Stage Progression</div>
             <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
               <span className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter">PHASE {stats.stage}</span>
               <span className="text-sm sm:text-base md:text-xl font-black italic tabular-nums opacity-60">{stats.time.toFixed(1)}s</span>
             </div>
           </div>
           
           <button 
             onClick={onPOVChange}
             className="pointer-events-auto bg-black text-white px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-widest hover:bg-cyan-500 transition-colors shadow-lg"
           >
             POV: {currentPOV === CameraPOV.FIRST_PERSON ? 'FIRST' : 'THIRD'} [V]
           </button>

           <div className="flex gap-1 sm:gap-2 mt-1 pointer-events-auto">
             <button
               onClick={onPause}
               className="px-2 sm:px-3 py-1 bg-white/90 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] border border-gray-200 hover:border-cyan-500 hover:text-cyan-600 transition-colors shadow-sm"
             >
               PAUSE
             </button>
             <button
               onClick={onRestart}
               className="px-2 sm:px-3 py-1 bg-white/90 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] border border-gray-200 hover:border-pink-500 hover:text-pink-600 transition-colors shadow-sm"
             >
               RESET
             </button>
             <button
               onClick={onQuitToMenu}
               className="px-2 sm:px-3 py-1 bg-black/90 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white hover:bg-black transition-colors shadow-sm"
             >
               MENU
             </button>
           </div>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className={`bg-white/95 px-6 py-2 border-r-4 border-pink-500 shadow-xl transition-all duration-300 ${stats.combo > 0 ? 'scale-110' : 'opacity-40'}`}>
              <div className="text-[10px] text-pink-600 font-black text-right mb-1 tracking-widest uppercase">Momentum Chain</div>
              <span className="text-4xl font-black italic text-pink-600">x{stats.combo}</span>
           </div>
           
           <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg ${stats.superJumpReady ? 'bg-cyan-500 text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}>
              SUPER BURST: {stats.superJumpReady ? 'ONLINE' : `COOLDOWN ${stats.superJumpCooldown.toFixed(1)}s`}
           </div>
        </div>
      </div>

      {/* Mobile Input Surface */}
      <div className="absolute inset-0 flex items-end justify-between p-8 pointer-events-none">
        {mobile && (
           <div 
             className="w-64 h-64 rounded-full bg-white/5 border-2 border-white/10 relative pointer-events-auto flex items-center justify-center backdrop-blur-sm"
             onTouchStart={handleJoystickStart}
             onTouchMove={handleJoystickMove}
             onTouchEnd={handleJoystickEnd}
           >
             <div 
               className="w-24 h-24 rounded-full bg-white shadow-2xl absolute flex items-center justify-center border-2 border-cyan-500"
               style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
             >
                <div className="w-14 h-14 border-4 border-cyan-500 rounded-full opacity-20"></div>
             </div>
           </div>
        )}

        {mobile && (
           <div className="flex flex-col gap-8 pointer-events-auto items-center">
              <button 
                onPointerDown={onJumpPress}
                className="w-32 h-32 rounded-full bg-white/95 border-4 border-cyan-500 flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
              >
                <span className="text-3xl font-black italic text-cyan-600">ASCEND</span>
              </button>
              <button 
                onPointerDown={onSuperJumpPress}
                className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-2xl active:scale-90 transition-all ${stats.superJumpReady ? 'bg-pink-600 border-white text-white' : 'bg-gray-200 border-gray-400 text-gray-400'}`}
              >
                <span className="text-[10px] font-black text-center">FORCE<br/>PULSE</span>
              </button>
           </div>
        )}
      </div>

      {/* Speedometer Footer */}
      <div className="flex justify-between items-end z-10">
        <div className="w-full max-w-sm bg-white/95 p-6 md:p-8 shadow-2xl border-t-8 border-cyan-500 relative rounded-sm">
          <div className="flex justify-between items-end mb-4">
             <div>
                <p className="text-[10px] font-bold text-cyan-600 tracking-[0.5em] uppercase mb-1">Kinetic Output</p>
                <div className="flex items-baseline gap-2">
                   <h2 className={`text-7xl font-black italic tracking-tighter transition-all tabular-nums ${isExtreme ? 'text-pink-600 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'text-gray-900'}`}>
                    {speedKmh}
                   </h2>
                   <span className="text-sm font-bold opacity-30 italic">KM/H</span>
                </div>
             </div>
          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
             <div 
               className={`h-full transition-all duration-300 ${isExtreme ? 'bg-pink-500' : 'bg-cyan-500'}`}
               style={{ width: `${flowProgress}%` }}
             ></div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] text-right">
          <p className="text-cyan-500">WASD: COORDINATE INPUT</p>
          <p className="text-pink-500">SHIFT: KINETIC BOOST</p>
          <p className="text-cyan-400">Q/E: SUPER JUMP</p>
          <p className="text-white bg-black px-2 py-1 inline-block">V: TOGGLE POV</p>
          <p>SPACE: ASCEND</p>
        </div>
      </div>
    </div>
  );
};

export default HUD;
