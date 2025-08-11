import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, RotateCcw, Home } from 'lucide-react-native';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseMenu: React.FC<Props> = ({ onResume, onRestart, onHome }) => {
  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.container}
      >
        <Text style={styles.title}>Game Paused</Text>
        
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={onResume}>
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Resume</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={onRestart}>
            <RotateCcw size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Restart</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={onHome}>
            <Home size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Home</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});