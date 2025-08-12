import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
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
      {/* Lane Control Buttons */}
      <View style={styles.laneControls}>
        <Animated.View style={leftAnimatedStyle}>
          <Pressable
            style={[styles.laneButton, styles.leftButton]}
            onPress={handleLeftPress}
            disabled={disabled}
          >
            <ChevronLeft size={32} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        <Animated.View style={rightAnimatedStyle}>
          <Pressable
            style={[styles.laneButton, styles.rightButton]}
            onPress={handleRightPress}
            disabled={disabled}
          >
            <ChevronRight size={32} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>

      {/* Jump Button */}
      <Animated.View style={[styles.jumpButtonContainer, jumpAnimatedStyle]}>
        <Pressable
          style={styles.jumpButton}
          onPress={handleJumpPress}
          disabled={disabled}
        >
          <ChevronUp size={36} color="#FFFFFF" />
          <Text style={styles.jumpText}>JUMP</Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    zIndex: 50,
  },
  laneControls: {
    flexDirection: 'row',
    gap: 20,
  },
  laneButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
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
  jumpButtonContainer: {
    alignItems: 'center',
  },
  jumpButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
  jumpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});