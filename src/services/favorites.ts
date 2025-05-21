import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie } from './api';

const FAVORITES_STORAGE_KEY = '@FEIFLIX:favorites';

// Buscar todos os filmes favoritos
export const getFavorites = async (): Promise<number[]> => {
  try {
    const favoritesString = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (favoritesString) {
      return JSON.parse(favoritesString);
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return [];
  }
};

// Verificar se um filme está nos favoritos
export const isFavorite = async (movieId: number): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(movieId);
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return false;
  }
};

// Adicionar um filme aos favoritos
export const addFavorite = async (movieId: number): Promise<void> => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(movieId)) {
      const newFavorites = [...favorites, movieId];
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    }
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
  }
};

// Remover um filme dos favoritos
export const removeFavorite = async (movieId: number): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const newFavorites = favorites.filter(id => id !== movieId);
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
  }
};

// Alternar estado de favorito (adicionar se não existir, remover se existir)
export const toggleFavorite = async (movieId: number): Promise<boolean> => {
  try {
    const isFav = await isFavorite(movieId);
    if (isFav) {
      await removeFavorite(movieId);
      return false;
    } else {
      await addFavorite(movieId);
      return true;
    }
  } catch (error) {
    console.error('Erro ao alternar favorito:', error);
    return false;
  }
}; 