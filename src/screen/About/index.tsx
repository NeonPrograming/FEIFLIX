import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView 
} from 'react-native';

const About: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FEIFlix</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          O FEIFlix é um aplicativo de streaming de filmes desenvolvido como parte 
          de um projeto acadêmico da FEI para a disciplina de Computação Móvel. A aplicação permite aos usuários descobrir 
          filmes em cartaz, buscar por títulos específicos, visualizar detalhes completos 
          incluindo elenco e equipe técnica, além de salvar seus filmes favoritos 
          para acesso rápido. Tudo graças a API TMDB que é utilizada para fornecer dados atualizados 
          de filmes com interface intuitiva e responsiva.
        </Text>

        <Text style={styles.developerTitle}>Desenvolvido por:</Text>

        <View style={styles.developerContainer}>
          <Image 
            source={require('../../assets/felipe.png')} 
            style={styles.developerImage}
            resizeMode="cover"
          />
          <Text style={styles.developerName}>Felipe Brum Pereira</Text>
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
    height: '100%',
  },
  header: {
    padding: 12,
    backgroundColor: '#db0000',
    marginBottom: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'justify',
  },
  developerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#db0000',
    marginBottom: 20,
  },
  developerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  developerImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#db0000',
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default About;
