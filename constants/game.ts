import { PlayerSkin, Challenge } from '@/types/game';

export const GAME_CONFIG = {
  LANES: 3,
  LANE_WIDTH: 100,
  GROUND_HEIGHT: 200,
  JUMP_FORCE: -15,
  GRAVITY: 0.8,
  BASE_SPEED: 3,
  SPEED_INCREASE_PER_LEVEL: 0.3,
  POINTS_PER_LEVEL: 500,
  MAX_LIVES: 3,
  OBSTACLE_SPAWN_DISTANCE: 200,
  POWERUP_SPAWN_CHANCE: 0.008,
  COIN_SPAWN_CHANCE: 0.015,
};

export const DIFFICULTY_MULTIPLIERS = {
  easy: { speed: 0.8, obstacles: 0.8, powerups: 1.3 },
  medium: { speed: 1.0, obstacles: 1.0, powerups: 1.0 },
  hard: { speed: 1.3, obstacles: 1.4, powerups: 0.8 },
  extreme: { speed: 1.6, obstacles: 1.8, powerups: 0.6 },
};

export const PLAYER_SKINS: PlayerSkin[] = [
  { id: '1', emoji: '😀', name: 'Happy', price: 0, unlocked: true },
  { id: '2', emoji: '😎', name: 'Cool', price: 100, unlocked: false },
  { id: '3', emoji: '🤖', name: 'Robot', price: 200, unlocked: false },
  { id: '4', emoji: '🐱', name: 'Cat', price: 300, unlocked: false },
  { id: '5', emoji: '🐼', name: 'Panda', price: 400, unlocked: false },
  { id: '6', emoji: '🐸', name: 'Frog', price: 500, unlocked: false },
];

export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Survival Master',
    description: 'Survive 1000 points without hitting obstacles',
    target: 1000,
    current: 0,
    reward: 50,
    completed: false,
    type: 'score',
  },
  {
    id: '2',
    title: 'Coin Collector',
    description: 'Collect 50 coins in one run',
    target: 50,
    current: 0,
    reward: 75,
    completed: false,
    type: 'coins',
  },
  {
    id: '3',
    title: 'Obstacle Dodger',
    description: 'Avoid 100 obstacles in total',
    target: 100,
    current: 0,
    reward: 100,
    completed: false,
    type: 'obstacles',
  },
];

export const POWER_UP_CONFIGS = {
  shield: { duration: 5000, color: '#3B82F6' },
  slowmotion: { duration: 3000, color: '#8B5CF6' },
  doublepoints: { duration: 10000, color: '#F59E0B' },
};

export const LEVEL_BACKGROUNDS = [
  { from: '#FF6B6B', to: '#4ECDC4' }, // Level 1-2
  { from: '#A8E6CF', to: '#88D8A3' }, // Level 3-4
  { from: '#FFD93D', to: '#FF8C42' }, // Level 5-6
  { from: '#6C5CE7', to: '#A29BFE' }, // Level 7-8
  { from: '#FD79A8', to: '#FDCB6E' }, // Level 9-10
  { from: '#00B894', to: '#00CEC9' }, // Level 11+
];