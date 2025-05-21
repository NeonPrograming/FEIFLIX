import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, searchMovies } from '../../services/api';
import MovieCard from '../../components/MovieCard';

const SEARCH_HISTORY_KEY = '@FEIFLIX:search_history';

interface SearchProps {
  onSelectMovie: (movieId: number) => void;
}

const Search: React.FC<SearchProps> = ({ onSelectMovie }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recuperar a última pesquisa ao montar o componente
  useEffect(() => {
    const loadLastSearch = async () => {
      try {
        const lastQuery = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (lastQuery) {
          setQuery(lastQuery);
          handleSearch(lastQuery);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico de pesquisa:', error);
      }
    };

    loadLastSearch();
  }, []);

  // Função para realizar a pesquisa
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);

      return;
    }

    try {
      setLoading(true);
      setError(null);
      Keyboard.dismiss();

      // Salvar a consulta no AsyncStorage
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, searchQuery);

      // Buscar filmes com a consulta
      const response = await searchMovies(searchQuery);
      
      setResults(response.results);
      
      if (response.results.length === 0) {
        setError('Nenhum filme encontrado para sua pesquisa');
      }
    } catch (err) {
      console.error('Erro ao pesquisar filmes:', err);
      setError('Ocorreu um erro ao pesquisar filmes');
    } finally {
      setLoading(false);
    }
  };

  // Limpar a pesquisa
  const handleClear = () => {
    setQuery('');
    setResults([]);
    AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // Renderizar um item da lista
  const renderItem = ({ item }: { item: Movie }) => (
    <MovieCard movie={item} onPress={(movie) => onSelectMovie(movie.id)} />
  );

  const handleSelectMovie = (movie: Movie) => {
    onSelectMovie(movie.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Filmes</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Digite o nome de um filme..."
          placeholderTextColor="#999"
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(query)}
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={() => handleSearch(query)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableOpacity>
          
          {query.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#db0000" />
          <Text style={styles.loadingText}>Buscando filmes...</Text>
        </View>
      ) : error && results.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.instructionText}>
            Digite o nome de um filme para iniciar a busca
          </Text>
        </View>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButton: {
    backgroundColor: '#db0000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
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
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
});

export default Search;
