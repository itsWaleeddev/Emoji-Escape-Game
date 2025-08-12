export interface Player {
  id: string;
  emoji: string;
  position: { x: number; y: number };
  lane: number;
  isJumping: boolean;
  velocity: { x: number; y: number };
}

export interface Obstacle {
  id: string;
  type: 'spike' | 'block' | 'ball' | 'zigzag';
  position: { x: number; y: number };
  size: { width: number; height: number };
  speed: number;
  lane?: number;
}

export interface PowerUp {
  id: string;
  type: 'shield' | 'slowmotion' | 'doublepoints';
  position: { x: number; y: number };
  collected: boolean;
}

export interface Coin {
  id: string;
  position: { x: number; y: number };
  collected: boolean;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  coins: number;
  lives: number;
  level: number;
  speed: number;
  streak: number;
}

export interface PlayerSkin {
  id: string;
  emoji: string;
  name: string;
  price: number;
  unlocked: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  type: 'score' | 'coins' | 'obstacles';
}

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  controlMode: 'touch' | 'tilt';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export interface ActivePowerUp {
  type: 'shield' | 'slowmotion' | 'doublepoints';
  timeLeft: number;
  duration: number;
}