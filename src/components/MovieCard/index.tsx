import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Movie } from '../../services/api';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress }) => {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Imagem';

  // Formatando a data de lançamento para o formato brasileiro
  const formatDate = (dateString: string): string => {
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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(movie)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title || "Título não disponível"}
        </Text>
        
        <View style={styles.detailsRow}>
          <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}</Text>
          <Text style={styles.date}>{formatDate(movie.release_date)}</Text>
        </View>
        
        <Text style={styles.overview} numberOfLines={3}>
          {movie.overview || "Descrição não disponível em português."}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  poster: {
    width: 100,
    height: 150,
  },
  info: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rating: {
    fontSize: 14,
    color: '#f5a623',
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  overview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default MovieCard; 