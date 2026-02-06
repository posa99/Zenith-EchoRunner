
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import Player from './Player';
import Level from './Level';
import { PlayerStats, GameTheme, GameDifficulty, CharacterStyle, CameraPOV } from '../types';

interface ParkourGameProps {
  isPaused: boolean;
  onUpdateStats: (stats: PlayerStats) => void;
  onFinish: (time: number) => void;
  joystickData?: { x: number; y: number } | null;
  theme: GameTheme;
  difficulty: GameDifficulty;
  characterStyle: CharacterStyle;
  pov: CameraPOV;
  stage: number;
}

const ParkourGame: React.FC<ParkourGameProps> = ({ 
  isPaused, onUpdateStats, onFinish, joystickData, theme, difficulty, characterStyle, pov, stage 
}) => {
  const timeRef = useRef(0);
  const finished = useRef(false);

  // Reset internal finish state on stage update
  useEffect(() => {
    finished.current = false;
  }, [stage]);

  useFrame((state, delta) => {
    if (isPaused || finished.current) return;
    timeRef.current += delta;
  });

  const handleStatsUpdate = (speed: number, combo: number, superJumpReady: boolean, superJumpCooldown: number) => {
    onUpdateStats({
      speed,
      time: timeRef.current,
      checkpoints: 0,
      score: Math.floor(timeRef.current * 10) + (combo * 150),
      combo,
      superJumpReady,
      superJumpCooldown,
      stage
    });
  };

  const handleReachFinish = () => {
    if (!finished.current) {
      finished.current = true;
      onFinish(timeRef.current);
    }
  };

  return (
    <>
      <Player 
        isPaused={isPaused} 
        onStatsUpdate={handleStatsUpdate} 
        joystickData={joystickData}
        characterStyle={characterStyle}
        pov={pov}
        stage={stage}
      />
      <Level onFinish={handleReachFinish} theme={theme} difficulty={difficulty} stage={stage} />
    </>
  );
};

export default ParkourGame;
