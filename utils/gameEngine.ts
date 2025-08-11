import { Dimensions } from 'react-native';
import { Player, Obstacle, PowerUp, Coin, GameState, ActivePowerUp } from '@/types/game';
import { GAME_CONFIG, DIFFICULTY_MULTIPLIERS } from '@/constants/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export class GameEngine {
  private obstacles: Obstacle[] = [];
  private powerUps: PowerUp[] = [];
  private coins: Coin[] = [];
  private activePowerUps: ActivePowerUp[] = [];
  private lastObstacleY = 0;
  private obstacleIdCounter = 0;

  constructor(private difficulty: 'easy' | 'medium' | 'hard' | 'extreme' = 'medium') { }

  updatePlayer(player: Player, deltaTime: number): Player {
    const newPlayer = { ...player };

    // Apply gravity when jumping
    if (newPlayer.isJumping) {
      newPlayer.velocity.y += GAME_CONFIG.GRAVITY;
      newPlayer.position.y += newPlayer.velocity.y;

      // Land when reaching ground
      if (newPlayer.position.y >= SCREEN_HEIGHT - GAME_CONFIG.GROUND_HEIGHT) {
        newPlayer.position.y = SCREEN_HEIGHT - GAME_CONFIG.GROUND_HEIGHT;
        newPlayer.isJumping = false;
        newPlayer.velocity.y = 0;
      }
    }

    // Keep player within lane bounds
    const targetX = (SCREEN_WIDTH / GAME_CONFIG.LANES) * newPlayer.lane +
      (SCREEN_WIDTH / GAME_CONFIG.LANES) / 2;
    const diff = targetX - newPlayer.position.x;
    newPlayer.position.x += diff * 0.15; // Smooth movement

    return newPlayer;
  }

  jump(player: Player): Player {
    if (!player.isJumping) {
      return {
        ...player,
        isJumping: true,
        velocity: { ...player.velocity, y: GAME_CONFIG.JUMP_FORCE },
      };
    }
    return player;
  }

  changeLane(player: Player, direction: 'left' | 'right'): Player {
    const newLane = direction === 'left'
      ? Math.max(0, player.lane - 1)
      : Math.min(GAME_CONFIG.LANES - 1, player.lane + 1);

    return { ...player, lane: newLane };
  }

  spawnObstacles(gameState: GameState): void {
    //const multiplier = DIFFICULTY_MULTIPLIERS[this.difficulty];
    const multiplier = DIFFICULTY_MULTIPLIERS[this.difficulty]
      ?? DIFFICULTY_MULTIPLIERS.medium;
    const spawnChance = 0.02 * multiplier.obstacles;

    if (Math.random() < spawnChance &&
      SCREEN_HEIGHT - this.lastObstacleY > GAME_CONFIG.OBSTACLE_SPAWN_DISTANCE) {

      const obstacleTypes: Obstacle['type'][] = ['spike', 'block'];
      if (gameState.level >= 3) obstacleTypes.push('ball');
      if (gameState.level >= 5) obstacleTypes.push('zigzag');

      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const lane = Math.floor(Math.random() * GAME_CONFIG.LANES);

      const newObstacle = {
        id: `obstacle_${this.obstacleIdCounter++}`,
        type,
        position: {
          x: (SCREEN_WIDTH / GAME_CONFIG.LANES) * lane + (SCREEN_WIDTH / GAME_CONFIG.LANES) / 2,
          y: -50,
        },
        size: { width: 40, height: 40 },
        speed: gameState.speed,
        lane,
      };
      // this.obstacles.push({
      //   id: `obstacle_${this.obstacleIdCounter++}`,
      //   type,
      //   position: {
      //     x: (SCREEN_WIDTH / GAME_CONFIG.LANES) * lane + (SCREEN_WIDTH / GAME_CONFIG.LANES) / 2,
      //     y: -50,
      //   },
      //   size: { width: 40, height: 40 },
      //   speed: gameState.speed,
      //   lane,
      // });
      this.obstacles.push(newObstacle);
      //this.lastObstacleY = -50;
      this.lastObstacleY = newObstacle.position.y;

    }
  }

  spawnCollectibles(gameState: GameState): void {
    //const multiplier = DIFFICULTY_MULTIPLIERS[this.difficulty];
    const multiplier = DIFFICULTY_MULTIPLIERS[this.difficulty]
      ?? DIFFICULTY_MULTIPLIERS.medium;
    // Spawn power-ups
    if (Math.random() < GAME_CONFIG.POWERUP_SPAWN_CHANCE * multiplier.powerups) {
      const types: PowerUp['type'][] = ['shield', 'slowmotion', 'doublepoints'];
      const type = types[Math.floor(Math.random() * types.length)];
      const lane = Math.floor(Math.random() * GAME_CONFIG.LANES);

      this.powerUps.push({
        id: `powerup_${Date.now()}`,
        type,
        position: {
          x: (SCREEN_WIDTH / GAME_CONFIG.LANES) * lane + (SCREEN_WIDTH / GAME_CONFIG.LANES) / 2,
          y: -30,
        },
        collected: false,
      });
    }

    // Spawn coins
    if (Math.random() < GAME_CONFIG.COIN_SPAWN_CHANCE) {
      const lane = Math.floor(Math.random() * GAME_CONFIG.LANES);

      this.coins.push({
        id: `coin_${Date.now()}`,
        position: {
          x: (SCREEN_WIDTH / GAME_CONFIG.LANES) * lane + (SCREEN_WIDTH / GAME_CONFIG.LANES) / 2,
          y: -20,
        },
        collected: false,
      });
    }
  }

  updateObstacles(gameState: GameState, deltaTime: number): void {
    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.position.y += obstacle.speed;
      return obstacle.position.y < SCREEN_HEIGHT + 100;
    });
  }

  updateCollectibles(gameState: GameState, deltaTime: number): void {
    // Update power-ups
    this.powerUps = this.powerUps.filter(powerUp => {
      if (!powerUp.collected) {
        powerUp.position.y += gameState.speed;
        return powerUp.position.y < SCREEN_HEIGHT + 100;
      }
      return false;
    });

    // Update coins
    this.coins = this.coins.filter(coin => {
      if (!coin.collected) {
        coin.position.y += gameState.speed;
        return coin.position.y < SCREEN_HEIGHT + 100;
      }
      return false;
    });
  }

  updateActivePowerUps(deltaTime: number): void {
    this.activePowerUps = this.activePowerUps.filter(powerUp => {
      powerUp.timeLeft -= deltaTime;
      return powerUp.timeLeft > 0;
    });
  }

  checkCollisions(player: Player): {
    hitObstacle: boolean;
    collectedPowerUps: PowerUp[];
    collectedCoins: Coin[];
  } {
    const playerBounds = {
      x: player.position.x - 20,
      y: player.position.y - 20,
      width: 40,
      height: 40,
    };

    // Check obstacle collisions
    const hitObstacle = this.obstacles.some(obstacle => {
      const obstacleBounds = {
        x: obstacle.position.x - obstacle.size.width / 2,
        y: obstacle.position.y - obstacle.size.height / 2,
        width: obstacle.size.width,
        height: obstacle.size.height,
      };

      return this.isColliding(playerBounds, obstacleBounds);
    });

    // Check power-up collections
    const collectedPowerUps = this.powerUps.filter(powerUp => {
      const powerUpBounds = {
        x: powerUp.position.x - 15,
        y: powerUp.position.y - 15,
        width: 30,
        height: 30,
      };

      if (this.isColliding(playerBounds, powerUpBounds)) {
        powerUp.collected = true;
        return true;
      }
      return false;
    });

    // Check coin collections
    const collectedCoins = this.coins.filter(coin => {
      const coinBounds = {
        x: coin.position.x - 10,
        y: coin.position.y - 10,
        width: 20,
        height: 20,
      };

      if (this.isColliding(playerBounds, coinBounds)) {
        coin.collected = true;
        return true;
      }
      return false;
    });

    return { hitObstacle, collectedPowerUps, collectedCoins };
  }

  private isColliding(rect1: any, rect2: any): boolean {
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y;
  }

  activatePowerUp(type: PowerUp['type']): void {
    // Remove existing power-up of same type
    this.activePowerUps = this.activePowerUps.filter(p => p.type !== type);

    // Add new power-up
    const durations = {
      shield: 5000,
      slowmotion: 3000,
      doublepoints: 10000,
    };

    this.activePowerUps.push({
      type,
      timeLeft: durations[type],
      duration: durations[type],
    });
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  getCoins(): Coin[] {
    return this.coins;
  }

  getActivePowerUps(): ActivePowerUp[] {
    return this.activePowerUps;
  }

  hasActivePowerUp(type: PowerUp['type']): boolean {
    return this.activePowerUps.some(p => p.type === type);
  }

  reset(): void {
    this.obstacles = [];
    this.powerUps = [];
    this.coins = [];
    this.activePowerUps = [];
    this.lastObstacleY = 0;
    this.obstacleIdCounter = 0;
  }
}