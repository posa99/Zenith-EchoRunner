
export enum MovementState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SPRINTING = 'SPRINTING',
  JUMPING = 'JUMPING',
  FALLING = 'FALLING',
  WALL_RUNNING_LEFT = 'WALL_RUNNING_LEFT',
  WALL_RUNNING_RIGHT = 'WALL_RUNNING_RIGHT',
  SLIDING = 'SLIDING',
  VAULTING = 'VAULTING',
  LEDGE_GRAB = 'LEDGE_GRAB'
}

export enum GameDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum GameTheme {
  CITY = 'CITY',
  FOREST = 'FOREST',
  DESERT = 'DESERT',
  VOLCANO = 'VOLCANO',
  OCEAN = 'OCEAN',
  SNOW = 'SNOW',
  MOUNTAIN = 'MOUNTAIN'
}

export enum CharacterStyle {
  SILHOUETTE = 'SILHOUETTE',
  REALISTIC = 'REALISTIC'
}

export enum CameraPOV {
  FIRST_PERSON = 'FIRST_PERSON',
  THIRD_PERSON = 'THIRD_PERSON'
}

export interface GameSettings {
  fov: number;
  sensitivity: number;
  mobileControls: boolean;
  difficulty: GameDifficulty;
  theme: GameTheme;
  characterStyle: CharacterStyle;
  pov: CameraPOV;
}

export interface PlayerStats {
  speed: number;
  time: number;
  checkpoints: number;
  score: number;
  combo: number;
  superJumpReady: boolean;
  superJumpCooldown: number;
  stage: number;
}

export interface Vector3Obj {
  x: number;
  y: number;
  z: number;
}
