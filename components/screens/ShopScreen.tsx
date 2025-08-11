import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check } from 'lucide-react-native';
import { PlayerSkin } from '@/types/game';
import { StorageManager } from '@/utils/storage';
import { PLAYER_SKINS } from '@/constants/game';

interface Props {
  onBack: () => void;
}

export const ShopScreen: React.FC<Props> = ({ onBack }) => {
  const [skins, setSkins] = useState<PlayerSkin[]>(PLAYER_SKINS);
  const [totalCoins, setTotalCoins] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState('1');

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    const [playerSkins, coins, currentSkin] = await Promise.all([
      StorageManager.getPlayerSkins(),
      StorageManager.getTotalCoins(),
      StorageManager.getSelectedSkin(),
    ]);
    
    setSkins(playerSkins);
    setTotalCoins(coins);
    setSelectedSkin(currentSkin);
  };

  const buySkin = async (skin: PlayerSkin) => {
    if (totalCoins >= skin.price) {
      const newCoins = totalCoins - skin.price;
      const updatedSkins = skins.map(s => 
        s.id === skin.id ? { ...s, unlocked: true } : s
      );

      setTotalCoins(newCoins);
      setSkins(updatedSkins);

      await Promise.all([
        StorageManager.setTotalCoins(newCoins),
        StorageManager.setPlayerSkins(updatedSkins),
      ]);
    }
  };

  const selectSkin = async (skinId: string) => {
    setSelectedSkin(skinId);
    await StorageManager.setSelectedSkin(skinId);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        style={styles.background}
      />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>🪙 {totalCoins}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Character Skins</Text>
        
        <View style={styles.skinsGrid}>
          {skins.map(skin => (
            <View key={skin.id} style={styles.skinCard}>
              <View style={styles.skinPreview}>
                <Text style={styles.skinEmoji}>{skin.emoji}</Text>
              </View>
              
              <Text style={styles.skinName}>{skin.name}</Text>
              
              {skin.unlocked ? (
                <Pressable 
                  style={[
                    styles.skinButton,
                    selectedSkin === skin.id ? styles.selectedButton : styles.selectButton
                  ]}
                  onPress={() => selectSkin(skin.id)}
                >
                  {selectedSkin === skin.id ? (
                    <>
                      <Check size={16} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Selected</Text>
                    </>
                  ) : (
                    <Text style={styles.buttonText}>Select</Text>
                  )}
                </Pressable>
              ) : (
                <Pressable 
                  style={[
                    styles.skinButton,
                    totalCoins >= skin.price ? styles.buyButton : styles.disabledButton
                  ]}
                  onPress={() => buySkin(skin)}
                  disabled={totalCoins < skin.price}
                >
                  <Text style={styles.buttonText}>
                    🪙 {skin.price}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How to earn coins?</Text>
          <Text style={styles.infoText}>
            • Collect coins during gameplay{'\n'}
            • Complete daily challenges{'\n'}
            • Achieve high scores{'\n'}
            • Use power-ups for bonus coins
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  skinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  skinCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  skinPreview: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  skinEmoji: {
    fontSize: 40,
  },
  skinName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  skinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  selectButton: {
    backgroundColor: '#3B82F6',
  },
  selectedButton: {
    backgroundColor: '#10B981',
  },
  buyButton: {
    backgroundColor: '#F59E0B',
  },
  disabledButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
});