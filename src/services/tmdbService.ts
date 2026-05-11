import genresData from '../assets/TMDB/genres.json';
import providersData from '../assets/TMDB/providers.json';
import regionsData from '../assets/TMDB/regions.json';
import { LANGUAGE_EN_US } from '../constants/languages';

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

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

interface WatchProviderRegionResult {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

interface WatchProvidersResponse {
  id: number;
  results: Record<string, WatchProviderRegionResult>;
}

// TMDB API configuration
const TMDB_PROXY_BASE_URL = '/api';
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
  const popularProviderIds = [8, 119, 337, 350, 63, 283]; // Netflix, Amazon Prime, Disney+, Apple TV+, Filmin, Crunchyroll
  return popularProviderIds
    .map(id => getProviderById(id))
    .filter((provider): provider is Provider => provider !== undefined);
};

const AMAZON_PRIME_PROVIDER_IDS = [9, 119, 613, 2100];

const CANONICAL_PROVIDER_ALIASES: Record<number, number[]> = {
  119: AMAZON_PRIME_PROVIDER_IDS,
};

const getCanonicalProviderId = (providerId: number): number => {
  for (const [canonicalId, aliases] of Object.entries(CANONICAL_PROVIDER_ALIASES)) {
    if (aliases.includes(providerId)) {
      return Number(canonicalId);
    }
  }
  return providerId;
};

const expandProviderIdsForDiscover = (providerIds: number[]): number[] => {
  const expandedProviderIds = new Set<number>();

  for (const providerId of providerIds) {
    const canonicalProviderId = getCanonicalProviderId(providerId);
    const aliases = CANONICAL_PROVIDER_ALIASES[canonicalProviderId] || [canonicalProviderId];
    for (const aliasProviderId of aliases) {
      expandedProviderIds.add(aliasProviderId);
    }
  }

  return Array.from(expandedProviderIds);
};

const DISCOVER_PROVIDER_IDS = new Set<number>([8, 63, 119, 337, 350, 283]);

const pickAllowedProviders = (providers: WatchProvider[] = []): WatchProvider[] => {
  const unique = new Map<number, WatchProvider>();
  for (const provider of providers) {
    const canonicalProviderId = getCanonicalProviderId(provider.provider_id);
    if (!DISCOVER_PROVIDER_IDS.has(canonicalProviderId) || unique.has(canonicalProviderId)) {
      continue;
    }

    const canonicalProvider = getProviderById(canonicalProviderId);
    unique.set(canonicalProviderId, {
      ...provider,
      provider_id: canonicalProviderId,
      provider_name: canonicalProvider?.provider_name || provider.provider_name,
      logo_path: canonicalProvider?.logo_path || provider.logo_path,
    });
    }

  return Array.from(unique.values());
};

export const getMovieProvidersForRegion = async (
  movieId: number,
  region: string
): Promise<WatchProvider[]> => {
  const params = new URLSearchParams({
    region: region.toUpperCase()
  });
  const url = `${TMDB_PROXY_BASE_URL}/movie/${movieId}/watch/providers?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  const data: WatchProvidersResponse = await response.json();
  const normalizedRegion = region.toUpperCase();
  const regionalProviders = data.results?.[normalizedRegion];
  if (!regionalProviders) {
    return [];
  }

  const mergedProviders = [
    ...(regionalProviders.flatrate || []),
    ...(regionalProviders.rent || []),
    ...(regionalProviders.buy || []),
  ];

  return pickAllowedProviders(mergedProviders);
};

// Convert TMDB poster path to full URL
export const getTMDBImageUrl = (posterPath: string | null): string | null => {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
};

// Discover movies by genre, provider, and country/region
export const discoverMovies = async (
  options: {
    genreIds?: number[];
    genreId?: number;
    providerIds?: number[];
    providerId?: number;
    region?: string; // ISO 3166-1 country code (e.g., 'ES' for Spain, 'US' for United States)
    page?: number;
    sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc';
    includeAdult?: boolean;
    language?: string; // Language for localized titles (e.g., LANGUAGE_EN_US, LANGUAGE_ES_ES)
  }
): Promise<TMDBDiscoverResponse> => {
  const {
    genreIds,
    genreId,
    providerIds,
    providerId,
    region = 'ES', // Default to Spain
    page = 1,
    sortBy = 'popularity.desc',
    includeAdult = false,
    language = LANGUAGE_EN_US // Default to English
  } = options;

  const params = new URLSearchParams({
    language: language,
    page: page.toString(),
    sort_by: sortBy,
    include_adult: includeAdult.toString(),
    include_video: 'false'
  });

  const normalizedGenreIds = genreIds && genreIds.length > 0
    ? genreIds
    : genreId
      ? [genreId]
      : [];

  if (normalizedGenreIds.length > 0) {
    params.append('with_genres', normalizedGenreIds.join('|'));
  }

  const normalizedProviderIds = providerIds && providerIds.length > 0
    ? providerIds
    : providerId
      ? [providerId]
      : [];

  if (normalizedProviderIds.length > 0 && region) {
    const discoverProviderIds = expandProviderIdsForDiscover(normalizedProviderIds);
    params.append('watch_region', region);
    params.append('with_watch_providers', discoverProviderIds.join('|'));
  }

  const url = `${TMDB_PROXY_BASE_URL}/discover/movie?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    
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

// Convert TMDB movie to our app's movie format
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
  movieId: number,
  language: string = LANGUAGE_EN_US
): Promise<TMDBMovieDetails> => {
  const params = new URLSearchParams({ language });
  const url = `${TMDB_PROXY_BASE_URL}/movie/${movieId}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    
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
  query: string,
  page: number = 1,
  language: string = LANGUAGE_EN_US
): Promise<TMDBDiscoverResponse> => {
  const params = new URLSearchParams({
    language: language,
    query,
    page: page.toString(),
    include_adult: 'false'
  });

  const url = `${TMDB_PROXY_BASE_URL}/search/movie?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to search movies in TMDB:', error);
    throw error;
  }
};