import { useState, useEffect } from "react";
import { Movie } from "../types";
import { useMovies } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";
import Button from '../components/Button';

export default function SearchPage() {
  const { addMovie, movieList, apiKey } = useMovies(); // Get apiKey from context

  // State for this page is now much simpler
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedMovie, setSearchedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch movie data
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchedMovie(null);
      setError(null);
      return;
    }
    const fetchMovie = async () => {
      setIsLoading(true);
      setError(null);
      setSearchedMovie(null);
      try {
        // The fetch call now uses the apiKey from context
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${apiKey}&t=${searchTerm}`
        );
        const data = await response.json();
        if (data.Response === "True") {
          setSearchedMovie(data);
        } else {
          setError(data.Error);
        }
      } catch (err) {
        setError("An unexpected error occurred: " + err);
      } finally {
        setIsLoading(false);
      }
    };
    const timerId = setTimeout(fetchMovie, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, apiKey]); // Depends on the shared apiKey

  function handleAddMovie() {
    if (searchedMovie) {
      addMovie(searchedMovie);
      setSearchedMovie(null);
      setSearchTerm("");
    }
  }

  return (
    <>
      <div className="max-w-3xl mx-auto text-center mt-16">
        <h1 className="text-4xl font-bold leading-tight mb-2 pb-4 relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Add your movies
          </span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></span>
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Search and add movies to start a tournament
        </p>
      </div>

      {/* The entire API Key accordion section is GONE */}

      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center w-full mx-auto mt-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Search movie..."
          />
        </div>

        <div className="text-center p-4">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {searchedMovie && (
            <div className="border p-4 rounded-lg shadow-md mt-4 dark:border-gray-600">
              <img src={searchedMovie.Poster} alt={searchedMovie.Title} className="mx-auto h-48" />
              <h3 className="text-lg font-bold mt-2">
                {searchedMovie.Title} ({searchedMovie.Year})
              </h3>
              <div className="flex justify-center p-4">
                <Button variant="success" size="medium" onClick={handleAddMovie} fullWidth={true}>
                  Add to List
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {movieList.length > 0 && (
        <div className="container mx-auto px-4 mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            My Added Movies ({movieList.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
            {movieList.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                title={movie.Title}
                poster={movie.Poster}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}