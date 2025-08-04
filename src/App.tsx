import { useState, useEffect } from "react";
import movieKombatLogo from "./assets/movie-kombat-logo.svg";
import "./App.css";
import MovieCard from "./components/MovieCard";
import { Movie } from "./types"; // Import our type

// IMPORTANT: Replace with your actual OMDB API Key
const API_KEY = "YOUR_OMDB_API_KEY";

function App() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedMovie, setSearchedMovie] = useState<Movie | null>(null);
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&t=${searchTerm}`
        );
        if (!response.ok) throw new Error("Network response was not ok.");
        
        const data = await response.json();

        if (data.Response === "True") {
          setSearchedMovie(data);
        } else {
          setError(data.Error);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(fetchMovie, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  function handleAddMovie() {
    // Only add if a movie was found and it's not already in the list
    if (searchedMovie && !movieList.find(m => m.imdbID === searchedMovie.imdbID)) {
      setMovieList([...movieList, searchedMovie]);
      setSearchedMovie(null); // Clear the search result
      setSearchTerm(""); // Clear the input field
    }
  }

  return (
    <>
      <header className="flex items-center p-4 bg-gray-800 text-white">
        <img src={movieKombatLogo} alt="Movie Kombat Logo" className="h-8 w-8 mr-2" />
        <h1 className="text-2xl font-bold">Movie Kombat</h1>
      </header>

      <div className="max-w-3xl mx-auto text-center mt-16">
        {/* ... header text ... */}
      </div>

      <div className="max-w-xl mx-auto">
        <div className="flex items-center max-w-sm mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="movieInput"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
              placeholder="Search movie..."
            />
          </div>
        </div>
        
        {/* Search Result Display */}
        <div id="movieInfo" className="text-center p-4">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {searchedMovie && (
            <div className="border p-4 rounded-lg shadow-md mt-4">
              <img src={searchedMovie.Poster} alt={searchedMovie.Title} className="mx-auto h-48"/>
              <h3 className="text-lg font-bold mt-2">{searchedMovie.Title} ({searchedMovie.Year})</h3>
              <button
                type="button"
                onClick={handleAddMovie}
                className="mt-4 p-2.5 w-full text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800"
              >
                Add to List
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto">
        <div
          id="movieGrid"
          className="grid mb-8 border border-gray-200 rounded-lg shadow-sm md:mb-12 md:grid-cols-4 lg:grid-cols-6 bg-white dark:bg-gray-800"
        >
          {movieList.map((movie) => (
            <MovieCard 
              key={movie.imdbID} // Use the unique imdbID for the key!
              title={movie.Title} 
              poster={movie.Poster} 
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;