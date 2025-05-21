import { Audio } from 'expo-av';

// Sound object that will be loaded on first use
let favoriteSound: Audio.Sound | null = null;
let soundLoaded = false;

/**
 * Loads the favorite sound effect
 */
const loadFavoriteSound = async (): Promise<Audio.Sound | null> => {
  try {
    // Return existing sound if already loaded
    if (favoriteSound && soundLoaded) {
      return favoriteSound;
    }
    
    // Create a new sound object if needed
    if (!favoriteSound) {
      favoriteSound = new Audio.Sound();
    }
    
    // Load the sound file
    await favoriteSound.loadAsync(require('../assets/sounds/plim.mp3'));
    soundLoaded = true;
    return favoriteSound;
  } catch (error) {
    console.warn('Error loading favorite sound:', error);
    soundLoaded = false;
    return null;
  }
};

/**
 * Plays the favorite sound effect
 */
export const playFavoriteSound = async (): Promise<void> => {
  try {
    const sound = await loadFavoriteSound();
    if (!sound) return;
    
    // Reset to beginning if it was already played
    await sound.setPositionAsync(0);
    await sound.setVolumeAsync(1.0);
    await sound.playAsync();
  } catch (error) {
    console.warn('Error playing favorite sound:', error);
  }
};

/**
 * Unloads all sounds to free up resources
 */
export const unloadSounds = async (): Promise<void> => {
  try {
    if (favoriteSound) {
      await favoriteSound.unloadAsync();
      favoriteSound = null;
      soundLoaded = false;
    }
  } catch (error) {
    console.warn('Error unloading sounds:', error);
  }
}; 