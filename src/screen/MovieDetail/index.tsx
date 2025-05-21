import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  FlatList,
  Pressable
} from 'react-native';
import { Movie, getMovieDetails, getMovieCredits, Cast, Crew, Credits, Genre } from '../../services/api';

interface MovieDetailProps {
  navigation?: any;
  route?: {
    params: {
      movieId: number;
    };
  };
  movieId?: number; // ID do filme pode ser passado diretamente
  onBack?: () => void; // Função para voltar à lista de filmes
}

const MovieDetail: React.FC<MovieDetailProps> = ({ navigation, route, movieId: propMovieId, onBack }) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar o movieId da prop ou do route param
  const movieId = propMovieId || route?.params?.movieId;

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) {
        setError('ID do filme não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar detalhes do filme
        const movieData = await getMovieDetails(movieId);
        
        if (movieData) {
          setMovie(movieData);
          
          // Buscar créditos (elenco e equipe)
          const creditsData = await getMovieCredits(movieId);
          if (creditsData) {
            setCredits(creditsData);
          }
          
          setError(null);
        } else {
          setError('Não foi possível carregar os detalhes do filme');
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes do filme:', err);
        setError('Erro ao carregar detalhes do filme');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  // Formatando a data de lançamento para o formato brasileiro
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Data não disponível";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString; // Em caso de erro, retorna a string original
    }
  };
  
  // Formatar duração do filme: 143 -> 2h 23min
  const formatRuntime = (minutes?: number): string => {
    if (!minutes) return 'Duração não disponível';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };
  
  // Formatar lista de gêneros: ['Ação', 'Aventura'] -> 'Ação, Aventura'
  const formatGenres = (movie?: Movie): string => {
    if (!movie?.genres || movie.genres.length === 0) {
      return 'Gêneros não disponíveis';
    }
    
    return movie.genres.map(genre => genre.name).join(', ');
  };
  
  // Componente para exibir um gênero como tag
  const GenreTag = ({ genre }: { genre: Genre }) => {
    const [pressed, setPressed] = useState(false);
    
    return (
      <Pressable 
        style={[
          styles.genreTag,
          pressed && styles.genreTagPressed
        ]}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <Text style={styles.genreText}>{genre.name}</Text>
      </Pressable>
    );
  };

  // Encontrar diretor(es) do filme
  const getDirectors = (): Crew[] => {
    if (!credits?.crew) return [];
    
    return credits.crew.filter(person => person.job === 'Director');
  };
  
  // Encontrar roteiristas do filme
  const getWriters = (): Crew[] => {
    if (!credits?.crew) return [];
    
    // Cargos comuns para roteiristas
    const writerJobs = [
      'Writer', 
      'Screenplay', 
      'Screenwriter',
      'Story',
      'Script',
      'Author'
    ];
    
    // Filtra todos os membros da equipe que têm cargos relacionados à escrita
    const writers = credits.crew.filter(person => 
      writerJobs.includes(person.job) || person.department === 'Writing'
    );
    
    // Remove duplicatas (mesma pessoa com diferentes cargos de escrita)
    const uniqueWriters = writers.filter((writer, index, self) =>
      index === self.findIndex(w => w.id === writer.id)
    );
    
    return uniqueWriters;
  };
  
  // Traduz o cargo do roteirista para português
  const translateWriterJob = (job: string): string => {
    const translations: Record<string, string> = {
      'Writer': 'Roteirista',
      'Screenplay': 'Roteiro',
      'Screenwriter': 'Roteirista',
      'Story': 'História',
      'Script': 'Roteiro',
      'Author': 'Autor',
      'Writing': 'Roteirista'
    };
    
    return translations[job] || 'Roteirista';
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ba0c0c" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Filme não encontrado'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const directors = getDirectors();
  const writers = getWriters();

  // URL da imagem de backdrop em alta resolução
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  // URL da imagem do poster em alta resolução
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Imagem de fundo (backdrop) */}
        {backdropUrl && (
          <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
        )}

        <View style={styles.detailsContainer}>
          {/* Poster e informações básicas */}
          <View style={styles.headerRow}>
            <Image source={{ uri: posterUrl }} style={styles.poster} />
            
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{movie.title}</Text>
              
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</Text>
                <Text style={styles.releaseDate}>{formatDate(movie.release_date)}</Text>
              </View>
              
              <Text style={styles.extraInfo}>{formatRuntime(movie.runtime)}</Text>
              
              {/* Gêneros como tags */}
              {movie.genres && movie.genres.length > 0 ? (
                <View style={styles.genresContainer}>
                  {movie.genres.map(genre => (
                    <GenreTag key={genre.id} genre={genre} />
                  ))}
                </View>
              ) : (
                <Text style={styles.extraInfo}>Gêneros não disponíveis</Text>
              )}
            </View>
          </View>
          {/* Sinopse */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopse</Text>
            <Text style={styles.overview}>
              {movie.overview || "Descrição não disponível em português."}
            </Text>
          </View>
          
          {/* Elenco */}
          {credits?.cast && credits.cast.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Elenco Principal</Text>
              <FlatList
                horizontal
                data={credits.cast.slice(0, 10)} // Limitar aos 10 primeiros atores
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable 
                    style={({ pressed }) => [
                      styles.castCard,
                      pressed && styles.castCardPressed
                    ]}
                  >
                    <View style={styles.castImageContainer}>
                      <Image 
                        source={{ 
                          uri: item.profile_path 
                            ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                            : 'https://via.placeholder.com/185x278?text=Sem+Foto'
                        }} 
                        style={styles.castImage}
                      />
                    </View>
                    <View style={styles.castInfo}>
                      <Text style={styles.castName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.castCharacter} numberOfLines={2}>{item.character}</Text>
                    </View>
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castList}
              />
            </View>
          )}
          {/* Direção */}
          {directors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {directors.length === 1 ? 'Direção' : 'Direção'}
              </Text>
              <FlatList
                horizontal
                data={directors}
                keyExtractor={(item) => `director-${item.id}`}
                renderItem={({ item }) => (
                  <View style={styles.directorCard}>
                    <View style={styles.directorImageContainer}>
                      <Image 
                        source={{ 
                          uri: item.profile_path 
                            ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                            : 'https://via.placeholder.com/80x80?text=D'
                        }} 
                        style={styles.directorImage}
                      />
                    </View>
                    <Text style={styles.directorName}>{item.name}</Text>
                    <Text style={styles.directorRole}>Diretor</Text>
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.crewList}
              />
            </View>
          )}
          
          {/* Roteiristas */}
          {writers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {writers.length === 1 ? 'Roteiro' : 'Roteiro'}
              </Text>
              <FlatList
                horizontal
                data={writers}
                keyExtractor={(item) => `writer-${item.id}`}
                renderItem={({ item }) => (
                  <View style={styles.directorCard}>
                    <View style={styles.writerImageContainer}>
                      <Image 
                        source={{ 
                          uri: item.profile_path 
                            ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                            : 'https://via.placeholder.com/80x80?text=W'
                        }} 
                        style={styles.directorImage}
                      />
                    </View>
                    <Text style={styles.directorName}>{item.name}</Text>
                    <Text style={styles.directorRole}>{translateWriterJob(item.job)}</Text>
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.crewList}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#ba0c0c',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backdrop: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  ratingContainer: {
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    fontSize: 16,
    color: '#f5a623',
  },
  releaseDate: {
    fontSize: 14,
    color: '#666',
  },
  extraInfo: {
    fontSize: 14,
    color: '#444',
    marginTop: 3,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: -2, // Compensar as margens das tags
  },
  genreTag: {
    backgroundColor: '#db0000',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
    borderWidth: 1,
    borderColor: '#c10000',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  genreTagPressed: {
    backgroundColor: '#c10000',
    elevation: 1,
    transform: [{ scale: 0.95 }],
  },
  genreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  overview: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  directorName: {
    fontSize: 15,
    color: '#444',
    marginBottom: 2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  directorRole: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  directorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  directorCard: {
    width: 100,
    marginRight: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  directorImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#db0000',
    borderWidth: 2,
    borderColor: '#db0000',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  writerImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#666',
    borderWidth: 2,
    borderColor: '#db0000',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  directorImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
  },
  castList: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  castCard: {
    width: 110,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  castCardPressed: {
    elevation: 1,
    backgroundColor: '#f8f8f8',
    transform: [{ scale: 0.98 }],
  },
  castImageContainer: {
    width: 110,
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
  },
  castImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  castInfo: {
    padding: 8,
  },
  castName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  castCharacter: {
    fontSize: 12,
    color: '#666',
  },
  backButton: {
    padding: 12,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ba0c0c',
    fontWeight: 'bold',
  },
  crewList: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 16, // Adicione espaço à direita para evitar corte
  },
});

export default MovieDetail; 