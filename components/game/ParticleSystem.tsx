import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  type: 'coin' | 'powerup';
}

interface Props {
  particles: Particle[];
}

export const ParticleSystem: React.FC<Props> = ({ particles }) => {
  return (
    <View style={styles.container}>
      {particles.map((particle) => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

const ParticleComponent: React.FC<{ particle: Particle }> = ({ particle }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const duration = particle.type === 'coin' ? 800 : 1000;
    
    return {
      transform: [
        { translateX: particle.x - 10 },
        { translateY: withTiming(particle.y - 50, { duration }) },
        { scale: withSpring(0, { duration: duration * 0.8 }) },
      ],
      opacity: withTiming(0, { 
        duration,
        easing: Easing.out(Easing.quad) 
      }),
    };
  });

  return (
    <Animated.View 
      style={[
        styles.particle, 
        { backgroundColor: particle.color },
        animatedStyle
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});