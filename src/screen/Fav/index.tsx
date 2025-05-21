import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl
} from 'react-native';
import { Movie, getMovieDetails } from '../../services/api';
import { getFavorites } from '../../services/favorites';
import MovieCard from '../../components/MovieCard';

interface FavProps {
  onSelectMovie: (movieId: number) => void;
}

const Fav: React.FC<FavProps> = ({ onSelectMovie }) => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar os filmes favoritos
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar IDs dos filmes favoritos do AsyncStorage
      const favoriteIds = await getFavorites();
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      
      // Buscar detalhes de cada filme favorito
      const moviesPromises = favoriteIds.map(id => getMovieDetails(id));
      const moviesResults = await Promise.all(moviesPromises);
      
      // Filtrar resultados nulos (em caso de erro ao buscar detalhes)
      const validMovies = moviesResults.filter((movie): movie is Movie => movie !== null);
      
      setFavorites(validMovies);
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
      setError('Ocorreu um erro ao carregar seus filmes favoritos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carregar favoritos ao montar o componente
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Função para atualizar a lista de favoritos
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, [loadFavorites]);

  // Renderizar um item da lista
  const renderItem = ({ item }: { item: Movie }) => (
    <MovieCard movie={item} onPress={(movie) => onSelectMovie(movie.id)} />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#db0000" />
        <Text style={styles.loadingText}>Carregando favoritos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Favoritos</Text>
      </View>
      
      {favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Você ainda não adicionou nenhum filme aos favoritos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#db0000']}
              tintColor="#db0000"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  header: {
    padding: 12,
    backgroundColor: '#db0000',
    marginBottom: 10,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ba0c0c',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Espaço para a navegação inferior
  },
});

export default Fav;
