import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Image, 
  Keyboard 
} from "react-native";
import { Movie, searchMovies } from '../../services/api';
import MovieCard from '../../components/MovieCard';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves para o AsyncStorage
const STORAGE_KEYS = {
  QUERY: '@FEIFLIX:search_query',
  MOVIES: '@FEIFLIX:search_results',
  PAGE: '@FEIFLIX:search_page',
  TOTAL_PAGES: '@FEIFLIX:search_total_pages',
  SEARCHED: '@FEIFLIX:has_searched'
};

interface SearchProps {
  navigation?: any;
  onSelectMovie?: (movieId: number) => void; // Para navegar para os detalhes
  route?: any; // Para acessar parâmetros da rota
}

const Search: React.FC<SearchProps> = ({ navigation, onSelectMovie, route }) => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // Flag para saber se já fez alguma busca
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Recuperar o estado da busca quando o componente montar ou quando retornar de outra tela
  useEffect(() => {
    const loadSavedSearch = async () => {
      try {
        // Verificar se o parâmetro 'restoreSearch' está presente na rota
        const shouldRestore = route?.params?.restoreSearch === true;
        
        if (shouldRestore) {
          setLoading(true);
          
          // Carregar o estado salvo do AsyncStorage
          const savedQuery = await AsyncStorage.getItem(STORAGE_KEYS.QUERY);
          const savedMoviesJson = await AsyncStorage.getItem(STORAGE_KEYS.MOVIES);
          const savedPage = await AsyncStorage.getItem(STORAGE_KEYS.PAGE);
          const savedTotalPages = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_PAGES);
          const savedSearched = await AsyncStorage.getItem(STORAGE_KEYS.SEARCHED);
          
          // Restaurar o estado
          if (savedQuery) setQuery(savedQuery);
          if (savedMoviesJson) {
            try {
              const savedMovies = JSON.parse(savedMoviesJson);
              setMovies(savedMovies);
            } catch (e) {
              console.error('Erro ao processar filmes salvos:', e);
            }
          }
          if (savedPage) setPage(Number(savedPage));
          if (savedTotalPages) setTotalPages(Number(savedTotalPages));
          if (savedSearched) setSearched(savedSearched === 'true');
          
          // Limpar o parâmetro da rota para que não restaure novamente em navegações futuras
          if (navigation) {
            navigation.setParams({ restoreSearch: undefined });
          }
        }
      } catch (e) {
        console.error('Erro ao recuperar busca salva:', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedSearch();
  }, [route?.params?.restoreSearch]);
  
  // Salvar estado atual da busca quando houver mudanças
  useEffect(() => {
    const saveSearchState = async () => {
      if (!searched || movies.length === 0) return;
      
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.QUERY, query);
        await AsyncStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
        await AsyncStorage.setItem(STORAGE_KEYS.PAGE, String(page));
        await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_PAGES, String(totalPages));
        await AsyncStorage.setItem(STORAGE_KEYS.SEARCHED, String(searched));
      } catch (e) {
        console.error('Erro ao salvar estado da busca:', e);
      }
    };
    
    saveSearchState();
  }, [query, movies, page, totalPages, searched]);

  // Função para realizar a busca
  const handleSearch = async (searchQuery = query, pageNumber = 1, append = false) => {
    if (!searchQuery.trim()) {
      setError('Digite o nome de um filme para buscar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await searchMovies(searchQuery, pageNumber);
      
      if (response.results.length === 0 && pageNumber === 1) {
        setMovies([]);
        setError('Nenhum filme encontrado com este nome');
      } else {
        setMovies(prev => 
          append ? [...prev, ...response.results] : response.results
        );
        setTotalPages(response.total_pages);
      }
      
      setSearched(true);
    } catch (err) {
      console.error('Erro ao buscar filmes:', err);
      setError('Erro ao buscar filmes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar mais resultados quando chegar ao final da lista
  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      handleSearch(query, nextPage, true);
    }
  };

  // Limpar resultados e buscar novamente
  const handleClearSearch = async () => {
    setQuery('');
    setMovies([]);
    setSearched(false);
    setError(null);
    setPage(1);
    
    // Limpar dados salvos
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.QUERY,
        STORAGE_KEYS.MOVIES,
        STORAGE_KEYS.PAGE,
        STORAGE_KEYS.TOTAL_PAGES,
        STORAGE_KEYS.SEARCHED
      ]);
    } catch (e) {
      console.error('Erro ao limpar busca salva:', e);
    }
  };

  // Tratar seleção de um filme
  const handleSelectMovie = (movie: Movie) => {
    Keyboard.dismiss();

    if (onSelectMovie) {
      onSelectMovie(movie.id);
    } 
    else if (navigation?.navigate) {
      navigation.navigate('MovieDetail', { 
        movieId: movie.id,
        returnToSearch: true
      });
    }
  };
  
  const renderFooter = () => {
    if (!loading || !searched) return null;
    
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#db0000" />
      </View>
    );
  };

  // Renderizar mensagens de erro ou estado vazio
  const renderEmptyContent = () => {
    if (loading && !movies.length) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#db0000" />
          <Text style={styles.emptyText}>Buscando filmes...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#db0000" />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }

    if (searched && !movies.length && !error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={60} color="#666" />
          <Text style={styles.emptyText}>Nenhum filme encontrado</Text>
        </View>
      );
    }

    if (!searched) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={70} color="#666" />
          <Text style={styles.emptyTitle}>Busca de Filmes</Text>
          <Text style={styles.emptyText}>
            Digite o nome de um filme para buscar
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Título da tela */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Busca de Filmes</Text>
      </View>
      
      {/* Cabeçalho da busca */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar apenas filmes..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => {
              setPage(1);
              handleSearch();
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => {
            setPage(1);
            handleSearch();
          }}
          disabled={loading || !query.trim()}
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de resultados */}
      {movies.length > 0 ? (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleSelectMovie} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyContent()
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  searchHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 42,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: '#333',
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#db0000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 80,
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
    opacity: 0.8,
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});
