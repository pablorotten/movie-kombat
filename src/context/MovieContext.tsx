import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Movie } from '../types';

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
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [arePostersVisible, setArePostersVisible] = useState(true);
  const [searchLanguage, setSearchLanguage] = useState<string>('en-US');
  const [selectedRegion, setSelectedRegion] = useState<string>('ES');

  useEffect(() => {
    const storedLanguage = localStorage.getItem("searchLanguage");
    if (storedLanguage) {
      setSearchLanguage(storedLanguage);
    }

    const storedRegion = localStorage.getItem("selectedRegion");
    if (storedRegion) {
      setSelectedRegion(storedRegion.toUpperCase());
      return;
    }

    const localeRegion = navigator.language?.split('-')?.[1]?.toUpperCase();
    if (localeRegion) {
      setSelectedRegion(localeRegion);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("searchLanguage", searchLanguage);
  }, [searchLanguage]);

  useEffect(() => {
    localStorage.setItem("selectedRegion", selectedRegion);
  }, [selectedRegion]);

  const addMovie = (movie: Movie) => {
    if (!movieList.find((m) => m.imdbID === movie.imdbID)) {
      setMovieList((prevList) => [...prevList, movie]);
    }
  };

  const removeMovie = (imdbID: string) => {
    setMovieList((currentMovies) =>
      currentMovies.filter((movie) => movie.imdbID !== imdbID)
    );
  };

  const togglePostersVisibility = () => {
    setArePostersVisible(prevState => !prevState);
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
    setSelectedRegion
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