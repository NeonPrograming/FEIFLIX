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
  previousScreen?: PageKey; // Tela anterior para voltar após detalhes
  returnToSearch?: boolean; // Indica se deve voltar para a tela de busca
}

export default function App() {
  // Estado para controlar a tela atual e suas propriedades
  const [currentScreen, setCurrentScreen] = useState<PageKey>('movies');
  const [navProps, setNavProps] = useState<NavigationProps>({});
  const [prevScreen, setPrevScreen] = useState<PageKey | null>(null);

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

    // Se estamos navegando para detalhes de filme, armazene a tela atual como tela anterior
    if (screen === 'movieDetail') {
      props.previousScreen = currentScreen;
    }

    setCurrentScreen(screen);
    setNavProps(props);
  }, [currentScreen]);

  // Handler para voltar da tela de detalhes para a tela anterior
  const handleBackFromDetails = useCallback(() => {
    // Voltar para a tela anterior ou para 'movies' como fallback
    const previousScreen = navProps.previousScreen || 'movies';
    setCurrentScreen(previousScreen);
  }, [navProps.previousScreen]);


  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', width: '100%', height: '100%' }}>
        {currentScreen === 'movieDetail' ? (
          <MovieDetail 
            movieId={navProps.movieId || 0} 
            onBack={handleBackFromDetails}
            route={{ params: { 
              movieId: navProps.movieId || 0,
              returnToSearch: navProps.returnToSearch 
            } }}
          />
        ) : (
          <>
            <PageComponent 
              onSelectMovie={(movieId: number) => 
                navigateTo('movieDetail', { 
                  movieId, 
                  returnToSearch: currentScreen === 'search' 
                })
              }
              route={{ params: navProps }}
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
