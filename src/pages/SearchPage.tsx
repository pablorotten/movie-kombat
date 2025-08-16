import { useState, useEffect } from "react";
import { Movie } from "../types";
import { useMovies } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";
import Button from '../components/Button'; // <-- ADD THIS LINE

export default function SearchPage() {
  const { addMovie, movieList } = useMovies(); // Also get the movieList

  // State for this page
  const [apiKey, setApiKey] = useState<string>("");
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedMovie, setSearchedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to load API key from localStorage
  useEffect(() => {
    const storedApiKey = localStorage.getItem("omdbApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setIsAccordionOpen(true);
    }
  }, []);

  // Effect to save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("omdbApiKey", apiKey);
    }
  }, [apiKey]);

  // Effect to fetch movie data
  useEffect(() => {
    if (!apiKey) {
      setError("Please enter your OMDB API key.");
      return;
    }
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
          `https://www.omdbapi.com/?apikey=${apiKey}&t=${searchTerm}`
        );
        const data = await response.json();
        if (data.Response === "True") {
          setSearchedMovie(data);
        } else {
          setError(data.Error);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    const timerId = setTimeout(fetchMovie, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, apiKey]);

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
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2 pb-4 relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Add your movies
          </span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></span>
        </h1>
        <p className="text-lg text-white-800 mb-8">
          Search and add up to 8 🎬 movies
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4">
        <button
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full flex justify-between items-center p-3 text-slate-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200 font-semibold"
        >
          <span>OMDB API key</span>
          <span
            className={`transform transition-transform duration-300 ${
              isAccordionOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
        {isAccordionOpen && (
          <div className="pb-4">
            <input
              type="password"
              placeholder="Enter your OMDB API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4">
        <div className="flex items-center w-full mx-auto mt-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Search movie..."
            disabled={!apiKey}
          />
        </div>

        <div className="text-center p-4">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {searchedMovie && (
            <div className="border p-4 rounded-lg shadow-md mt-4 dark:border-gray-600">
              <img
                src={searchedMovie.Poster}
                alt={searchedMovie.Title}
                className="mx-auto h-48"
              />
              <h3 className="text-lg font-bold mt-2">
                {searchedMovie.Title} ({searchedMovie.Year})
              </h3>
              <Button
                variant="success"
                size="large"
                onClick={handleAddMovie}
                fullWidth={true}
              >
                Add to List
              </Button>
            </div>
          )}
        </div>
        {/* <div className="flex justify-center p-4">
          <Button
            variant="primary"
            size="large"
            fullWidth={true}
          >
            Test
          </Button>
        </div> */}
      </div>
      {/* Add this entire block to the bottom of SearchPage.tsx */}

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
