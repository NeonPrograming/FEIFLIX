import React, { useState, useCallback } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import Navigation from './components/Navigation';
import Movies from './screen/Movies';
import Fav from './screen/Fav';
import About from './screen/About';
import Search from './screen/Search';
import MovieDetail from './screen/MovieDetail';

// Tipos para as telas da aplicação
type PageKey = 'movies' | 'fav' | 'about' | 'search' | 'movieDetail';

// Interface para as propriedades de navegação
interface NavigationProps {
  movieId?: number; // ID do filme para a tela de detalhes
}

export default function App() {
  // Estado para controlar a tela atual e suas propriedades
  const [currentScreen, setCurrentScreen] = useState<PageKey>('movies');
  const [navProps, setNavProps] = useState<NavigationProps>({});

  // Referência para componentes de cada tela
  const pages: Record<PageKey, React.FC<any>> = {
    movies: Movies,
    fav: Fav,
    about: About,
    search: Search,
    movieDetail: MovieDetail
  };

  // Componente atual a ser renderizado
  const PageComponent = pages[currentScreen];

  // Função para navegar entre telas
  const navigateTo = useCallback((screen: PageKey, props: NavigationProps = {}) => {
    setCurrentScreen(screen);
    setNavProps(props);
  }, []);

  // Handler específico para voltar da tela de detalhes para a lista de filmes
  const handleBackFromDetails = useCallback(() => {
    setCurrentScreen('movies');
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', width: '100%', height: '100%' }}>
        {currentScreen === 'movieDetail' ? (
          <MovieDetail 
            movieId={navProps.movieId} 
            onBack={handleBackFromDetails} 
          />
        ) : (
          <>
            <PageComponent 
              onSelectMovie={(movieId: number) => 
                navigateTo('movieDetail', { movieId })
              } 
            />
            <Navigation 
              currentScreen={currentScreen} 
              onNavigate={(screen) => navigateTo(screen as PageKey)} 
            />
          </>
        )}
      </SafeAreaView>
    </>
  );
}
