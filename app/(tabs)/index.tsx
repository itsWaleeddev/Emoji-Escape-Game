// GameTab.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MainMenu } from '@/components/screens/MainMenu';
import { GameScreen } from '@/components/game/GameScreen';
import { StorageManager } from '@/utils/storage';
import { GameSettings } from '@/types/game';

export default function GameTab() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game'>('menu');
  const [selectedSkin, setSelectedSkin] = useState('1');
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    controlMode: 'swipe',
    difficulty: 'medium',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGameData = async () => {
      const [skin, gameSettings] = await Promise.all([
        StorageManager.getSelectedSkin(),
        StorageManager.getSettings(),
      ]);
      // Defensive: ensure we have defaults
      setSelectedSkin(skin ?? '1');
      setSettings(gameSettings ?? {
        soundEnabled: true,
        vibrationEnabled: true,
        controlMode: 'swipe',
        difficulty: 'medium',
      });
      setIsLoading(false);
    };
    loadGameData();
  }, []);

  if (isLoading) return null; // or splash/loading

  const handleStartGame = () => setCurrentScreen('game');
  const handleNavigateToMenu = () => setCurrentScreen('menu');
  const handleNavigateToShop = () => {};
  const handleOpenShop = () => {};
  const handleOpenSettings = () => {};
  const handleOpenChallenges = () => {};

  return (
    <View style={styles.container}>
      {currentScreen === 'menu' ? (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenShop={handleOpenShop}
          onOpenSettings={handleOpenSettings}
          onOpenChallenges={handleOpenChallenges}
        />
      ) : (
        <GameScreen
          onNavigateToMenu={handleNavigateToMenu}
          onNavigateToShop={handleNavigateToShop}
          selectedSkin={selectedSkin}
          difficulty={settings.difficulty ?? 'medium'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
