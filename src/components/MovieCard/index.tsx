import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { Movie } from '../../services/api';
import { isFavorite } from '../../services/favorites';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress }) => {
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Verifique o status de favorito quando o componente for montado
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const favStatus = await isFavorite(movie.id);
      setIsFavorited(favStatus);
    };
    
    checkFavoriteStatus();
  }, [movie.id]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(movie)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContainer}>
        <View style={styles.imageContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#db0000" />
            </View>
          )}
          <Image
            source={{ uri: posterUrl }}
            style={styles.image}
            onLoad={handleImageLoad}
          />
          
          {/* Estrela de favorito */}
          {isFavorited && (
            <View style={styles.favoriteIcon}>
              <Text style={styles.favoriteIconText}>★</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {movie.title}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</Text>
          </View>
          
          <Text style={styles.overview} numberOfLines={2}>
            {movie.overview || "Sinopse não disponível em português."}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  cardContainer: {
    flexDirection: 'row',
    height: 120,
  },
  imageContainer: {
    width: 80,
    height: '100%',
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 3,
    right: 3,
    zIndex: 2,
    padding: 0,
    paddingBottom: 5,
    marginBottom: 5,
    marginTop: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconText: {
    color: '#f5a623',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#f5a623',
    fontWeight: 'bold',
  },
  overview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default MovieCard; 