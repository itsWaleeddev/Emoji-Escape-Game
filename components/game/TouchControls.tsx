import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  onJump: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  disabled?: boolean;
}

export const TouchControls: React.FC<Props> = ({
  onJump,
  onMoveLeft,
  onMoveRight,
  disabled = false,
}) => {
  const jumpScale = useSharedValue(1);
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);

  const jumpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: jumpScale.value }],
  }));

  const leftAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
  }));

  const handleJumpPress = () => {
    if (disabled) return;
    jumpScale.value = withSpring(0.9, { duration: 100 }, () => {
      jumpScale.value = withSpring(1);
    });
    onJump();
  };

  const handleLeftPress = () => {
    if (disabled) return;
    leftScale.value = withSpring(0.9, { duration: 100 }, () => {
      leftScale.value = withSpring(1);
    });
    onMoveLeft();
  };

  const handleRightPress = () => {
    if (disabled) return;
    rightScale.value = withSpring(0.9, { duration: 100 }, () => {
      rightScale.value = withSpring(1);
    });
    onMoveRight();
  };

  return (
    <View style={styles.container}>
      {/* Left Lane Button */}
      <Animated.View style={leftAnimatedStyle}>
        <Pressable
          style={[styles.laneButton, styles.leftButton]}
          onPress={handleLeftPress}
          disabled={disabled}
        >
          <ChevronLeft size={32} color="#FFFFFF" />
          <Text style={styles.buttonLabel}>LEFT</Text>
        </Pressable>
      </Animated.View>

      {/* Jump Button - Center */}
      <Animated.View style={jumpAnimatedStyle}>
        <Pressable
          style={[styles.jumpButton]}
          onPress={handleJumpPress}
          disabled={disabled}
        >
          <ChevronUp size={36} color="#FFFFFF" />
          <Text style={styles.jumpText}>JUMP</Text>
        </Pressable>
      </Animated.View>

      {/* Right Lane Button */}
      <Animated.View style={rightAnimatedStyle}>
        <Pressable
          style={[styles.laneButton, styles.rightButton]}
          onPress={handleRightPress}
          disabled={disabled}
        >
          <ChevronRight size={32} color="#FFFFFF" />
          <Text style={styles.buttonLabel}>RIGHT</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 50,
  },
  laneButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leftButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  rightButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  jumpButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  jumpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});