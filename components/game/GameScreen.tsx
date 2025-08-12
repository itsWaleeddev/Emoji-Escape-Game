import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { TouchControls } from './TouchControls';
import { Player, GameState, Obstacle, PowerUp, Coin } from '@/types/game';
import { StorageManager } from '@/utils/storage';
import { GAME_CONFIG, DIFFICULTY_MULTIPLIERS, LEVEL_BACKGROUNDS, PLAYER_SKINS } from '@/constants/game';
import { PlayerEmoji } from './PlayerEmoji';
import { ObstacleComponent } from './ObstacleComponent';
import { PowerUpComponent } from './PowerUpComponent';
import { CoinComponent } from './CoinComponent';
import { ParticleSystem } from './ParticleSystem';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { GameOverScreen } from './GameOverScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  onNavigateToMenu: () => void;
  onNavigateToShop: () => void;
  selectedSkin: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export const GameScreen: React.FC<Props> = ({
  onNavigateToMenu,
  onNavigateToShop,
  selectedSkin,
  difficulty
}) => {
  const difficultyConfig = DIFFICULTY_MULTIPLIERS[difficulty];
  
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    controlMode: 'touch' as 'touch' | 'tilt',
    difficulty: difficulty,
  });
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: true,
    isPaused: false,
    isGameOver: false,
    score: 0,
    coins: 0,
    lives: GAME_CONFIG.MAX_LIVES,
    level: 1,
    speed: GAME_CONFIG.BASE_SPEED * difficultyConfig.speed,
    streak: 0,
  });

  const [player, setPlayer] = useState<Player>({
    id: 'player',
    emoji: selectedSkin,
    position: {
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT - 150
    },
    lane: 1,
    isJumping: false,
    velocity: { x: 0, y: 0 },
  });

  // Game objects
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);

  // Game state
  const [bestScore, setBestScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [lastObstacleSpawn, setLastObstacleSpawn] = useState(0);
  const [gameTime, setGameTime] = useState(0);

  const backgroundY = useSharedValue(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const [best, coins, gameSettings, savedLevel] = await Promise.all([
        StorageManager.getBestScore(),
        StorageManager.getTotalCoins(),
        StorageManager.getSettings(),
        StorageManager.getCurrentLevel(),
      ]);
      setBestScore(best);
      setTotalCoins(coins);
      setSettings(gameSettings);
      
      // Start from saved level
      setGameState(prev => ({
        ...prev,
        level: savedLevel,
        speed: (GAME_CONFIG.BASE_SPEED + (savedLevel - 1) * GAME_CONFIG.SPEED_INCREASE_PER_LEVEL) * difficultyConfig.speed,
      }));
    };
    loadInitialData();
  }, []);

  // Setup accelerometer for tilt controls
  useEffect(() => {
    let subscription: any;
    
    if (settings.controlMode === 'tilt') {
      Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(accelerometerData => {
        setAccelerometerData(accelerometerData);
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [settings.controlMode]);

  // Handle tilt controls
  useEffect(() => {
    if (settings.controlMode === 'tilt' && !gameState.isPaused && !gameState.isGameOver) {
      const tiltThreshold = 0.3;
      
      if (accelerometerData.x > tiltThreshold) {
        handleMovement('right');
      } else if (accelerometerData.x < -tiltThreshold) {
        handleMovement('left');
      }
    }
  }, [accelerometerData, settings.controlMode, gameState.isPaused, gameState.isGameOver]);

  // Main game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      gameLoopRef.current = setInterval(() => {
        updateGame();
      }, 16); // ~60 FPS

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver]);

  const updateGame = useCallback(() => {
    const deltaTime = 16;
    
    setGameTime(prev => prev + deltaTime);

    // Update player physics
    setPlayer(prev => {
      const newPlayer = { ...prev };

      // Apply gravity when jumping
      if (newPlayer.isJumping) {
        newPlayer.velocity.y += GAME_CONFIG.GRAVITY;
        newPlayer.position.y += newPlayer.velocity.y;

        // Land when reaching ground
        if (newPlayer.position.y >= SCREEN_HEIGHT - 150) {
          newPlayer.position.y = SCREEN_HEIGHT - 150;
          newPlayer.isJumping = false;
          newPlayer.velocity.y = 0;
        }
      }

      // Smooth lane movement
      const laneWidth = SCREEN_WIDTH / GAME_CONFIG.LANES;
      const targetX = laneWidth * newPlayer.lane + laneWidth / 2;
      const diff = targetX - newPlayer.position.x;
      newPlayer.position.x += diff * 0.15;

      return newPlayer;
    });

    // Update game state
    setGameState(prev => {
      const newState = { ...prev };
      newState.score += 1;
      newState.streak += 1;

      // Level progression
      const newLevel = Math.floor(newState.score / GAME_CONFIG.POINTS_PER_LEVEL) + 1;
      const actualNewLevel = Math.max(newLevel, gameState.level); // Don't go below saved level
      if (actualNewLevel > newState.level) {
        newState.level = actualNewLevel;
        newState.speed = (GAME_CONFIG.BASE_SPEED + (actualNewLevel - 1) * GAME_CONFIG.SPEED_INCREASE_PER_LEVEL) * difficultyConfig.speed;
        
        // Save current level
        StorageManager.setCurrentLevel(actualNewLevel);
      }

      return newState;
    });

    // Spawn obstacles
    setLastObstacleSpawn(prev => {
      const timeSinceLastSpawn = gameTime - prev;
      const spawnInterval = 1000 / (difficultyConfig.obstacles * (1 + gameState.level * 0.1));
      
      if (timeSinceLastSpawn > spawnInterval) {
        const obstacleTypes: Obstacle['type'][] = ['spike', 'block'];
        if (gameState.level >= 3) obstacleTypes.push('ball');
        if (gameState.level >= 5) obstacleTypes.push('zigzag');

        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const lane = Math.floor(Math.random() * GAME_CONFIG.LANES);
        const laneWidth = SCREEN_WIDTH / GAME_CONFIG.LANES;

        const newObstacle: Obstacle = {
          id: `obstacle_${Date.now()}_${Math.random()}`,
          type,
          position: {
            x: laneWidth * lane + laneWidth / 2,
            y: -50,
          },
          size: { width: 40, height: 40 },
          speed: gameState.speed,
          lane,
        };

        setObstacles(prev => [...prev, newObstacle]);
        return gameTime;
      }
      return prev;
    });

    // Spawn power-ups
    if (Math.random() < GAME_CONFIG.POWERUP_SPAWN_CHANCE * difficultyConfig.powerups) {
      const types: PowerUp['type'][] = ['shield', 'slowmotion', 'doublepoints'];
      const type = types[Math.floor(Math.random() * types.length)];
      const lane = Math.floor(Math.random() * GAME_CONFIG.LANES);
      const laneWidth = SCREEN_WIDTH / GAME_CONFIG.LANES;

      const newPowerUp: PowerUp = {
        id: `powerup_${Date.now()}_${Math.random()}`,
        type,
        position: {
          x: laneWidth * lane + laneWidth / 2,
          y: -30,
        },
        collected: false,
      };

      setPowerUps(prev => [...prev, newPowerUp]);
    }

    // Spawn coins
    if (Math.random() < GAME_CONFIG.COIN_SPAWN_CHANCE) {
      const lane = Math.floor(Math.random() * GAME_CONFIG.LANES);
      const laneWidth = SCREEN_WIDTH / GAME_CONFIG.LANES;

      const newCoin: Coin = {
        id: `coin_${Date.now()}_${Math.random()}`,
        position: {
          x: laneWidth * lane + laneWidth / 2,
          y: -20,
        },
        collected: false,
      };

      setCoins(prev => [...prev, newCoin]);
    }

    // Update obstacles
    setObstacles(prev => prev.map(obstacle => ({
      ...obstacle,
      position: { ...obstacle.position, y: obstacle.position.y + gameState.speed }
    })).filter(obstacle => obstacle.position.y < SCREEN_HEIGHT + 100));

    // Update power-ups
    setPowerUps(prev => prev.map(powerUp => ({
      ...powerUp,
      position: { ...powerUp.position, y: powerUp.position.y + gameState.speed }
    })).filter(powerUp => powerUp.position.y < SCREEN_HEIGHT + 100 && !powerUp.collected));

    // Update coins
    setCoins(prev => prev.map(coin => ({
      ...coin,
      position: { ...coin.position, y: coin.position.y + gameState.speed }
    })).filter(coin => coin.position.y < SCREEN_HEIGHT + 100 && !coin.collected));

    // Update active power-ups
    setActivePowerUps(prev => prev.map(powerUp => ({
      ...powerUp,
      timeLeft: powerUp.timeLeft - deltaTime
    })).filter(powerUp => powerUp.timeLeft > 0));

    // Check collisions
    checkCollisions();

    // Update background scroll
    runOnJS(() => {
      backgroundY.value = (backgroundY.value + gameState.speed) % SCREEN_HEIGHT;
    })();
  }, [gameState, gameTime, difficultyConfig, backgroundY]);

  const checkCollisions = useCallback(() => {
    const playerBounds = {
      x: player.position.x - 20,
      y: player.position.y - 20,
      width: 40,
      height: 40,
    };

    // Check obstacle collisions
    let hitObstacle = false;
    
    for (const obstacle of obstacles) {
      const obstacleBounds = {
        x: obstacle.position.x - obstacle.size.width / 2,
        y: obstacle.position.y - obstacle.size.height / 2,
        width: obstacle.size.width,
        height: obstacle.size.height,
      };

      if (isColliding(playerBounds, obstacleBounds)) {
        hitObstacle = true;
        break;
      }
    }

    if (hitObstacle && !activePowerUps.some(p => p.type === 'shield')) {
      handleObstacleHit();
    }

    // Check power-up collections
    powerUps.forEach(powerUp => {
      const powerUpBounds = {
        x: powerUp.position.x - 15,
        y: powerUp.position.y - 15,
        width: 30,
        height: 30,
      };

      if (isColliding(playerBounds, powerUpBounds) && !powerUp.collected) {
        handlePowerUpCollection(powerUp);
      }
    });

    // Check coin collections
    coins.forEach(coin => {
      const coinBounds = {
        x: coin.position.x - 10,
        y: coin.position.y - 10,
        width: 20,
        height: 20,
      };

      if (isColliding(playerBounds, coinBounds) && !coin.collected) {
        handleCoinCollection(coin);
      }
    });
  }, [player, obstacles, powerUps, coins, activePowerUps]);

  const isColliding = (rect1: any, rect2: any): boolean => {
    // Add small tolerance to make collision detection more forgiving
    const tolerance = 5;
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y;
  };

  const handleObstacleHit = useCallback(() => {
    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setGameState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        return { ...prev, lives: 0, isGameOver: true };
      }
      return { ...prev, lives: newLives, streak: 0 };
    });
  }, [settings.vibrationEnabled]);

  const handlePowerUpCollection = useCallback((powerUp: PowerUp) => {
    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Mark as collected
    setPowerUps(prev => prev.map(p => 
      p.id === powerUp.id ? { ...p, collected: true } : p
    ));

    // Activate power-up
    const durations = {
      shield: 5000,
      slowmotion: 3000,
      doublepoints: 10000,
    };

    setActivePowerUps(prev => [
      ...prev.filter(p => p.type !== powerUp.type),
      {
        type: powerUp.type,
        timeLeft: durations[powerUp.type],
        duration: durations[powerUp.type],
      }
    ]);

    // Add particle effect
    const newParticle = {
      id: Date.now(),
      x: player.position.x,
      y: player.position.y,
      color: '#F59E0B',
      type: 'powerup',
    };
    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  }, [player.position, settings.vibrationEnabled]);

  const handleCoinCollection = useCallback((coin: Coin) => {
    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Mark as collected
    setCoins(prev => prev.map(c => 
      c.id === coin.id ? { ...c, collected: true } : c
    ));

    const points = activePowerUps.some(p => p.type === 'doublepoints') ? 2 : 1;

    setGameState(prev => ({
      ...prev,
      coins: prev.coins + points,
    }));

    // Add particle effect
    const newParticle = {
      id: Date.now(),
      x: player.position.x,
      y: player.position.y,
      color: '#FFD700',
      type: 'coin',
    };
    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 800);
  }, [player.position, activePowerUps, settings.vibrationEnabled]);

  const handleMovement = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.isPaused || gameState.isGameOver) return;

    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setPlayer(prev => {
      const newPlayer = { ...prev };
      
      switch (direction) {
        case 'up':
          if (!newPlayer.isJumping) {
            newPlayer.isJumping = true;
            newPlayer.velocity.y = GAME_CONFIG.JUMP_FORCE;
          }
          break;
        case 'left':
          newPlayer.lane = Math.max(0, newPlayer.lane - 1);
          break;
        case 'right':
          newPlayer.lane = Math.min(GAME_CONFIG.LANES - 1, newPlayer.lane + 1);
          break;
        case 'down':
          if (newPlayer.isJumping) {
            newPlayer.velocity.y += 5;
          }
          break;
      }
      
      return newPlayer;
    });
  }, [gameState.isPaused, gameState.isGameOver, settings.vibrationEnabled]);

  const handleJump = useCallback(() => {
    handleMovement('up');
  }, [handleMovement]);

  const handleMoveLeft = useCallback(() => {
    handleMovement('left');
  }, [handleMovement]);

  const handleMoveRight = useCallback(() => {
    handleMovement('right');
  }, [handleMovement]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const restartGame = useCallback(async () => {
    // Save game data
    if (gameState.score > bestScore) {
      setBestScore(gameState.score);
      await StorageManager.setBestScore(gameState.score);
    }

    const newTotalCoins = totalCoins + gameState.coins;
    setTotalCoins(newTotalCoins);
    await StorageManager.setTotalCoins(newTotalCoins);

    // Get current saved level to restart from
    const savedLevel = await StorageManager.getCurrentLevel();

    // Reset game state
    setGameState({
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      score: 0,
      coins: 0,
      lives: GAME_CONFIG.MAX_LIVES,
      level: savedLevel,
      speed: (GAME_CONFIG.BASE_SPEED + (savedLevel - 1) * GAME_CONFIG.SPEED_INCREASE_PER_LEVEL) * difficultyConfig.speed,
      streak: 0,
    });

    setPlayer({
      id: 'player',
      emoji: selectedSkin,
      position: {
        x: SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT - 150
      },
      lane: 1,
      isJumping: false,
      velocity: { x: 0, y: 0 },
    });

    // Clear game objects
    setObstacles([]);
    setPowerUps([]);
    setCoins([]);
    setActivePowerUps([]);
    setParticles([]);
    setGameTime(0);
    setLastObstacleSpawn(0);
    backgroundY.value = 0;
  }, [gameState, bestScore, totalCoins, difficultyConfig, selectedSkin, backgroundY]);

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: backgroundY.value }],
    };
  });

  const currentBackground = LEVEL_BACKGROUNDS[
    Math.min(Math.floor((gameState.level - 1) / 2), LEVEL_BACKGROUNDS.length - 1)
  ];

  if (gameState.isGameOver) {
    return (
      <GameOverScreen
        finalScore={gameState.score}
        bestScore={bestScore}
        coinsEarned={gameState.coins}
        onRestart={restartGame}
        onHome={onNavigateToMenu}
        onShop={onNavigateToShop}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
          <LinearGradient
            colors={[currentBackground.from, currentBackground.to]}
            style={StyleSheet.absoluteFillObject}
          />

          <Animated.View style={[styles.backgroundPattern, backgroundStyle]} />

          <HUD
            score={gameState.score}
            coins={gameState.coins}
            lives={gameState.lives}
            level={gameState.level}
            activePowerUps={activePowerUps}
            onPause={pauseGame}
          />

          <PlayerEmoji
            player={player}
            isShielded={activePowerUps.some(p => p.type === 'shield')}
          />

          {obstacles.map(obstacle => (
            <ObstacleComponent key={obstacle.id} obstacle={obstacle} />
          ))}

          {powerUps.filter(p => !p.collected).map(powerUp => (
            <PowerUpComponent key={powerUp.id} powerUp={powerUp} />
          ))}

          {coins.filter(c => !c.collected).map(coin => (
            <CoinComponent key={coin.id} coin={coin} />
          ))}

          <ParticleSystem particles={particles} />

          <TouchControls
            onJump={handleJump}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            disabled={gameState.isPaused || gameState.isGameOver}
          />

          {gameState.isPaused && (
            <PauseMenu
              onResume={resumeGame}
              onRestart={restartGame}
              onHome={onNavigateToMenu}
            />
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 2,
    opacity: 0.1,
  },
});