import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Pause } from 'lucide-react-native';
import { ActivePowerUp } from '@/types/game';
import { POWER_UP_CONFIGS } from '@/constants/game';

interface Props {
  score: number;
  coins: number;
  lives: number;
  level: number;
  activePowerUps: ActivePowerUp[];
  onPause: () => void;
}

export const HUD: React.FC<Props> = ({ 
  score, 
  coins, 
  lives, 
  level, 
  activePowerUps, 
  onPause 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>

        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Level {level}</Text>
        </View>

        <View style={styles.coinsContainer}>
          <Text style={styles.coinsLabel}>Coins</Text>
          <Text style={styles.coinsValue}>{coins}</Text>
        </View>

        <Pressable style={styles.pauseButton} onPress={onPause}>
          <Pause size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.livesContainer}>
        {Array.from({ length: 3 }, (_, i) => (
          <View 
            key={i} 
            style={[
              styles.lifeHeart,
              { opacity: i < lives ? 1 : 0.3 }
            ]}
          >
            <Text style={styles.heartEmoji}>❤️</Text>
          </View>
        ))}
      </View>

      {activePowerUps.length > 0 && (
        <View style={styles.powerUpsContainer}>
          {activePowerUps.map((powerUp, index) => (
            <View 
              key={index} 
              style={[
                styles.powerUpIndicator,
                { backgroundColor: POWER_UP_CONFIGS[powerUp.type].color }
              ]}
            >
              <Text style={styles.powerUpText}>
                {Math.ceil(powerUp.timeLeft / 1000)}s
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinsContainer: {
    alignItems: 'flex-end',
  },
  coinsLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  coinsValue: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 25,
  },
  livesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  lifeHeart: {
    marginHorizontal: 5,
  },
  heartEmoji: {
    fontSize: 20,
  },
  powerUpsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  powerUpIndicator: {
    marginHorizontal: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  powerUpText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});