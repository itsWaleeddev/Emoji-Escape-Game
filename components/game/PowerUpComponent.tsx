import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PowerUp } from '@/types/game';

interface Props {
  powerUp: PowerUp;
}

export const PowerUpComponent: React.FC<Props> = ({ powerUp }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: powerUp.position.x - 20 },
        { translateY: powerUp.position.y - 20 },
        { 
          scale: withRepeat(
            withTiming(1.2, { duration: 800 }),
            -1,
            true
          )
        },
        { 
          rotateZ: withRepeat(
            withTiming('360deg', { duration: 2000 }),
            -1,
            false
          )
        },
      ],
    };
  });

  const getPowerUpEmoji = () => {
    switch (powerUp.type) {
      case 'shield':
        return '🛡️';
      case 'slowmotion':
        return '🐌';
      case 'doublepoints':
        return '⭐';
      default:
        return '✨';
    }
  };

  return (
    <Animated.View style={[styles.powerUp, animatedStyle]}>
      <Text style={styles.emoji}>{getPowerUpEmoji()}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  powerUp: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  emoji: {
    fontSize: 20,
  },
});