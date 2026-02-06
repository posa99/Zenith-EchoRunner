
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterStyle, CameraPOV } from '../types';

interface PlayerProps {
  isPaused: boolean;
  onStatsUpdate: (speed: number, combo: number, superJumpReady: boolean, cooldown: number) => void;
  joystickData?: { x: number; y: number } | null;
  characterStyle: CharacterStyle;
  pov: CameraPOV;
  stage: number;
}

const Player: React.FC<PlayerProps> = ({ isPaused, onStatsUpdate, joystickData, characterStyle, pov, stage }) => {
  const { camera, scene } = useThree();
  
  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, 15, 0));
  const momentum = useRef(0);
  const comboRef = useRef(0);
  const jumpsRemaining = useRef(3);
  const jumpCooldown = useRef(0);
  const coyoteTime = useRef(0);
  const superJumpCooldown = useRef(0);
  const isSliding = useRef(false);
  
  const characterGroup = useRef<THREE.Group>(null);
  const trailMesh = useRef<THREE.Mesh>(null);
  const jumpEffectRef = useRef<THREE.Mesh>(null);
  
  const isGrounded = useRef(false);
  const keys = useRef<{ [key: string]: boolean }>({});

  const FLOW_MAX = 62.0;
  const GRAVITY = 48.0;
  const BASE_JUMP_FORCE = 19.0;
  const SUPER_JUMP_FORCE = 52.0;
  const SUPER_JUMP_CD = 7.0;

  // Even tighter camera offset
  const cameraOffset = new THREE.Vector3(0, 1.8, 4.5);

  useEffect(() => {
    position.current.set(0, 18, 0);
    velocity.current.set(0, 0, 0);
    momentum.current = 0;
    jumpsRemaining.current = 3;
    comboRef.current = 0;
  }, [stage]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const ray = new THREE.Raycaster();
  const downVec = new THREE.Vector3(0, -1, 0);

  useFrame((state, delta) => {
    if (isPaused) return;
    const dt = Math.min(delta, 0.1);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - dt);
    coyoteTime.current = Math.max(0, coyoteTime.current - dt);
    superJumpCooldown.current = Math.max(0, superJumpCooldown.current - dt);

    let forward = (keys.current['KeyW'] ? 1 : 0) - (keys.current['KeyS'] ? 1 : 0);
    let side = (keys.current['KeyD'] ? 1 : 0) - (keys.current['KeyA'] ? 1 : 0);

    if (joystickData) {
      side = joystickData.x;
      forward = -joystickData.y;
    }

    const isMoving = Math.abs(forward) > 0.1 || Math.abs(side) > 0.1;
    const isSprinting = keys.current['ShiftLeft'] || (joystickData && Math.sqrt(side**2 + forward**2) > 0.8);
    const wantsToSlide = keys.current['ControlLeft'] || keys.current['KeyC'];

    if (wantsToSlide && isGrounded.current && isMoving) {
      isSliding.current = true;
      momentum.current = THREE.MathUtils.lerp(momentum.current, FLOW_MAX * 1.15, dt * 3);
    } else {
      isSliding.current = false;
    }

    const targetSpeed = isMoving ? (isSprinting ? FLOW_MAX : 30.0) : 0;
    const accelRate = isGrounded.current ? 10.0 : 3.0;
    momentum.current = THREE.MathUtils.lerp(momentum.current, targetSpeed, dt * accelRate);

    const camEuler = new THREE.Euler(0, camera.rotation.y, 0);
    const moveDir = new THREE.Vector3(side, 0, -forward).normalize().applyEuler(camEuler);

    if (isMoving) {
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, moveDir.x * momentum.current, dt * 12);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, moveDir.z * momentum.current, dt * 12);
    } else {
      const friction = isGrounded.current ? 22.0 : 2.0;
      velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, 0, dt * friction);
      velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, 0, dt * friction);
    }

    ray.set(position.current, downVec);
    const groundHits = ray.intersectObjects(scene.children, true);
    const dist = groundHits.length > 0 ? groundHits[0].distance : 1000;

    const rideHeight = isSliding.current ? 0.8 : 1.45;
    if (dist < rideHeight) {
      if (!isGrounded.current) {
        jumpsRemaining.current = 3;
        coyoteTime.current = 0.35;
      }
      isGrounded.current = true;
      velocity.current.y = Math.max(0, velocity.current.y);
      position.current.y += (rideHeight - dist);
    } else {
      isGrounded.current = false;
      velocity.current.y -= GRAVITY * dt;
    }

    const wantsToJump = keys.current['Space'];
    const wantsToSuperJump = keys.current['KeyE'] || keys.current['KeyQ'];

    if (wantsToSuperJump && superJumpCooldown.current === 0) {
      velocity.current.y = SUPER_JUMP_FORCE;
      velocity.current.add(moveDir.clone().multiplyScalar(40));
      superJumpCooldown.current = SUPER_JUMP_CD;
      isGrounded.current = false;
    } else if (wantsToJump && jumpCooldown.current === 0 && (isGrounded.current || coyoteTime.current > 0 || jumpsRemaining.current < 3)) {
      if (jumpsRemaining.current > 0) {
        const mult = [1.0, 1.35, 1.9][3 - jumpsRemaining.current];
        velocity.current.y = (isSliding.current ? BASE_JUMP_FORCE * 1.4 : BASE_JUMP_FORCE * mult);
        isGrounded.current = false;
        coyoteTime.current = 0;
        jumpsRemaining.current--;
        jumpCooldown.current = 0.18;
        comboRef.current++;
        
        if (jumpEffectRef.current && jumpsRemaining.current < 2) {
          jumpEffectRef.current.position.copy(position.current).y -= 0.5;
          jumpEffectRef.current.scale.set(0.1, 0.1, 0.1);
          jumpEffectRef.current.visible = true;
        }
      }
    }

    position.current.add(velocity.current.clone().multiplyScalar(dt));

    if (characterGroup.current) {
      characterGroup.current.position.copy(position.current);
      if (isMoving) {
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        characterGroup.current.rotation.y = THREE.MathUtils.lerp(characterGroup.current.rotation.y, targetRot, dt * 18);
      }
      const targetScaleY = isSliding.current ? 0.45 : 1.0;
      characterGroup.current.scale.y = THREE.MathUtils.lerp(characterGroup.current.scale.y, targetScaleY, dt * 12);
      characterGroup.current.visible = pov === CameraPOV.THIRD_PERSON;
    }

    if (pov === CameraPOV.THIRD_PERSON) {
      const offset = cameraOffset.clone().applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
      const zoom = 1 + (momentum.current / FLOW_MAX) * 0.3;
      offset.multiplyScalar(zoom);
      const targetCam = position.current.clone().add(offset);
      camera.position.lerp(targetCam, dt * 15);
      camera.lookAt(position.current.clone().add(new THREE.Vector3(0, 1.2, 0)));
    } else {
      camera.position.copy(position.current).add(new THREE.Vector3(0, (isSliding.current ? 0.4 : 2.0), 0));
    }
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, 65 + (momentum.current * 0.8), dt * 10);
      camera.updateProjectionMatrix();
    }

    if (position.current.y < -30) {
      position.current.set(0, 20, 0);
      velocity.current.set(0, 0, 0);
      momentum.current = 0;
      comboRef.current = 0;
    }

    onStatsUpdate(momentum.current, comboRef.current, superJumpCooldown.current === 0, superJumpCooldown.current);
  });

  return (
    <>
      <group ref={characterGroup}>
        {characterStyle === CharacterStyle.SILHOUETTE ? (
          <>
            <mesh castShadow position={[0, 1.2, 0]}>
              <capsuleGeometry args={[0.5, 1.0, 4, 16]} />
              <meshStandardMaterial color="#000" metalness={1} roughness={0} />
            </mesh>
            <mesh position={[0, 2.4, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial color="#000" emissive="#00f3ff" emissiveIntensity={1} />
            </mesh>
          </>
        ) : (
          <group>
            <mesh position={[0.18, 0.6, 0]} castShadow><capsuleGeometry args={[0.18, 0.7, 4, 8]} /><meshStandardMaterial color="#111" /></mesh>
            <mesh position={[-0.18, 0.6, 0]} castShadow><capsuleGeometry args={[0.18, 0.7, 4, 8]} /><meshStandardMaterial color="#111" /></mesh>
            <mesh position={[0.18, 0.05, 0.1]}><boxGeometry args={[0.2, 0.15, 0.4]} /><meshStandardMaterial color="#fff" /></mesh>
            <mesh position={[-0.18, 0.05, 0.1]}><boxGeometry args={[0.2, 0.15, 0.4]} /><meshStandardMaterial color="#fff" /></mesh>
            <mesh position={[0, 1.7, 0]} castShadow><boxGeometry args={[0.75, 1.05, 0.45]} /><meshStandardMaterial color="#222" /></mesh>
            <mesh position={[0, 2.2, -0.15]}><sphereGeometry args={[0.28, 8, 8]} /><meshStandardMaterial color="#222" /></mesh>
            <mesh position={[0.45, 1.75, 0]} castShadow rotation={[0,0,-0.1]}><capsuleGeometry args={[0.14, 0.65, 4, 8]} /><meshStandardMaterial color="#222" /></mesh>
            <mesh position={[-0.45, 1.75, 0]} castShadow rotation={[0,0,0.1]}><capsuleGeometry args={[0.14, 0.65, 4, 8]} /><meshStandardMaterial color="#222" /></mesh>
            <mesh position={[0, 2.45, 0.05]} castShadow><sphereGeometry args={[0.22, 16, 16]} /><meshStandardMaterial color="#d4a373" /></mesh>
          </group>
        )}
        <mesh ref={trailMesh} position={[0, 1.2, 3.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.0, 12, 16]} />
          <meshStandardMaterial transparent opacity={0.3} emissive="#00f3ff" emissiveIntensity={15} />
        </mesh>
      </group>
      <mesh ref={jumpEffectRef} rotation={[-Math.PI/2, 0, 0]} visible={false}>
        <ringGeometry args={[1.5, 2.6, 32]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={25} transparent opacity={1} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

export default Player;
