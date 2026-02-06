
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls } from '@react-three/drei';
import ParkourGame from './components/ParkourGame';
import HUD from './components/HUD';
import MainMenu from './components/MainMenu';
import { GameSettings, PlayerStats, GameTheme, GameDifficulty, CharacterStyle, CameraPOV } from './types';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [stage, setStage] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Fix: Added missing joystickData state for mobile controls to resolve reference errors
  const [joystickData, setJoystickData] = useState<{ x: number; y: number } | null>(null);
  
  const [settings, setSettings] = useState<GameSettings>({
    fov: 65, // Tighter FOV to see player better
    sensitivity: 1.0,
    mobileControls: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    difficulty: GameDifficulty.MEDIUM,
    theme: GameTheme.CITY,
    characterStyle: CharacterStyle.REALISTIC,
    pov: CameraPOV.THIRD_PERSON
  });

  const [stats, setStats] = useState<PlayerStats>({
    speed: 0,
    time: 0,
    checkpoints: 0,
    score: 0,
    combo: 0,
    superJumpReady: true,
    superJumpCooldown: 0,
    stage: 1
  });

  const themeColors = useMemo(() => {
    switch(settings.theme) {
      case GameTheme.CITY: return { bg: '#8ca1b3', sky: [100, 20, 100] };
      case GameTheme.FOREST: return { bg: '#0a1a0a', sky: [50, 150, 50] };
      case GameTheme.DESERT: return { bg: '#ffe4b5', sky: [255, 150, 50] };
      case GameTheme.VOLCANO: return { bg: '#1a0000', sky: [255, 50, 0] };
      case GameTheme.OCEAN: return { bg: '#002244', sky: [0, 150, 255] };
      case GameTheme.SNOW: return { bg: '#f0ffff', sky: [200, 200, 255] };
      case GameTheme.MOUNTAIN: return { bg: '#2f4f4f', sky: [100, 120, 150] };
      default: return { bg: '#f0f4f8', sky: [150, 40, 150] };
    }
  }, [settings.theme]);

  const startGame = useCallback(() => {
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
    setStage(1);
    setStats({ speed: 0, time: 0, checkpoints: 0, score: 0, combo: 0, superJumpReady: true, superJumpCooldown: 0, stage: 1 });
  }, []);

  const handleNextStage = useCallback(() => {
    setStage(prev => prev + 1);
  }, []);

  const requestLock = useCallback(() => {
    if (isPaused && gameStarted) {
      setIsPaused(false);
    }
  }, [isPaused, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameStarted) {
        setIsPaused(true);
      }
      if (e.key === 'KeyV' && gameStarted) {
        setSettings(prev => ({
          ...prev,
          pov: prev.pov === CameraPOV.FIRST_PERSON ? CameraPOV.THIRD_PERSON : CameraPOV.FIRST_PERSON
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted]);

  const handleMobileJump = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' })), 50);
  }, []);

  const handleMobileSuperJump = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' })), 50);
  }, []);

  return (
    <div ref={canvasRef} className="w-full h-screen relative overflow-hidden" style={{ backgroundColor: themeColors.bg }}>
      {!gameStarted && !gameOver && (
        <MainMenu onStart={startGame} settings={settings} onSettingsChange={setSettings} />
      )}

      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4">
          <div className="text-center text-white p-8 max-w-2xl w-full">
            <h1 className="text-6xl md:text-9xl font-orbitron font-black mb-6 text-cyan-400 italic tracking-tighter leading-tight">FINISH LINE</h1>
            <p className="text-2xl md:text-4xl font-black mb-8 tracking-[0.2em] text-gray-400 uppercase">Stage {stage} Cleared in {stats.time.toFixed(2)}s</p>
            <button 
              onClick={startGame}
              className="w-full py-6 bg-cyan-500 text-white text-2xl font-black font-orbitron hover:bg-cyan-400 transition-all shadow-2xl italic tracking-tighter"
            >
              RUN AGAIN
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <>
          <Canvas 
            shadows 
            camera={{ fov: settings.fov, position: [0, 5, 8] }}
            className="w-full h-full"
            onPointerDown={requestLock}
          >
            <color attach="background" args={[themeColors.bg]} />
            <Sky sunPosition={themeColors.sky as [number, number, number]} turbidity={0.01} rayleigh={0.2} />
            
            <ParkourGame 
              isPaused={isPaused} 
              onUpdateStats={(s) => setStats({...s, stage})} 
              onFinish={handleNextStage}
              joystickData={joystickData}
              theme={settings.theme}
              difficulty={settings.difficulty}
              characterStyle={settings.characterStyle}
              pov={settings.pov}
              stage={stage}
            />

            {!settings.mobileControls && (
              <PointerLockControls 
                enabled={!isPaused} 
                onUnlock={() => setIsPaused(true)}
              />
            )}
          </Canvas>

          <HUD 
            stats={{...stats, stage}} 
            isPaused={isPaused} 
            mobile={settings.mobileControls} 
            onResume={requestLock} 
            onJoystickUpdate={setJoystickData}
            onJumpPress={handleMobileJump}
            onSuperJumpPress={handleMobileSuperJump}
            onPOVChange={() => setSettings(p => ({...p, pov: p.pov === CameraPOV.FIRST_PERSON ? CameraPOV.THIRD_PERSON : CameraPOV.FIRST_PERSON}))}
            currentPOV={settings.pov}
          />
          
          {isPaused && (
            <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md flex items-center justify-center p-8 pointer-events-auto" onClick={requestLock}>
              <div className="text-white text-center p-12 bg-[#1a1a1a] shadow-2xl border-b-8 border-cyan-500 w-full max-w-md rounded-lg">
                <h2 className="text-5xl font-orbitron font-black mb-4 italic tracking-tighter">PAUSED</h2>
                <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">Click to Resume Sync</p>
                <button 
                  onClick={requestLock}
                  className="w-full py-5 bg-cyan-500 text-white font-black font-orbitron text-xl hover:bg-cyan-400 transition-all"
                >
                  RESUME
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
