import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Player } from '@/types/game';
import { PLAYER_SKINS } from '@/constants/game';

interface Props {
  player: Player;
  isShielded: boolean;
}

export const PlayerEmoji: React.FC<Props> = ({ player, isShielded }) => {
  const playerSkin = PLAYER_SKINS.find(skin => skin.id === player.emoji);

  const animatedStyle = useAnimatedStyle(() => {
    const jumpScale = player.isJumping ? 1.2 : 1.0;
    const shieldScale = isShielded ? 1.3 : 1.0;

    return {
      transform: [
        { translateX: withSpring(player.position.x - 30) },
        { translateY: withSpring(player.position.y - 30) },
        { scale: withSpring(jumpScale * shieldScale) },
        { rotateZ: withSpring(player.isJumping ? '15deg' : '0deg') },
      ],
    };
  });

  const shieldStyle = useAnimatedStyle(() => {
    return {
      opacity: isShielded ? withSpring(0.7) : withSpring(0),
      transform: [
        { scale: isShielded ? withSpring(1.5) : withSpring(0) },
        { translateX: withSpring(player.position.x - 45) },
        { translateY: withSpring(player.position.y - 45) },
      ],
    };
  });

  return (
    <>
      {/* Shield effect */}
      <Animated.View style={[styles.shield, shieldStyle]} />

      {/* Player emoji */}
      <Animated.View style={[styles.player, animatedStyle]}>
        <Text style={styles.emoji}>
          {playerSkin?.emoji || '😀'}
        </Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  shield: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#60A5FA',
  },
});