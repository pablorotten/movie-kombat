import { useState, useEffect } from "react";
import { Movie } from "../types";
import { useMovies } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";
import Button from "../components/Button";
import Dialog from "../components/Dialog";
import arrowsExpandIcon from "../assets/arrows-angle-expand.svg";
import arrowsContractIcon from "../assets/arrows-angle-contract.svg";
import { getPlaceholder } from "../utils/placeholderUtils";
import PosterImage from "../components/PosterImage";

const LoadingSpinner = () => (
  <div role="status" className="flex justify-center items-center">
    <svg
      aria-hidden="true"
      className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

export default function SearchPage() {
  const { addMovie, movieList, apiKey, removeMovie } = useMovies();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedMovie, setSearchedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useTextarea, setUseTextarea] = useState(false);
  const [notFoundMovies, setNotFoundMovies] = useState<string[]>([]);
  const [isNotFoundDialogOpen, setIsNotFoundDialogOpen] = useState(false);

  // This logic is for the single search result preview
  useEffect(() => {
    if (useTextarea) return;
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
          if (data.Poster === "N/A") {
            data.Poster = getPlaceholder();
          }
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
  }, [searchTerm, apiKey, useTextarea]);

  function handleAddMovie() {
    if (searchedMovie) {
      // This is the correct logic for the 'Add to List' button.
      // It uses the poster from 'searchedMovie', which might already be a placeholder.
      addMovie(searchedMovie);
      setSearchedMovie(null);
      setSearchTerm("");
    }
  }

  async function handleTextareaSearch() {
    const titles = searchTerm
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (titles.length === 0) return;

    setIsLoading(true);
    setError(null);
    const notFound: string[] = [];

    for (const title of titles) {
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(
            title
          )}`
        );
        const data = await response.json();
        if (data.Response === "True") {
          if (data.Poster === "N/A") {
            data.Poster = getPlaceholder();
          }
          addMovie(data);
        } else {
          notFound.push(title);
        }
      } catch {
        notFound.push(title);
      }
    }
    setIsLoading(false);
    setSearchTerm("");
    setUseTextarea(false);
    if (notFound.length > 0) {
      setNotFoundMovies(notFound);
      setIsNotFoundDialogOpen(true);
    }
  }

  return (
    <>
      <Dialog
        open={isNotFoundDialogOpen}
        onClose={() => setIsNotFoundDialogOpen(false)}
        title="Movies Not Found"
        onCancel={() => setIsNotFoundDialogOpen(false)}
        cancelText="Close"
      >
        <p className="mb-3">The following movies could not be found:</p>
        <ul className="list-disc list-inside space-y-1 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded">
          {notFoundMovies.map((movie, index) => (
            <li key={index} className="text-gray-800 dark:text-gray-200">
              {movie}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Please check the spelling and try again.
        </p>
      </Dialog>

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

      <div className="max-w-xl mx-auto px-4">
        <div className="w-full mx-auto mt-4">
          {!useTextarea ? (
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-12"
                placeholder="Search movie..."
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setUseTextarea(true)}
                title="Search multiple movies"
              >
                <img
                  src={arrowsExpandIcon}
                  alt="List mode"
                  className="w-5 h-5"
                />
              </button>
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-12 resize-none"
                placeholder="Enter one movie per line..."
                rows={4}
              />
              <button
                type="button"
                className="absolute right-2 top-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setUseTextarea(false)}
                title="Search only 1 movie"
              >
                <img
                  src={arrowsContractIcon}
                  alt="Single mode"
                  className="w-5 h-5"
                />
              </button>
            </div>
          )}
        </div>
        {useTextarea && (
          <div className="flex justify-center mt-2">
            <Button
              variant="success"
              size="small"
              onClick={handleTextareaSearch}
            >
              Search List
            </Button>
          </div>
        )}

        <div className="text-center p-4">
          {isLoading && <LoadingSpinner />}
          {error && <p className="text-red-500">{error}</p>}
          {searchedMovie && (
            <div className="border p-4 rounded-lg shadow-md mt-4 dark:border-gray-600">
              <div className="w-48 mx-auto aspect-[2/3] rounded-lg overflow-hidden bg-gray-700">
                <PosterImage
                  className="w-full h-full object-cover"
                  src={searchedMovie.Poster}
                  alt={searchedMovie.Title}
  title={searchedMovie.Title}
                />
              </div>
              <h3 className="text-lg font-bold mt-2">
                {searchedMovie.Title} ({searchedMovie.Year})
              </h3>
              <div className="flex justify-center p-4">
                <Button
                  variant="success"
                  size="medium"
                  onClick={handleAddMovie}
                  fullWidth={true}
                >
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {movieList.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                title={movie.Title}
                poster={movie.Poster}
                imdbID={movie.imdbID}
                onDelete={removeMovie}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
