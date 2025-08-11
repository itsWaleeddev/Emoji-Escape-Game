import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChallengesScreen } from '@/components/screens/ChallengesScreen';

export default function ChallengesTab() {
  const handleBack = () => {
    // Tab navigation will handle this automatically
  };

  return (
    <View style={styles.container}>
      <ChallengesScreen onBack={handleBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});