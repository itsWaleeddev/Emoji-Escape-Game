import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Home, ShoppingBag } from 'lucide-react-native';

interface Props {
  finalScore: number;
  bestScore: number;
  coinsEarned: number;
  onRestart: () => void;
  onHome: () => void;
  onShop: () => void;
}

export const GameOverScreen: React.FC<Props> = ({ 
  finalScore, 
  bestScore, 
  coinsEarned, 
  onRestart, 
  onHome, 
  onShop 
}) => {
  const isNewBest = finalScore > bestScore;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        <Text style={styles.gameOverTitle}>Game Over</Text>
        
        {isNewBest && (
          <Text style={styles.newBestText}>🎉 New Best Score! 🎉</Text>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Final Score</Text>
            <Text style={styles.statValue}>{finalScore.toLocaleString()}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Best Score</Text>
            <Text style={styles.statValue}>{bestScore.toLocaleString()}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Coins Earned</Text>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>
              {coinsEarned}
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, styles.primaryButton]} onPress={onRestart}>
            <RotateCcw size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={onShop}>
            <ShoppingBag size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Shop</Text>
          </Pressable>
          
          <Pressable style={styles.button} onPress={onHome}>
            <Home size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Home</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    minWidth: 320,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 20,
  },
  newBestText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 30,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});