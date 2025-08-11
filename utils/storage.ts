import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, PlayerSkin, Challenge } from '@/types/game';
import { PLAYER_SKINS, DAILY_CHALLENGES } from '@/constants/game';

export class StorageManager {
  private static readonly KEYS = {
    BEST_SCORE: 'bestScore',
    TOTAL_COINS: 'totalCoins',
    PLAYER_SKINS: 'playerSkins',
    SELECTED_SKIN: 'selectedSkin',
    SETTINGS: 'settings',
    DAILY_CHALLENGES: 'dailyChallenges',
    UNLOCKED_DIFFICULTIES: 'unlockedDifficulties',
  };

  static async getBestScore(): Promise<number> {
    try {
      const score = await AsyncStorage.getItem(this.KEYS.BEST_SCORE);
      return score ? parseInt(score, 10) : 0;
    } catch {
      return 0;
    }
  }

  static async setBestScore(score: number): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.BEST_SCORE, score.toString());
    } catch (error) {
      console.error('Error saving best score:', error);
    }
  }

  static async getTotalCoins(): Promise<number> {
    try {
      const coins = await AsyncStorage.getItem(this.KEYS.TOTAL_COINS);
      return coins ? parseInt(coins, 10) : 0;
    } catch {
      return 0;
    }
  }

  static async setTotalCoins(coins: number): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.TOTAL_COINS, coins.toString());
    } catch (error) {
      console.error('Error saving total coins:', error);
    }
  }

  static async getPlayerSkins(): Promise<PlayerSkin[]> {
    try {
      const skins = await AsyncStorage.getItem(this.KEYS.PLAYER_SKINS);
      return skins ? JSON.parse(skins) : PLAYER_SKINS;
    } catch {
      return PLAYER_SKINS;
    }
  }

  static async setPlayerSkins(skins: PlayerSkin[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.PLAYER_SKINS, JSON.stringify(skins));
    } catch (error) {
      console.error('Error saving player skins:', error);
    }
  }

  static async getSelectedSkin(): Promise<string> {
    try {
      const skinId = await AsyncStorage.getItem(this.KEYS.SELECTED_SKIN);
      return skinId || '1';
    } catch {
      return '1';
    }
  }

  static async setSelectedSkin(skinId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SELECTED_SKIN, skinId);
    } catch (error) {
      console.error('Error saving selected skin:', error);
    }
  }

  static async getSettings(): Promise<GameSettings> {
    try {
      const settings = await AsyncStorage.getItem(this.KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {
        soundEnabled: true,
        vibrationEnabled: true,
        controlMode: 'swipe',
        difficulty: 'medium',
      };
    } catch {
      return {
        soundEnabled: true,
        vibrationEnabled: true,
        controlMode: 'swipe',
        difficulty: 'medium',
      };
    }
  }

  static async setSettings(settings: GameSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async getDailyChallenges(): Promise<Challenge[]> {
    try {
      const challenges = await AsyncStorage.getItem(this.KEYS.DAILY_CHALLENGES);
      return challenges ? JSON.parse(challenges) : DAILY_CHALLENGES;
    } catch {
      return DAILY_CHALLENGES;
    }
  }

  static async setDailyChallenges(challenges: Challenge[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.DAILY_CHALLENGES, JSON.stringify(challenges));
    } catch (error) {
      console.error('Error saving daily challenges:', error);
    }
  }
}