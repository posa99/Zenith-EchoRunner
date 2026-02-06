
import React, { useMemo, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GameTheme, GameDifficulty } from '../types';

interface LevelProps {
  onFinish: () => void;
  theme: GameTheme;
  difficulty: GameDifficulty;
  stage: number;
}

const Level: React.FC<LevelProps> = ({ onFinish, theme, difficulty, stage }) => {
  const themeColors = useMemo(() => {
    switch(theme) {
      case GameTheme.CITY: return { bg: '#8ca1b3', accent: '#00f3ff', platform: '#ffffff', support: '#dddddd', prop1: '#1a1a1a', prop2: '#ffdd00', fog: 1200 };
      case GameTheme.FOREST: return { bg: '#0a1a0a', accent: '#44ff00', platform: '#1b2b1b', support: '#3d2b1f', prop1: '#004400', prop2: '#8b4513', fog: 600 };
      case GameTheme.DESERT: return { bg: '#ffe4b5', accent: '#ff8c00', platform: '#deb887', support: '#8b4513', prop1: '#cd853f', prop2: '#daa520', fog: 800 };
      case GameTheme.VOLCANO: return { bg: '#1a0000', accent: '#ff2200', platform: '#110000', support: '#220000', prop1: '#ff4400', prop2: '#330000', fog: 500 };
      case GameTheme.OCEAN: return { bg: '#002244', accent: '#00f3ff', platform: '#e0ffff', support: '#b0c4de', prop1: '#00ced1', prop2: '#f0f8ff', fog: 1100 };
      case GameTheme.SNOW: return { bg: '#f0ffff', accent: '#00bfff', platform: '#ffffff', support: '#778899', prop1: '#b0c4de', prop2: '#ffffff', fog: 1500 };
      case GameTheme.MOUNTAIN: return { bg: '#2f4f4f', accent: '#f0f8ff', platform: '#c0c0c0', support: '#464e56', prop1: '#222', prop2: '#ccc', fog: 900 };
      default: return { bg: '#f0f4f8', accent: '#00f3ff', platform: '#ffffff', support: '#dddddd', prop1: '#1a1a1a', prop2: '#ffdd00', fog: 1000 };
    }
  }, [theme]);

  const difficultyParams = useMemo(() => {
    switch(difficulty) {
      case GameDifficulty.EASY: return { gapMult: 0.85, sizeMult: 1.2 };
      case GameDifficulty.MEDIUM: return { gapMult: 1.15, sizeMult: 1.0 };
      case GameDifficulty.HARD: return { gapMult: 1.6, sizeMult: 0.75 };
      default: return { gapMult: 1.15, sizeMult: 1.0 };
    }
  }, [difficulty]);

  return (
    <group key={stage}>
      <Course onFinish={onFinish} colors={themeColors} params={difficultyParams} theme={theme} stage={stage} />
      <ProceduralBackground colors={themeColors} theme={theme} />
      <fog attach="fog" args={[themeColors.bg, 120, themeColors.fog]} />
      <directionalLight position={[150, 450, 200]} intensity={5.0} castShadow shadow-mapSize={[2048, 2048]} />
      <ambientLight intensity={0.8} />
    </group>
  );
};

const Course = ({ onFinish, colors, params, theme, stage }: any) => {
  const gM = params.gapMult;
  const sM = params.sizeMult;
  const stageZOffset = (stage - 1) * -300;

  return (
    <group>
      {/* START PLATFORM */}
      <Platform pos={[0, -2, 0]} size={[120 * sM, 4, 120 * sM]} color={colors.platform} hasSupports colors={colors} props count={20} />
      
      {/* FIRST LEG - Ascending path */}
      <Bridge start={[0, 0, -60]} end={[0, 20, -180 * gM + stageZOffset]} width={14 * sM} color={colors.platform} accent={colors.accent} />
      
      {/* CLUSTER 1 - Verticality */}
      <group position={[0, 20, -260 * gM + stageZOffset]}>
         <Platform pos={[0, 0, 0]} size={[70 * sM, 3, 70 * sM]} color={colors.platform} accent={colors.accent} hasSupports colors={colors} props count={10} />
         <Platform pos={[50 * gM, 35, 20]} size={[35 * sM, 2, 35 * sM]} color={colors.platform} accent={colors.accent} colors={colors} props count={6} />
         <Platform pos={[-50 * gM, 55, 40]} size={[35 * sM, 2, 35 * sM]} color={colors.platform} accent={colors.accent} colors={colors} props count={6} />
         <Bridge start={[50 * gM, 35, 20]} end={[-50 * gM, 55, 40]} width={6 * sM} color={colors.platform} />
      </group>

      {/* LONG STRAIGHT BRIDGE - Sprint Zone */}
      <Bridge start={[0, 55, -320 * gM + stageZOffset]} end={[0, 75, -600 * gM + stageZOffset]} width={20 * sM} color={colors.platform} accent={colors.accent} />
      
      {/* OBSTACLE HUB - Wall runs and high ground */}
      <group position={[0, 75, -700 * gM + stageZOffset]}>
         <Platform pos={[0, 0, 0]} size={[120 * sM, 5, 150 * sM]} color={colors.platform} hasSupports colors={colors} props count={30} />
         {/* Side walls for wall running */}
         <Platform pos={[-60 * sM, 35, 0]} size={[3, 70, 150 * sM]} color={colors.platform} accent={colors.accent} colors={colors} />
         <Platform pos={[60 * sM, 35, 0]} size={[3, 70, 150 * sM]} color={colors.platform} accent={colors.accent} colors={colors} />
         {/* Floating obstacles over bridge */}
         <Platform pos={[0, 30, 0]} size={[20, 2, 20]} color={colors.platform} accent={colors.accent} />
      </group>

      {/* FINAL MASSIVE BRIDGE CONNECTING TO FINISH */}
      <Bridge start={[0, 75, -780 * gM + stageZOffset]} end={[0, 120, -1050 * gM + stageZOffset]} width={30 * sM} color={colors.platform} accent={colors.accent} />

      {/* FINISH ZONE - Goal */}
      <group position={[0, 120, -1300 * gM + stageZOffset]}>
        <Platform pos={[0, 0, 0]} size={[400, 20, 400]} color={colors.platform} accent={colors.accent} onCollide={onFinish} hasSupports colors={colors} props count={80} />
        {/* Epic Finish Banner Structure */}
        <group position={[0, 30, 160]}>
           <mesh position={[-100, 0, 0]}><cylinderGeometry args={[3, 3, 120]} /><meshStandardMaterial color={colors.support} /></mesh>
           <mesh position={[100, 0, 0]}><cylinderGeometry args={[3, 3, 120]} /><meshStandardMaterial color={colors.support} /></mesh>
           <mesh position={[0, 50, 0]}><boxGeometry args={[220, 15, 8]} /><meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={6} /></mesh>
           {/* Visual 'FINISH' blocks */}
           {[[-60,0],[0,0],[60,0]].map(([x,z], k) => (
              <mesh key={k} position={[x, 50, 5]}><boxGeometry args={[20, 10, 2]} /><meshStandardMaterial color="white" /></mesh>
           ))}
        </group>
      </group>
    </group>
  );
};

const Platform = ({ pos, size, color, accent, onCollide, hasSupports, colors, props, count = 5 }: any) => {
  const decor = useMemo(() => {
    if (!props) return [];
    const items = [];
    const seed = Math.abs(pos[2] * 100);
    const rng = (s: number) => {
        let x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
    };
    let currSeed = seed;
    for(let i=0; i<count; i++) {
        items.push({
            type: Math.floor(rng(currSeed++) * 6),
            p: [(rng(currSeed++) - 0.5) * size[0] * 0.9, size[1]/2, (rng(currSeed++) - 0.5) * size[2] * 0.9],
            r: rng(currSeed++) * Math.PI,
            s: 1.0 + rng(currSeed++) * 1.5
        });
    }
    return items;
  }, [props, size, count, pos]);

  return (
    <group position={pos}>
      <mesh receiveShadow castShadow onPointerEnter={() => onCollide?.()}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} />
        {accent && (
          <group position={[0, size[1]/2 + 0.3, 0]}>
            <mesh rotation={[-Math.PI/2, 0, 0]}>
               <planeGeometry args={[size[0] * 0.998, size[2] * 0.998]} />
               <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.5} transparent opacity={0.5} />
            </mesh>
          </group>
        )}
      </mesh>
      
      {decor.map((d, i) => (
        <group key={i} position={d.p as any} rotation={[0, d.r, 0]} scale={d.s}>
          {d.type === 0 && ( // Modern Tree
            <group position={[0, 2.5, 0]}>
               <mesh position={[0,-1.8,0]}><cylinderGeometry args={[0.4, 0.5, 4]} /><meshStandardMaterial color="#3d2b1f" /></mesh>
               <mesh position={[0, 1.2, 0]}><sphereGeometry args={[2.5, 6, 6]} /><meshStandardMaterial color={colors.prop1} /></mesh>
            </group>
          )}
          {d.type === 1 && ( // Car
            <group position={[0, 0.7, 0]}>
               <mesh><boxGeometry args={[4.5, 1.4, 2.2]} /><meshStandardMaterial color={["#ff4444", "#ffffff", "#4444ff", "#222222"][i%4]} metalness={0.8} roughness={0.2} /></mesh>
               <mesh position={[0, 1.1, 0]}><boxGeometry args={[2.2, 1.1, 1.8]} /><meshStandardMaterial color="#111" /></mesh>
               {[-1,1].map(x => [-1,1].map(z => (
                 <mesh key={`${x}-${z}`} position={[x*1.6, -0.6, z*1.0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.6, 0.6, 0.3]} /><meshStandardMaterial color="#000" /></mesh>
               )))}
            </group>
          )}
          {d.type === 2 && ( // Motorcycle
            <group position={[0, 0.7, 0]}>
               <mesh rotation={[Math.PI/2, 0, 0]} position={[1.0, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.4]} /><meshStandardMaterial color="#000" /></mesh>
               <mesh rotation={[Math.PI/2, 0, 0]} position={[-1.0, 0, 0]}><cylinderGeometry args={[0.8, 0.8, 0.4]} /><meshStandardMaterial color="#000" /></mesh>
               <mesh position={[0, 0.5, 0]}><boxGeometry args={[2.0, 0.6, 0.5]} /><meshStandardMaterial color={colors.accent} /></mesh>
            </group>
          )}
          {d.type === 3 && ( // Bench
            <group position={[0, 0.5, 0]}>
               <mesh><boxGeometry args={[2.5, 0.25, 1.0]} /><meshStandardMaterial color="#444" /></mesh>
               <mesh position={[0, 0.5, -0.45]} rotation={[0.4,0,0]}><boxGeometry args={[2.5, 1.0, 0.15]} /><meshStandardMaterial color="#444" /></mesh>
            </group>
          )}
          {d.type === 4 && ( // Street Lamp
            <group position={[0, 5, 0]}>
               <mesh position={[0, -5, 0]}><cylinderGeometry args={[0.3, 0.4, 10]} /><meshStandardMaterial color="#222" /></mesh>
               <mesh position={[0.7, 0, 0]}><boxGeometry args={[1.5, 0.4, 0.4]} /><meshStandardMaterial color="#222" /></mesh>
               <mesh position={[1.4, -0.3, 0]}><sphereGeometry args={[0.4]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} /></mesh>
            </group>
          )}
          {d.type === 5 && ( // Plant Box
            <group position={[0, 0.6, 0]}>
               <mesh><boxGeometry args={[2.5, 1.2, 2.5]} /><meshStandardMaterial color="#555" /></mesh>
               <mesh position={[0, 0.8, 0]}><sphereGeometry args={[1.0, 5, 5]} /><meshStandardMaterial color="#116611" /></mesh>
            </group>
          )}
        </group>
      ))}

      {hasSupports && (
        <group position={[0, -size[1]/2 - 75, 0]}>
          {[1, -1].map(x => [1, -1].map(z => (
             <mesh key={`${x}-${z}`} position={[x * size[0]/2.4, 0, z * size[2]/2.4]}>
               <cylinderGeometry args={[6, 8, 150]} />
               <meshStandardMaterial color={colors.support} />
             </mesh>
          )))}
        </group>
      )}
    </group>
  );
};

const Bridge = ({ start, end, width, color, accent }: any) => {
  const vStart = new THREE.Vector3(...start);
  const vEnd = new THREE.Vector3(...end);
  const dist = vStart.distanceTo(vEnd);
  const midPoint = vStart.clone().add(vEnd).multiplyScalar(0.5);
  const dir = vEnd.clone().sub(vStart).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group position={midPoint.toArray() as any} quaternion={quat}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, dist, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {accent && (
        <group position={[0, 0, 1.0]}>
          <mesh position={[width/2, 0, 0]}><boxGeometry args={[1.0, dist, 3.5]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.5} /></mesh>
          <mesh position={[-width/2, 0, 0]}><boxGeometry args={[1.0, dist, 3.5]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.5} /></mesh>
        </group>
      )}
    </group>
  );
};

const ProceduralBackground = ({ colors, theme }: any) => {
  const count = 400;
  const geometry = useMemo(() => new THREE.BoxGeometry(50, 1, 50), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Background is now completely static to prevent craziness
  useEffect(() => {
    if (!meshRef.current) return;
    const range = 3500;
    const rng = (s: number) => {
        let x = Math.sin(s++) * 10000;
        return x - Math.floor(x);
    };
    let seed = 42;
    for (let i = 0; i < count; i++) {
      const x = (rng(seed++) - 0.5) * range;
      const z = (rng(seed++) - 0.5) * range;
      const y = -400 + rng(seed++) * 100;
      dummy.position.set(x, y, z);
      const h = 100 + rng(seed++) * 500;
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <meshStandardMaterial color={colors.support} roughness={1} opacity={0.3} transparent />
    </instancedMesh>
  );
};

export default Level;
