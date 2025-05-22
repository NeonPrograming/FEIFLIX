# FEIFLIX

Um aplicativo de streaming de filmes desenvolvido com React Native e Expo, utilizando a API do TMDB (The Movie Database) para fornecer informações atualizadas sobre filmes em cartaz.

## Visão Geral

FEIFLIX é um aplicativo móvel que permite aos usuários explorar filmes em cartaz, buscar por títulos específicos, visualizar detalhes completos sobre cada filme (incluindo elenco e equipe técnica) e salvar seus filmes favoritos para acesso rápido. O aplicativo foi desenvolvido como parte de um projeto acadêmico da FEI para a disciplina de Computação Móvel.

## Funcionalidades

### 1. Navegação entre Telas
- Tela inicial (Filmes em Cartaz)
- Tela de Favoritos
- Tela de Busca
- Tela de Detalhes do Filme
- Tela Sobre

### 2. Exibição de Filmes em Cartaz
- Listagem dos filmes atualmente em cartaz
- Layout responsivo com cards de filmes
- Carregamento paginado para melhor performance
- Pull-to-refresh para atualizar a lista

### 3. Detalhes do Filme
- Imagem de fundo (backdrop) e poster
- Informações básicas:
  - Título 
  - Avaliação (nota)
  - Data de lançamento (formatada para pt-BR)
  - Duração (formatada para horas e minutos)
- Gêneros exibidos como tags coloridas
- Sinopse completa
- Elenco principal com fotos e nomes dos personagens
- Diretores com fotos em formato circular
- Roteiristas com cargos traduzidos para português

### 4. Sistema de Favoritos
- Adicionar/remover filmes dos favoritos
- Feedback sonoro ao favoritar (som de "plim")
- Indicação visual (estrela amarela) nos cards de filmes favoritados
- Tela dedicada para visualizar todos os filmes favoritos
- Persistência dos favoritos entre sessões usando AsyncStorage

### 5. Busca de Filmes
- Campo de pesquisa para buscar filmes por título
- Exibição de resultados usando o mesmo componente de card
- Estados para carregamento, erro e resultados vazios
- Persistência do termo de busca usando AsyncStorage

## Tecnologias Utilizadas

### API TMDB
- Integração com a API do The Movie Database (TMDB)
- Endpoints utilizados:
  - `/movie/now_playing`: Filmes em cartaz
  - `/movie/{id}`: Detalhes de um filme específico
  - `/movie/{id}/credits`: Elenco e equipe técnica
  - `/search/movie`: Busca de filmes por título
- Tratamento para garantir conteúdo traduzido em português quando disponível
- Fallback para inglês quando descrições não estão disponíveis em português

### AsyncStorage
- Implementação do AsyncStorage para persistência de dados
- Armazenamento de IDs de filmes favoritos:
  ```typescript
  // Chave para armazenamento
  const FAVORITES_STORAGE_KEY = '@FEIFLIX:favorites';
  
  // Salvar favoritos
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
  
  // Recuperar favoritos
  const favoritesString = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  ```
- Persistência do último termo de busca:
  ```typescript
  // Chave para armazenamento
  const SEARCH_HISTORY_KEY = '@FEIFLIX:search_history';
  
  // Salvar termo de busca
  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, searchQuery);
  
  // Recuperar termo de busca
  const lastQuery = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
  ```

### Expo
- Utilização do framework Expo para desenvolvimento React Native
- Biblioteca expo-av para reprodução de áudio (som ao favoritar)

## Estrutura do Projeto

```
src/
├── assets/            # Imagens e sons
├── components/        # Componentes reutilizáveis (ex: MovieCard)
├── screen/            # Telas do aplicativo
│   ├── About/         # Tela sobre o projeto
│   ├── Fav/           # Tela de favoritos
│   ├── MovieDetail/   # Tela de detalhes do filme
│   ├── Movies/        # Tela principal (filmes em cartaz)
│   └── Search/        # Tela de busca
├── services/          # Serviços de API e lógica de negócios
│   ├── api.ts         # Integração com a API TMDB
│   └── favorites.ts   # Gerenciamento de favoritos
└── utils/             # Utilitários (ex: sons)
```

## Desafios e Soluções

### 1. Tradução de Conteúdo
- Implementação de verificação para descrições vazias em português
- Fallback para conteúdo em inglês quando necessário

### 2. Navegação Entre Telas
- Sistema de navegação personalizado que lembra a tela anterior
- Retorno para a tela correta após visualizar detalhes de um filme

### 3. Gerenciamento de Estado
- Uso de useState e useEffect para gerenciar estados locais
- AsyncStorage para persistência entre sessões

## Como Executar

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Execute com `npm start` ou `expo start`
4. Escaneie o QR code com o aplicativo Expo Go no seu dispositivo

## Créditos

Desenvolvido por Felipe Brum Pereira como parte do projeto acadêmico da FEI para a disciplina de Computação Móvel.

API de dados fornecida por [The Movie Database (TMDB)](https://www.themoviedb.org/).
