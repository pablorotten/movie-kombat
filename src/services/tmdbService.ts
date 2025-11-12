import genresData from '../assets/TMDB/genres.json';
import providersData from '../assets/TMDB/providers.json';
import regionsData from '../assets/TMDB/regions.json';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBDiscoverResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface Region {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Utility functions to work with static data
export const getGenres = (): Genre[] => {
  return genresData.genres;
};

export const getProviders = (): Provider[] => {
  return providersData.results;
};

export const getRegions = (): Region[] => {
  return regionsData.results;
};

export const getGenreById = (id: number): Genre | undefined => {
  return genresData.genres.find(genre => genre.id === id);
};

export const getProviderById = (id: number): Provider | undefined => {
  return providersData.results.find(provider => provider.provider_id === id);
};

export const getRegionByCode = (code: string): Region | undefined => {
  return regionsData.results.find(region => region.iso_3166_1 === code);
};

export const getGenreByName = (name: string): Genre | undefined => {
  return genresData.genres.find(genre => 
    genre.name.toLowerCase() === name.toLowerCase()
  );
};

export const getProviderByName = (name: string): Provider | undefined => {
  return providersData.results.find(provider => 
    provider.provider_name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(provider.provider_name.toLowerCase())
  );
};

// Popular streaming providers for quick selection
export const getPopularProviders = (): Provider[] => {
  const popularProviderIds = [8, 119, 337, 350, 384, 63]; // Netflix, Amazon Prime, Disney+, Apple TV+, HBO Max
  return popularProviderIds
    .map(id => getProviderById(id))
    .filter((provider): provider is Provider => provider !== undefined);
};

// Convert TMDB poster path to full URL
export const getTMDBImageUrl = (posterPath: string | null): string | null => {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
};

// Discover movies by genre, provider, and country/region
export const discoverMovies = async (
  bearerToken: string,
  options: {
    genreId?: number;
    providerId?: number;
    region?: string; // ISO 3166-1 country code (e.g., 'ES' for Spain, 'US' for United States)
    page?: number;
    sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc';
    includeAdult?: boolean;
  }
): Promise<TMDBDiscoverResponse> => {
  const {
    genreId,
    providerId,
    region = 'ES', // Default to Spain
    page = 1,
    sortBy = 'popularity.desc',
    includeAdult = false
  } = options;

  const params = new URLSearchParams({
    language: 'en-US',
    page: page.toString(),
    sort_by: sortBy,
    include_adult: includeAdult.toString(),
    include_video: 'false'
  });

  if (genreId) {
    params.append('with_genres', genreId.toString());
  }

  if (providerId && region) {
    params.append('watch_region', region);
    params.append('with_watch_providers', providerId.toString());
  }

  const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data: TMDBDiscoverResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch movies from TMDB:', error);
    throw error;
  }
};

// Convert TMDB movie to our app's movie format for OMDB compatibility
export const convertTMDBToAppMovie = (tmdbMovie: TMDBMovie) => {
  const posterUrl = getTMDBImageUrl(tmdbMovie.poster_path);
  
  return {
    imdbID: `tmdb_${tmdbMovie.id}`, // Prefix to distinguish from IMDB IDs
    Title: tmdbMovie.title,
    Year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear().toString() : 'Unknown',
    Poster: posterUrl || 'N/A',
    Type: 'movie',
    // Additional TMDB data that might be useful
    tmdbId: tmdbMovie.id,
    overview: tmdbMovie.overview,
    voteAverage: tmdbMovie.vote_average,
    voteCount: tmdbMovie.vote_count,
    popularity: tmdbMovie.popularity,
    genreIds: tmdbMovie.genre_ids
  };
};

export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime: number | null;
  genres: Genre[];
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
}

// Get movie details by TMDB ID
export const getMovieDetails = async (
  bearerToken: string,
  movieId: number
): Promise<TMDBMovieDetails> => {
  const url = `${TMDB_BASE_URL}/movie/${movieId}?language=en-US`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch movie details from TMDB:', error);
    throw error;
  }
};

// Search for movies by title
export const searchMovies = async (
  bearerToken: string,
  query: string,
  page: number = 1
): Promise<TMDBDiscoverResponse> => {
  const params = new URLSearchParams({
    language: 'en-US',
    query: encodeURIComponent(query),
    page: page.toString(),
    include_adult: 'false'
  });

  const url = `${TMDB_BASE_URL}/search/movie?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to search movies in TMDB:', error);
    throw error;
  }
};