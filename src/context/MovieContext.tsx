import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Movie } from '../types';
import { getPopularProviders } from '../services/tmdbService';

export const MAX_MOVIES_IN_LIST = 32;

const SELECTED_REGION_STORAGE_KEY = 'selectedRegion';
const SEARCH_LANGUAGE_STORAGE_KEY = 'searchLanguage';
const SELECTED_PROVIDER_IDS_STORAGE_KEY = 'selectedProviderIds';
const HAS_COMPLETED_PREFERENCES_STORAGE_KEY = 'hasCompletedPreferences';
const DEFAULT_PROVIDER_IDS = getPopularProviders()
  .filter((provider) => [8, 119, 337].includes(provider.provider_id))
  .map((provider) => provider.provider_id);

interface MovieContextType {
  movieList: Movie[];
  addMovie: (movie: Movie) => void;
  removeMovie: (imdbID: string) => void;
  setMovieList: React.Dispatch<React.SetStateAction<Movie[]>>;
  arePostersVisible: boolean;
  togglePostersVisibility: () => void;
  searchLanguage: string;
  setSearchLanguage: (language: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedProviderIds: number[];
  setSelectedProviderIds: React.Dispatch<React.SetStateAction<number[]>>;
  toggleSelectedProvider: (providerId: number) => void;
  hasCompletedPreferences: boolean;
  completePreferences: () => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movieList, setMovieListState] = useState<Movie[]>([]);
  const [arePostersVisible, setArePostersVisible] = useState(true);
  const [searchLanguage, setSearchLanguage] = useState<string>('en-US');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedProviderIds, setSelectedProviderIds] = useState<number[]>(DEFAULT_PROVIDER_IDS);
  const [hasCompletedPreferences, setHasCompletedPreferences] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(SEARCH_LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      setSearchLanguage(storedLanguage);
    }

    const storedRegion = localStorage.getItem(SELECTED_REGION_STORAGE_KEY);
    if (storedRegion) {
      setSelectedRegion(storedRegion.toUpperCase());
    }

    const storedProviderIds = localStorage.getItem(SELECTED_PROVIDER_IDS_STORAGE_KEY);
    if (storedProviderIds) {
      try {
        const parsedProviderIds = JSON.parse(storedProviderIds);
        if (Array.isArray(parsedProviderIds) && parsedProviderIds.every((providerId) => typeof providerId === 'number')) {
          setSelectedProviderIds(parsedProviderIds);
        }
      } catch {
        setSelectedProviderIds(DEFAULT_PROVIDER_IDS);
      }
    }

    if (localStorage.getItem(HAS_COMPLETED_PREFERENCES_STORAGE_KEY) === 'true') {
      setHasCompletedPreferences(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SEARCH_LANGUAGE_STORAGE_KEY, searchLanguage);
  }, [searchLanguage]);

  useEffect(() => {
    if (selectedRegion) {
      localStorage.setItem(SELECTED_REGION_STORAGE_KEY, selectedRegion);
    }
  }, [selectedRegion]);

  useEffect(() => {
    localStorage.setItem(SELECTED_PROVIDER_IDS_STORAGE_KEY, JSON.stringify(selectedProviderIds));
  }, [selectedProviderIds]);

  const addMovie = (movie: Movie) => {
    setMovieListState((prevList) => {
      if (prevList.length >= MAX_MOVIES_IN_LIST) {
        return prevList;
      }

      if (prevList.some((existingMovie) => existingMovie.imdbID === movie.imdbID)) {
        return prevList;
      }

      return [...prevList, movie];
    });
  };

  const removeMovie = (imdbID: string) => {
    setMovieListState((currentMovies) =>
      currentMovies.filter((movie) => movie.imdbID !== imdbID)
    );
  };

  const setMovieList: React.Dispatch<React.SetStateAction<Movie[]>> = (updater) => {
    setMovieListState((prevMovies) => {
      const nextMovies = typeof updater === 'function'
        ? updater(prevMovies)
        : updater;

      if (nextMovies.length <= MAX_MOVIES_IN_LIST) {
        return nextMovies;
      }

      return nextMovies.slice(0, MAX_MOVIES_IN_LIST);
    });
  };

  const togglePostersVisibility = () => {
    setArePostersVisible(prevState => !prevState);
  };

  const toggleSelectedProvider = (providerId: number) => {
    setSelectedProviderIds((currentProviderIds) =>
      currentProviderIds.includes(providerId)
        ? currentProviderIds.filter((currentProviderId) => currentProviderId !== providerId)
        : [...currentProviderIds, providerId]
    );
  };

  const completePreferences = () => {
    setHasCompletedPreferences(true);
    localStorage.setItem(HAS_COMPLETED_PREFERENCES_STORAGE_KEY, 'true');
  };

  const value = { 
    movieList, 
    addMovie, 
    removeMovie, 
    setMovieList, 
    arePostersVisible, 
    togglePostersVisibility,
    searchLanguage,
    setSearchLanguage,
    selectedRegion,
    setSelectedRegion,
    selectedProviderIds,
    setSelectedProviderIds,
    toggleSelectedProvider,
    hasCompletedPreferences,
    completePreferences
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies() {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
}