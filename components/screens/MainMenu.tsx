import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ShoppingBag, Settings, Trophy, Gift } from 'lucide-react-native';
import { StorageManager } from '@/utils/storage';

interface Props {
  onStartGame: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
}

export const MainMenu: React.FC<Props> = ({ 
  onStartGame, 
  onOpenShop, 
  onOpenSettings, 
  onOpenChallenges 
}) => {
  const [bestScore, setBestScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    const loadScores = async () => {
      const [best, coins] = await Promise.all([
        StorageManager.getBestScore(),
        StorageManager.getTotalCoins(),
      ]);
      setBestScore(best);
      setTotalCoins(coins);
    };
    loadScores();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Emoji Escape</Text>
        <Text style={styles.subtitle}>The Ultimate Runner</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Best Score</Text>
          <Text style={styles.scoreValue}>{bestScore.toLocaleString()}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Total Coins</Text>
          <Text style={[styles.scoreValue, { color: '#FFD700' }]}>
            {totalCoins.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, styles.primaryButton]} 
          onPress={onStartGame}
        >
          <Play size={28} color="#FFFFFF" />
          <Text style={styles.buttonText}>Start Game</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onOpenShop}>
          <ShoppingBag size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Shop</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onOpenChallenges}>
          <Gift size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Daily Challenges</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={onOpenSettings}>
          <Settings size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Settings</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    marginBottom: 50,
    gap: 30,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  version: {
    position: 'absolute',
    bottom: 20,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
});