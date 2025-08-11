import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { Player, GameState, ActivePowerUp } from '@/types/game';
import { GameEngine } from '@/utils/gameEngine';
import { StorageManager } from '@/utils/storage';
import { GAME_CONFIG, DIFFICULTY_MULTIPLIERS, LEVEL_BACKGROUNDS, POWER_UP_CONFIGS } from '@/constants/game';
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
  const gameEngine = useRef(new GameEngine(difficulty)).current;
  const difficultyConfig = DIFFICULTY_MULTIPLIERS[difficulty] ?? DIFFICULTY_MULTIPLIERS.easy;
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    controlMode: 'swipe' as 'swipe' | 'tilt',
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
      y: SCREEN_HEIGHT - GAME_CONFIG.GROUND_HEIGHT
    },
    lane: 1,
    isJumping: false,
    velocity: { x: 0, y: 0 },
  });

  const [lastScore, setLastScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [particles, setParticles] = useState<any[]>([]);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundY = useSharedValue(0);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const [best, coins, gameSettings] = await Promise.all([
        StorageManager.getBestScore(),
        StorageManager.getTotalCoins(),
        StorageManager.getSettings(),
      ]);
      setBestScore(best);
      setTotalCoins(coins);
      setSettings(gameSettings);
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

  // Game loop
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
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, updateGame]);

  const updateGame = useCallback(() => {
    const deltaTime = 16;

    // Update player
    setPlayer(prev => gameEngine.updatePlayer(prev, deltaTime));

    // Update game state
    setGameState(prev => {
      const newState = { ...prev };

      // Increase score
      newState.score += 1;
      newState.streak += 1;

      // Level progression
      const newLevel = Math.floor(newState.score / GAME_CONFIG.POINTS_PER_LEVEL) + 1;
      if (newLevel > newState.level) {
        newState.level = newLevel;
        newState.speed = (GAME_CONFIG.BASE_SPEED + (newLevel - 1) * GAME_CONFIG.SPEED_INCREASE_PER_LEVEL) * difficultyConfig.speed;
      }

      return newState;
    });

    // Spawn and update game objects
    gameEngine.spawnObstacles(gameState);
    gameEngine.spawnCollectibles(gameState);
    gameEngine.updateObstacles(gameState, deltaTime);
    gameEngine.updateCollectibles(gameState, deltaTime);
    gameEngine.updateActivePowerUps(deltaTime);

    // Check collisions
    const collisions = gameEngine.checkCollisions(player);

    if (collisions.hitObstacle && !gameEngine.hasActivePowerUp('shield')) {
      handleObstacleHit();
    }

    if (collisions.collectedPowerUps.length > 0) {
      collisions.collectedPowerUps.forEach(powerUp => {
        handlePowerUpCollection(powerUp.type);
      });
    }

    if (collisions.collectedCoins.length > 0) {
      handleCoinCollection(collisions.collectedCoins.length);
    }

    // Update background scroll
    runOnJS(() => {
      backgroundY.value = (backgroundY.value + gameState.speed) % SCREEN_HEIGHT;
    })();
  }, [player, gameState, gameEngine, difficultyConfig, backgroundY]);

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

  const handlePowerUpCollection = useCallback((type: 'shield' | 'slowmotion' | 'doublepoints') => {
    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    gameEngine.activatePowerUp(type);

    // Add particle effect
    const newParticle = {
      id: Date.now(),
      x: player.position.x,
      y: player.position.y,
      color: POWER_UP_CONFIGS[type].color,
      type: 'powerup',
    };
    setParticles(prev => [...prev, newParticle]);

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  }, [player.position, gameEngine, settings.vibrationEnabled]);

  const handleCoinCollection = useCallback((count: number) => {
    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const points = gameEngine.hasActivePowerUp('doublepoints') ? count * 2 : count;

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
  }, [player.position, gameEngine, settings.vibrationEnabled]);

  const handleMovement = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.isPaused || gameState.isGameOver) return;

    setPlayer(prev => {
      switch (direction) {
        case 'up':
          return gameEngine.jump(prev);
        case 'left':
          return gameEngine.changeLane(prev, 'left');
        case 'right':
          return gameEngine.changeLane(prev, 'right');
        case 'down':
          // Quick drop - increase fall speed if jumping
          if (prev.isJumping) {
            return { ...prev, velocity: { ...prev.velocity, y: prev.velocity.y + 5 } };
          }
          return prev;
        default:
          return prev;
      }
    });
  }, [gameState.isPaused, gameState.isGameOver, gameEngine]);

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (settings.controlMode !== 'swipe') return;
      
      const { translationX, translationY, velocityX, velocityY } = event;
      const minSwipeDistance = 30;
      const minSwipeVelocity = 300;

      if (Math.abs(translationX) > Math.abs(translationY) && Math.abs(translationX) > minSwipeDistance) {
        if (Math.abs(velocityX) > minSwipeVelocity) {
          handleMovement(translationX > 0 ? 'right' : 'left');
        }
      } else if (Math.abs(translationY) > minSwipeDistance) {
        if (Math.abs(velocityY) > minSwipeVelocity) {
          handleMovement(translationY < 0 ? 'up' : 'down');
        }
      }
    });

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const restartGame = useCallback(async () => {
    gameEngine.reset();

    // Save game data
    if (gameState.score > bestScore) {
      setBestScore(gameState.score);
      await StorageManager.setBestScore(gameState.score);
    }

    setLastScore(gameState.score);
    const newTotalCoins = totalCoins + gameState.coins;
    setTotalCoins(newTotalCoins);
    await StorageManager.setTotalCoins(newTotalCoins);

    // Reset game state
    gameEngine.reset();
    setGameState({
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

    setPlayer({
      id: 'player',
      emoji: selectedSkin,
      position: {
        x: SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT - GAME_CONFIG.GROUND_HEIGHT
      },
      lane: 1,
      isJumping: false,
      velocity: { x: 0, y: 0 },
    });

    setParticles([]);
    backgroundY.value = 0;
  }, [gameState, bestScore, totalCoins, gameEngine, difficultyConfig, selectedSkin, backgroundY]);

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
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={swipeGesture}>
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
            activePowerUps={gameEngine.getActivePowerUps()}
            onPause={pauseGame}
          />

          <PlayerEmoji
            player={player}
            isShielded={gameEngine.hasActivePowerUp('shield')}
          />

          {gameEngine.getObstacles().map(obstacle => (
            <ObstacleComponent key={obstacle.id} obstacle={obstacle} />
          ))}

          {gameEngine.getPowerUps().map(powerUp => (
            <PowerUpComponent key={powerUp.id} powerUp={powerUp} />
          ))}

          {gameEngine.getCoins().map(coin => (
            <CoinComponent key={coin.id} coin={coin} />
          ))}

          <ParticleSystem particles={particles} />

          {gameState.isPaused && (
            <PauseMenu
              onResume={resumeGame}
              onRestart={restartGame}
              onHome={onNavigateToMenu}
            />
          )}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
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