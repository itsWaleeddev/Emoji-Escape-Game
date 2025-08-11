import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SettingsScreen } from '@/components/screens/SettingsScreen';

export default function SettingsTab() {
  const handleBack = () => {
    // Tab navigation will handle this automatically
  };

  return (
    <View style={styles.container}>
      <SettingsScreen onBack={handleBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});