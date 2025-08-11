import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Coin } from '@/types/game';

interface Props {
  coin: Coin;
}

export const CoinComponent: React.FC<Props> = ({ coin }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: coin.position.x - 15 },
        { translateY: coin.position.y - 15 },
        { 
          rotateY: withRepeat(
            withTiming('360deg', { duration: 1500 }),
            -1,
            false
          )
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.coin, animatedStyle]}>
      <Text style={styles.emoji}>🪙</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  emoji: {
    fontSize: 16,
  },
});