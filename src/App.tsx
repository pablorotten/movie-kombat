import { useState, useEffect } from "react";
import movieKombatLogo from "./assets/movie-kombat-logo.svg";
import "./App.css";
import MovieCard from "./components/MovieCard";
import { Movie } from "./types";

function App() {
  // State for API Key and Accordion
  const [apiKey, setApiKey] = useState<string>("");
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);

  // State for Movie Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedMovie, setSearchedMovie] = useState<Movie | null>(null);
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Effect 1: Load API key from localStorage on initial component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("omdbApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // If no key, open the accordion to prompt the user
      setIsAccordionOpen(true);
    }
  }, []);

  // Effect 2: Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("omdbApiKey", apiKey);
    }
  }, [apiKey]);

  // Effect 3: Fetch data when searchTerm or apiKey changes
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
  }, [searchTerm, apiKey]);

  function handleAddMovie() {
    if (
      searchedMovie &&
      !movieList.find((m) => m.imdbID === searchedMovie.imdbID)
    ) {
      setMovieList([...movieList, searchedMovie]);
      setSearchedMovie(null);
      setSearchTerm("");
    }
  }

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <div className="flex items-center">
          <img
            src={movieKombatLogo}
            alt="Movie Kombat Logo"
            className="h-8 w-8 mr-2"
          />
          <h1 className="text-2xl font-bold">Movie Kombat</h1>
        </div>

        {/* --- HERE IS THE NEW DUMMY BUTTON --- */}
        <button type="button" className="btn-secondary">
          Show movie list
        </button>
      </header>

      <div className="max-w-3xl mx-auto text-center mt-16">
        {/* Header text */}
      </div>

      {/* --- API Key Section --- */}
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
              id="apiKeyInput"
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
            id="movieInput"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Search movie..."
            disabled={!apiKey} // Disable input if no API key
          />
        </div>

        <div id="movieInfo" className="text-center p-4">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {searchedMovie && (
            <div className="border p-4 rounded-lg shadow-md mt-4">
              <img
                src={searchedMovie.Poster}
                alt={searchedMovie.Title}
                className="mx-auto h-48"
              />
              <h3 className="text-lg font-bold mt-2">
                {searchedMovie.Title} ({searchedMovie.Year})
              </h3>
              <button
                type="button"
                onClick={handleAddMovie}
                className="btn-primary mt-4 p-2.5 w-full text-sm"
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
              key={movie.imdbID}
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