import axios from 'axios';
import { API_KEY, LANG, BASE_URL } from '@env';

// Configuração básica do Axios com API do The Movie Database
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  params: {
    api_key: API_KEY,
    language: 'pt-BR', // Forçando sempre o idioma português brasileiro
    include_image_language: 'pt-BR,null' // Incluir imagens com texto em português quando disponível
  },
  timeout: 10000 // Timeout de 10 segundos
});

// Função para verificar se o texto está traduzido
// Às vezes a API retorna textos vazios para idiomas não disponíveis
const ensureTranslated = (text: string | null, fallback: string | null = null): string => {
  // Se o texto estiver vazio ou for apenas pontuação/espaços, use o fallback
  if (!text || text.trim().length === 0 || /^[.,\/#!$%\^&\*;:{}=\-_`~()\s]+$/.test(text)) {
    return fallback || 'Texto não disponível em português';
  }
  return text;
};

// Função para tratar erros de rede
const handleApiError = (error: any, context: string): void => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      console.error(`Timeout na requisição: ${context}`);
    } else if (error.message === 'Network Error') {
      console.error(`Erro de rede: Verifique sua conexão com a internet. Contexto: ${context}`);
    } else if (error.response) {
      // O servidor respondeu com um status diferente de 2xx
      console.error(`Erro ${error.response.status} - ${context}: ${
        error.response.data && typeof error.response.data === 'object' 
          ? (error.response.data as any).status_message || error.message
          : error.message
      }`);
    } else if (error.request) {
      // A requisição foi feita mas não recebeu resposta
      console.error(`Sem resposta da API - ${context}: ${error.message}`);
    } else {
      console.error(`Erro na configuração da requisição - ${context}: ${error.message}`);
    }
  } else {
    console.error(`Erro desconhecido - ${context}: ${error}`);
  }
};

// Interfaces para tipagem dos dados
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
}

export interface Genre {
  id: number;
  name: string;
}

// Interfaces para elenco e equipe técnica
export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Função para garantir que títulos e descrições estejam traduzidos
const processMovieTranslations = async (movie: Movie): Promise<Movie> => {
  // Se a descrição vier vazia, tenta buscar em inglês
  if (!movie.overview || movie.overview.trim().length === 0) {
    try {
      // Busca informações do filme em inglês
      const englishResponse = await axios.get<Movie>(`https://api.themoviedb.org/3/movie/${movie.id}`, {
        params: {
          api_key: API_KEY,
          language: 'en-US' // Busca em inglês
        }
      });
      
      // Atualiza a descrição se ela vier vazia em português
      if (englishResponse.data.overview) {
        movie.overview = `(Em inglês) ${englishResponse.data.overview}`;
      }
    } catch (error) {
      console.error(`Erro ao buscar tradução para o filme ${movie.id}:`, error);
    }
  }
  
  return movie;
};

// Processar lista de filmes para garantir traduções
const processMovieList = async (movies: Movie[]): Promise<Movie[]> => {
  // Para evitar muitas requisições, só processamos filmes com descrição vazia
  const processedMovies = await Promise.all(
    movies.map(async movie => 
      (!movie.overview || movie.overview.trim().length === 0) 
        ? processMovieTranslations(movie) 
        : movie
    )
  );
  
  return processedMovies;
};

// Funções para buscar filmes
export const getMovies = async (page = 1): Promise<MovieResponse> => {
  try {
    const response = await api.get<MovieResponse>('movie/now_playing', {
      params: { page }
    });
    
    // Processar traduções se necessário
    const processedResults = await processMovieList(response.data.results);
    
    return {
      ...response.data,
      results: processedResults
    };
  } catch (error) {
    handleApiError(error, 'Busca de filmes em cartaz');
    // Retorna uma resposta vazia em caso de erro para evitar quebra da UI
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
};

// Buscar créditos (elenco e equipe) de um filme
export const getMovieCredits = async (movieId: number): Promise<Credits | null> => {
  try {
    const response = await api.get<Credits>(`movie/${movieId}/credits`);
    return response.data;
  } catch (error) {
    handleApiError(error, `Créditos do filme ${movieId}`);
    return null;
  }
};

// Buscar detalhes de um filme específico
export const getMovieDetails = async (movieId: number): Promise<Movie | null> => {
  try {
    const response = await api.get<Movie>(`movie/${movieId}`, {
      params: {
        append_to_response: 'credits'
      }
    });
    
    // Se a descrição vier vazia, busca em inglês
    if (!response.data.overview || response.data.overview.trim().length === 0) {
      return await processMovieTranslations(response.data);
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, `Detalhes do filme ${movieId}`);
    return null;
  }
};

// Buscar filmes por pesquisa
export const searchMovies = async (query: string, page = 1): Promise<MovieResponse> => {
  try {
    const response = await api.get<MovieResponse>('search/movie', {
      params: { 
        query, 
        page,
        include_adult: false, 
      }
    });
    
    // Processar traduções se necessário
    const processedResults = await processMovieList(response.data.results);
    
    return {
      ...response.data,
      results: processedResults
    };
  } catch (error) {
    handleApiError(error, `Pesquisa por "${query}"`);
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
};

export default api;
