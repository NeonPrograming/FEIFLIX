import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
}

const pageLabels: Record<string, string> = {
    movies: 'Filmes',
    search: 'Pesquisar',
    fav: 'Favoritos',
    about: 'Sobre',
};

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const getIconName = (route: string, focused: boolean): IoniconsName => {
  switch (route) {
    case 'movies':
      return focused ? 'film' : 'film-outline';
    case 'fav':
      return focused ? 'heart' : 'heart-outline';
    case 'about':
      return focused ? 'information-circle' : 'information-circle-outline';
    case 'search':
      return focused ? 'search' : 'search-outline';
    default:
      return 'help-circle';
  }
};

const Footer: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
    return (
      <View style={styles.footer}>
        {Object.keys(pageLabels).map(item => (
          <TouchableOpacity
            key={item}
            style={styles.button}
            onPress={() => onNavigate(item)}
          >
            <Ionicons 
              name={getIconName(item, currentScreen === item)} 
              size={22} 
              color={currentScreen === item ? '#ba0c0c' : '#aaa'} 
            />
            <Text style={[styles.label, currentScreen === item && styles.activeLabel]}>{pageLabels[item]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderColor: '#eee',
      backgroundColor: '#fff',
    },
    button: {
      flex: 1,
      alignItems: 'center',
    },
    label: {
      fontSize: 12,
      color: '#aaa',
      marginTop: 2,
    },
    activeLabel: {
      color: '#ba0c0c',
      fontWeight: 'bold',
    },
  });
  
  export default Footer;
  