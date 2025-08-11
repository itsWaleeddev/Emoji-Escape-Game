import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Obstacle } from '@/types/game';

interface Props {
  obstacle: Obstacle;
}

export const ObstacleComponent: React.FC<Props> = ({ obstacle }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: obstacle.position.x - obstacle.size.width / 2 },
        { translateY: obstacle.position.y - obstacle.size.height / 2 },
      ],
    };
  });

  const getObstacleStyle = () => {
    switch (obstacle.type) {
      case 'spike':
        return styles.spike;
      case 'block':
        return styles.block;
      case 'ball':
        return styles.ball;
      case 'zigzag':
        return styles.zigzag;
      default:
        return styles.block;
    }
  };

  return (
    <Animated.View
      style={[
        styles.obstacle,
        getObstacleStyle(),
        animatedStyle,
        {
          width: obstacle.size.width,
          height: obstacle.size.height,
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  obstacle: {
    position: 'absolute',
  },
  // spike: {
  //   backgroundColor: '#EF4444',
  //   clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  //   borderRadius: 0,
  // },
  spike: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#EF4444',
  },
  block: {
    backgroundColor: '#6B7280',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  ball: {
    backgroundColor: '#8B5CF6',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  zigzag: {
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    transform: [{ rotateZ: '45deg' }],
  },
});