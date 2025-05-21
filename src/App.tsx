import React, { useState, useCallback} from 'react';
import { SafeAreaView, StatusBar, Text } from 'react-native';
import Navigation from './components/Navigation';
import Home from './screen/Home';
import Fav from './screen/Fav';
import About from './screen/About';
import Movie from './screen/Movie';

type PageKey = 'home' | 'fav' | 'about' | 'movie';

const pages: Record<PageKey, React.FC> = {
  home: Home,
  fav: Fav,
  about: About,
  movie: Movie,
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<PageKey>('home');
  const PageComponent = pages[currentScreen];

  const onNavigate = useCallback((screen: PageKey) => {
    setCurrentScreen(screen);
  }, []);

  return (
    <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1, backgroundColor: '#831010', alignItems: 'center' }}>
          {PageComponent && <PageComponent />}
        <Navigation currentScreen={currentScreen} onNavigate={screen => setCurrentScreen(screen as PageKey)} />
        </SafeAreaView>
    </>
  );
}
