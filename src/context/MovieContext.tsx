import { createContext, useState, useContext, ReactNode } from 'react';
import { Movie } from '../types'; // Make sure this path is correct

// Define the shape of our shared data
interface MovieContextType {
  movieList: Movie[];
  addMovie: (movie: Movie) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

// This component will hold the state and provide it to our app
export function MovieProvider({ children }: { children: ReactNode }) {
  const [movieList, setMovieList] = useState<Movie[]>([]);

  const addMovie = (movie: Movie) => {
    // Check for duplicates before adding
    if (!movieList.find((m) => m.imdbID === movie.imdbID)) {
      setMovieList((prevList) => [...prevList, movie]);
    }
  };

  const value = { movieList, addMovie };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
}

// This is a helper hook to make it easy to access the data
export function useMovies() {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
}