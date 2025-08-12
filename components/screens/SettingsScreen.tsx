import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Volume2, VolumeX, Vibrate } from 'lucide-react-native';
import { GameSettings } from '@/types/game';
import { StorageManager } from '@/utils/storage';

interface Props {
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack }) => {
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
    controlMode: 'touch',
    difficulty: 'medium',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await StorageManager.getSettings();
    setSettings(savedSettings);
  };

  const updateSetting = async (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await StorageManager.setSettings(newSettings);
  };

  const resetProgress = async () => {
    await StorageManager.resetProgress();
    // Show confirmation or feedback to user
  };

  const DifficultySelector = () => (
    <View style={styles.settingSection}>
      <Text style={styles.settingLabel}>Difficulty</Text>
      <View style={styles.difficultyContainer}>
        {(['easy', 'medium', 'hard', 'extreme'] as const).map(level => (
          <Pressable
            key={level}
            style={[
              styles.difficultyButton,
              settings.difficulty === level && styles.selectedDifficulty
            ]}
            onPress={() => updateSetting('difficulty', level)}
          >
            <Text 
              style={[
                styles.difficultyText,
                settings.difficulty === level && styles.selectedDifficultyText
              ]}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const ControlModeSelector = () => (
    <View style={styles.settingSection}>
      <Text style={styles.settingLabel}>Control Mode</Text>
      <View style={styles.controlContainer}>
        <Pressable
          style={[
            styles.controlButton,
            settings.controlMode === 'touch' && styles.selectedControl
          ]}
          onPress={() => updateSetting('controlMode', 'touch')}
        >
          <Text 
            style={[
              styles.controlText,
              settings.controlMode === 'touch' && styles.selectedControlText
            ]}
          >
            Touch
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.controlButton,
            settings.controlMode === 'tilt' && styles.selectedControl
          ]}
          onPress={() => updateSetting('controlMode', 'tilt')}
        >
          <Text 
            style={[
              styles.controlText,
              settings.controlMode === 'tilt' && styles.selectedControlText
            ]}
          >
            Tilt
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4C1D95', '#7C2D12']}
        style={styles.background}
      />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              {settings.soundEnabled ? (
                <Volume2 size={24} color="#FFFFFF" />
              ) : (
                <VolumeX size={24} color="#FFFFFF" />
              )}
              <Text style={styles.settingLabel}>Sound Effects</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Vibrate size={24} color="#FFFFFF" />
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => updateSetting('vibrationEnabled', value)}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <ControlModeSelector />
        <DifficultySelector />

        <View style={styles.settingSection}>
          <Pressable style={styles.resetButton} onPress={resetProgress}>
            <Text style={styles.resetButtonText}>Reset Game Progress</Text>
          </Pressable>
          <Text style={styles.resetDescription}>
            This will reset your current level back to 1 and clear your best score.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Game Tips</Text>
          <Text style={styles.infoText}>
            • Tap JUMP button to jump over obstacles{'\n'}
            • Tap left/right arrows to change lanes{'\n'}
            • Use tilt controls for motion-based gameplay{'\n'}
            • Collect power-ups for special abilities{'\n'}
            • Higher difficulties offer better rewards
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: '#3B82F6',
  },
  difficultyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDifficultyText: {
    color: '#FFFFFF',
  },
  controlContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  selectedControl: {
    backgroundColor: '#10B981',
  },
  controlText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedControlText: {
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  infoSection: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
});