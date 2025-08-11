import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShopScreen } from '@/components/screens/ShopScreen';

export default function ShopTab() {
  const handleBack = () => {
    // Tab navigation will handle this automatically
  };

  return (
    <View style={styles.container}>
      <ShopScreen onBack={handleBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});