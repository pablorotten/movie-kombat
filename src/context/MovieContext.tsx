import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Movie } from '../types';

interface MovieContextType {
  movieList: Movie[];
  addMovie: (movie: Movie) => void;
  removeMovie: (imdbID: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  setMovieList: React.Dispatch<React.SetStateAction<Movie[]>>;
  arePostersVisible: boolean;
  togglePostersVisibility: () => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const DEFAULT_API_KEY = "b5875a85";
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [arePostersVisible, setArePostersVisible] = useState(true);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("omdbApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("omdbApiKey", apiKey);
  }, [apiKey]);

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

  const value = { movieList, addMovie, removeMovie, setApiKey, setMovieList, apiKey, arePostersVisible, togglePostersVisibility };

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