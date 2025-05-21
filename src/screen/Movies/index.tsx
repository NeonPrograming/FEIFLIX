import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Movie, getMovies, MovieResponse } from '../../services/api';
import MovieCard from '../../components/MovieCard';

interface MoviesProps {
  navigation?: any; // Para compatibilidade com React Navigation se usada no futuro
  onSelectMovie?: (movieId: number) => void; // Função para navegar para os detalhes do filme
}

const Movies: React.FC<MoviesProps> = ({ navigation, onSelectMovie }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = async (pageNumber = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNumber === 1) {
      setLoading(true);
    }

    try {
      const response: MovieResponse = await getMovies(pageNumber);
      
      setMovies(prevMovies => 
        pageNumber === 1 
          ? response.results 
          : [...prevMovies, ...response.results]
      );
      
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Erro ao carregar filmes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSelectMovie = useCallback((movie: Movie) => {
    // Use a função onSelectMovie do App.tsx se disponível
    if (onSelectMovie) {
      onSelectMovie(movie.id);
    } 
    // Fallback para React Navigation se estiver disponível
    else if (navigation?.navigate) {
      navigation.navigate('MovieDetail', { movieId: movie.id });
    }
  }, [onSelectMovie, navigation]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchMovies(1, true);
  };

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#ba0c0c" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Filmes em Cartaz</Text>
      </View>
      
      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ba0c0c" />
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard 
              movie={item} 
              onPress={handleSelectMovie}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#ba0c0c']}
            />
          }
          contentContainerStyle={styles.listContent}
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
    height: '100%',
  },
  headerContainer: {
    backgroundColor: '#db0000',
    paddingVertical: 12,
    marginBottom: 10,
    width: '100%',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Espaço para a navigation bar
  },
});

export default Movies; 