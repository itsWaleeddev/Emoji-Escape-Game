import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Trophy, Clock, Target } from 'lucide-react-native';
import { Challenge } from '@/types/game';
import { StorageManager } from '@/utils/storage';
import { DAILY_CHALLENGES } from '@/constants/game';

interface Props {
  onBack: () => void;
}

export const ChallengesScreen: React.FC<Props> = ({ onBack }) => {
  const [challenges, setChallenges] = useState<Challenge[]>(DAILY_CHALLENGES);
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const [savedChallenges, coins] = await Promise.all([
      StorageManager.getDailyChallenges(),
      StorageManager.getTotalCoins(),
    ]);
    
    setChallenges(savedChallenges);
    setTotalCoins(coins);
  };

  const claimReward = async (challenge: Challenge) => {
    if (challenge.completed) {
      const newCoins = totalCoins + challenge.reward;
      const updatedChallenges = challenges.map(c =>
        c.id === challenge.id ? { ...c, current: 0, completed: false } : c
      );

      setTotalCoins(newCoins);
      setChallenges(updatedChallenges);

      await Promise.all([
        StorageManager.setTotalCoins(newCoins),
        StorageManager.setDailyChallenges(updatedChallenges),
      ]);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'score':
        return <Target size={24} color="#FFFFFF" />;
      case 'coins':
        return <Text style={styles.challengeEmoji}>🪙</Text>;
      case 'obstacles':
        return <Trophy size={24} color="#FFFFFF" />;
      default:
        return <Target size={24} color="#FFFFFF" />;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#059669', '#0891B2']}
        style={styles.background}
      />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Daily Challenges</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>🪙 {totalCoins}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Clock size={24} color="#FFFFFF" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Daily Reset</Text>
            <Text style={styles.infoSubtitle}>
              Challenges reset every 24 hours
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Challenges</Text>

        {challenges.map(challenge => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeInfo}>
                {getChallengeIcon(challenge.type)}
                <View style={styles.challengeTextContainer}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>
                    {challenge.description}
                  </Text>
                </View>
              </View>
              <View style={styles.rewardContainer}>
                <Text style={styles.rewardText}>🪙 {challenge.reward}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage(challenge.current, challenge.target)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.current} / {challenge.target}
              </Text>
            </View>

            {challenge.completed ? (
              <Pressable 
                style={styles.claimButton} 
                onPress={() => claimReward(challenge)}
              >
                <Trophy size={20} color="#FFFFFF" />
                <Text style={styles.claimButtonText}>Claim Reward</Text>
              </Pressable>
            ) : (
              <View style={styles.incompleteIndicator}>
                <Text style={styles.incompleteText}>In Progress</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.tipSection}>
          <Text style={styles.tipTitle}>💡 Tips for Success</Text>
          <Text style={styles.tipText}>
            • Play consistently to complete daily challenges{'\n'}
            • Focus on survival for score-based challenges{'\n'}
            • Collect power-ups to maximize coin collection{'\n'}
            • Higher difficulty levels offer better rewards
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coinsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  challengeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  challengeEmoji: {
    fontSize: 24,
  },
  rewardContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'right',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  incompleteIndicator: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  incompleteText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '500',
  },
  tipSection: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  tipTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
});