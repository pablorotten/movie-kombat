import { useState, useEffect, useMemo, useRef } from "react";
import { Movie } from "../types";
import { useMovies } from "../context/MovieContext";
import MovieCard from "../components/MovieCard";
import Button from "../components/Button";
import Dialog from "../components/Dialog";
import CategorySelector from "../components/CategorySelector";
import TMDBCategorySelector from "../components/TMDBCategorySelector";
import { useNavigate, useSearchParams } from "react-router-dom";
import arrowsExpandIcon from "../assets/arrows-angle-expand.svg";
import arrowsContractIcon from "../assets/arrows-angle-contract.svg";
import { getPlaceholder } from "../utils/placeholderUtils";
import PosterImage from "../components/PosterImage";
import { searchMovies, convertTMDBToAppMovie, getMovieDetails, getTMDBImageUrl } from "../services/tmdbService";
import {
  loadLocalMovieCollections,
  shuffle,
  type LocalMovieCollection,
} from "../services/localMovieCollectionsService";

const COLLECTION_SIZE = 16;

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
  const navigate = useNavigate();
  const { addMovie, movieList, removeMovie, tmdbApiKey, searchLanguage, setMovieList } = useMovies();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasRestoredFromUrl = useRef(false);
  const previousLanguage = useRef(searchLanguage);
  const isSpanish = searchLanguage === "es-ES";
  const ui = isSpanish
    ? {
        tmdbApiRequired: "Se requiere la API key de TMDB. Configurala en ajustes.",
        loadFromUrlError: "No se pudo cargar la lista de peliculas desde la URL.",
        movieNotFound: "Pelicula no encontrada",
        unexpectedError: "Ocurrio un error inesperado: ",
        moviesNotFoundTitle: "Peliculas no encontradas",
        moviesNotFoundDescription: "No se pudieron encontrar las siguientes peliculas:",
        close: "Cerrar",
        spellingHint: "Revisa la ortografia e intentalo de nuevo.",
        searchPlaceholder: "Buscar pelicula...",
        searchMultipleMovies: "Buscar multiples peliculas",
        enterOnePerLine: "Escribe una pelicula por linea...",
        searchSingleMovie: "Buscar solo 1 pelicula",
        searchList: "Buscar lista",
        addToList: "Agregar a la lista",
        myAddedMovies: "Mis peliculas agregadas",
        deleteMovies: "Eliminar peliculas",
        refreshTitlesError: "No se pudieron actualizar los titulos al cambiar el idioma.",
        localCollections: "Colecciones de Películas",
        loadCollection: "Cargar coleccion",
        loadingCollection: "Cargando coleccion...",
        collectionNeedsApiKey: "Necesitas configurar TMDB para cargar una coleccion local.",
        collectionEmpty: "La coleccion no tiene suficientes peliculas.",
        collectionNotEnoughMatches:
          "No se pudieron encontrar 16 peliculas validas en TMDB para esta coleccion.",
        collectionLoadedNotFound: "Algunos titulos no se encontraron:",
        noCollectionsFound:
          "No se encontraron archivos .md en movies.",
      }
    : {
        tmdbApiRequired: "TMDB API key is required. Please configure it in settings.",
        loadFromUrlError: "Failed to load movie list from URL.",
        movieNotFound: "Movie not found",
        unexpectedError: "An unexpected error occurred: ",
        moviesNotFoundTitle: "Movies Not Found",
        moviesNotFoundDescription: "The following movies could not be found:",
        close: "Close",
        spellingHint: "Please check the spelling and try again.",
        searchPlaceholder: "Search movie...",
        searchMultipleMovies: "Search multiple movies",
        enterOnePerLine: "Enter one movie per line...",
        searchSingleMovie: "Search only 1 movie",
        searchList: "Search List",
        addToList: "Add to List",
        myAddedMovies: "My Added Movies",
        deleteMovies: "Delete Movies",
        refreshTitlesError: "Failed to refresh movie titles after language change.",
        localCollections: "Movie Collections",
        loadCollection: "Load collection",
        loadingCollection: "Loading collection...",
        collectionNeedsApiKey: "You need to configure TMDB before loading a local collection.",
        collectionEmpty: "This collection does not have enough movie titles.",
        collectionNotEnoughMatches:
          "Could not find 16 valid movies in TMDB for this collection.",
        collectionLoadedNotFound: "Some titles were not found:",
        noCollectionsFound:
          "No .md files were found in movies.",
      };
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchedMovies, setSearchedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useTextarea, setUseTextarea] = useState(false);
  const [notFoundMovies, setNotFoundMovies] = useState<string[]>([]);
  const [isNotFoundDialogOpen, setIsNotFoundDialogOpen] = useState(false);
  const [isCollectionNotFoundDialog, setIsCollectionNotFoundDialog] =
    useState(false);
  const [isDiscoveryExpanded, setIsDiscoveryExpanded] = useState(false);
  const [isLocalCollectionsExpanded, setIsLocalCollectionsExpanded] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const addedMoviesRef = useRef<HTMLDivElement>(null);
  const localCollections = useMemo(() => loadLocalMovieCollections(), []);

  async function handleLoadLocalCollection(collection: LocalMovieCollection) {
    if (!tmdbApiKey) {
      setError(ui.collectionNeedsApiKey);
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveCollectionId(collection.id);

    try {
      const titles = collection.movieTitles;
      if (titles.length < COLLECTION_SIZE) {
        setError(ui.collectionEmpty);
        return;
      }

      const shuffledTitles = shuffle(titles);
      const foundMovies: Movie[] = [];
      const foundIds = new Set<string>(movieList.map((movie) => movie.imdbID));
      const notFound: string[] = [];

      for (const title of shuffledTitles) {
        if (foundMovies.length >= COLLECTION_SIZE) break;

        try {
          const response = await searchMovies(tmdbApiKey, title, 1, searchLanguage);
          if (response.results && response.results.length > 0) {
            const convertedMovie = convertTMDBToAppMovie(response.results[0]);
            if (convertedMovie.Poster === "N/A") {
              convertedMovie.Poster = getPlaceholder();
            }

            if (!foundIds.has(convertedMovie.imdbID)) {
              foundIds.add(convertedMovie.imdbID);
              foundMovies.push(convertedMovie);
            }
          } else {
            notFound.push(title);
          }
        } catch {
          notFound.push(title);
        }
      }

      if (foundMovies.length < COLLECTION_SIZE) {
        setError(ui.collectionNotEnoughMatches);
        if (notFound.length > 0) {
          setNotFoundMovies(notFound.slice(0, 20));
          setIsCollectionNotFoundDialog(true);
          setIsNotFoundDialogOpen(true);
        }
        return;
      }

      setMovieList((prevMovies) => [...prevMovies, ...foundMovies]);
      if (notFound.length > 0) {
        setNotFoundMovies(notFound.slice(0, 20));
        setIsCollectionNotFoundDialog(true);
        setIsNotFoundDialogOpen(true);
      }
      navigate("/kombat");
    } catch {
      setError(ui.loadFromUrlError);
    } finally {
      setIsLoading(false);
      setActiveCollectionId(null);
    }
  }

  useEffect(() => {
    if (hasRestoredFromUrl.current) return;

    const idsParam = searchParams.get("ids");
    if (!tmdbApiKey) return;
    if (!idsParam || movieList.length > 0) {
      hasRestoredFromUrl.current = true;
      return;
    }

    const ids = Array.from(
      new Set(
        idsParam
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => Number.isFinite(id) && id > 0)
      )
    );

    if (ids.length === 0) return;

    hasRestoredFromUrl.current = true;

    const loadMoviesFromUrl = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadedMovies = await Promise.all(
          ids.map(async (id) => {
            const details = await getMovieDetails(tmdbApiKey, id, searchLanguage);
            return {
              imdbID: `tmdb_${details.id}`,
              Title: details.title,
              Year: details.release_date
                ? new Date(details.release_date).getFullYear().toString()
                : "Unknown",
              Poster: getTMDBImageUrl(details.poster_path) || getPlaceholder(),
              Type: "movie",
            };
          })
        );
        setMovieList(loadedMovies);
      } catch {
        setError(ui.loadFromUrlError);
      } finally {
        setIsLoading(false);
      }
    };

    loadMoviesFromUrl();
  }, [tmdbApiKey, searchLanguage, searchParams, movieList.length, setMovieList, ui.loadFromUrlError]);

  useEffect(() => {
    const tmdbIds = movieList
      .map((movie) => {
        if (!movie.imdbID.startsWith("tmdb_")) return null;
        return movie.imdbID.slice(5);
      })
      .filter((id): id is string => Boolean(id));

    const nextIds = tmdbIds.join(",");
    setSearchParams((prev) => {
      const currentIds = prev.get("ids") || "";
      if (nextIds === currentIds) return prev;

      const nextParams = new URLSearchParams(prev);
      if (nextIds) {
        nextParams.set("ids", nextIds);
      } else {
        nextParams.delete("ids");
      }
      return nextParams;
    }, { replace: true });
  }, [movieList, setSearchParams]);

  useEffect(() => {
    // Only re-fetch titles when the language actually changes.
    if (previousLanguage.current === searchLanguage) return;
    previousLanguage.current = searchLanguage;

    if (!tmdbApiKey || movieList.length === 0) return;

    const updateTitlesForLanguage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedMovies = await Promise.all(
          movieList.map(async (movie) => {
            if (!movie.imdbID.startsWith("tmdb_")) return movie;

            const tmdbId = parseInt(movie.imdbID.slice(5), 10);
            if (!Number.isFinite(tmdbId)) return movie;

            try {
              const details = await getMovieDetails(tmdbApiKey, tmdbId, searchLanguage);
              return {
                ...movie,
                Title: details.title || movie.Title,
                Year: details.release_date
                  ? new Date(details.release_date).getFullYear().toString()
                  : movie.Year,
                Poster: getTMDBImageUrl(details.poster_path) || movie.Poster,
              };
            } catch {
              return movie;
            }
          })
        );

        setMovieList(updatedMovies);
      } catch {
        setError(ui.refreshTitlesError);
      } finally {
        setIsLoading(false);
      }
    };

    updateTitlesForLanguage();
  }, [searchLanguage, tmdbApiKey, movieList, setMovieList, ui.refreshTitlesError]);
  // This logic is for the search results preview (top 4 results)
  useEffect(() => {
    if (useTextarea) return;
    if (searchTerm.trim() === "") {
      setSearchedMovies([]);
      setError(null);
      return;
    }
    const fetchMovie = async () => {
      if (!tmdbApiKey) {
        setError(ui.tmdbApiRequired);
        return;
      }
      setIsLoading(true);
      setError(null);
      setSearchedMovies([]);
      try {
        const response = await searchMovies(tmdbApiKey, searchTerm, 1, searchLanguage);
        if (response.results && response.results.length > 0) {
          // Get top 4 results
          const topResults = response.results.slice(0, 4);
          const convertedMovies = topResults.map(tmdbMovie => {
            const convertedMovie = convertTMDBToAppMovie(tmdbMovie);
            if (convertedMovie.Poster === 'N/A') {
              convertedMovie.Poster = getPlaceholder();
            }
            return convertedMovie;
          });
          setSearchedMovies(convertedMovies);
        } else {
          setError(ui.movieNotFound);
        }
      } catch (err) {
        setError(ui.unexpectedError + err);
      } finally {
        setIsLoading(false);
      }
    };
    const timerId = setTimeout(fetchMovie, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, tmdbApiKey, useTextarea, searchLanguage, ui.movieNotFound, ui.tmdbApiRequired, ui.unexpectedError]);

  function handleAddMovie(movie: Movie) {
    // Add the selected movie to the list
    addMovie(movie);
    // Clear search results and search term
    setSearchedMovies([]);
    setSearchTerm("");
  }

  async function handleTextareaSearch() {
    if (!tmdbApiKey) {
      setError(ui.tmdbApiRequired);
      return;
    }
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
        const response = await searchMovies(tmdbApiKey, title, 1, searchLanguage);
        if (response.results && response.results.length > 0) {
          const tmdbMovie = response.results[0];
          const convertedMovie = convertTMDBToAppMovie(tmdbMovie);
          if (convertedMovie.Poster === 'N/A') {
            convertedMovie.Poster = getPlaceholder();
          }
          addMovie(convertedMovie);
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
      setIsCollectionNotFoundDialog(false);
      setIsNotFoundDialogOpen(true);
    }
  }

  // Load movies from selected movie titles or movie objects (used by CategorySelector and TMDBCategorySelector)
  async function handleSelectMovies(movieData: string[] | Movie[]) {
    if (movieData.length === 0) return;

    // Check if we received Movie objects (from TMDB) or strings (from old selector)
    if (typeof movieData[0] === 'object') {
      // Direct movie objects from TMDB selector
      const movies = movieData as Movie[];
      movies.forEach(movie => addMovie(movie));
      
      // Collapse the discovery card and scroll to added movies
      setIsDiscoveryExpanded(false);
      setTimeout(() => {
        addedMoviesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    // Handle string titles (from old selector)
    if (!tmdbApiKey) {
      setError(ui.tmdbApiRequired);
      return;
    }
    const movieTitles = movieData as string[];
    
    setIsLoading(true);
    setError(null);
    const notFound: string[] = [];

    for (const title of movieTitles) {
      try {
        const response = await searchMovies(tmdbApiKey, title, 1, searchLanguage);
        if (response.results && response.results.length > 0) {
          const tmdbMovie = response.results[0];
          const convertedMovie = convertTMDBToAppMovie(tmdbMovie);
          if (convertedMovie.Poster === 'N/A') {
            convertedMovie.Poster = getPlaceholder();
          }
          addMovie(convertedMovie);
        } else {
          notFound.push(title);
        }
      } catch {
        notFound.push(title);
      }
    }

    setIsLoading(false);
    if (notFound.length > 0) {
      setNotFoundMovies(notFound);
      setIsCollectionNotFoundDialog(false);
      setIsNotFoundDialogOpen(true);
    }
    
    // Collapse the discovery card and scroll to added movies
    setIsDiscoveryExpanded(false);
    setTimeout(() => {
      addedMoviesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return (
    <>
      <Dialog
        open={isNotFoundDialogOpen}
        onClose={() => {
          setIsNotFoundDialogOpen(false);
          setIsCollectionNotFoundDialog(false);
        }}
        title={ui.moviesNotFoundTitle}
        onCancel={() => {
          setIsNotFoundDialogOpen(false);
          setIsCollectionNotFoundDialog(false);
        }}
        cancelText={ui.close}
      >
        <p className="mb-3">
          {isCollectionNotFoundDialog
            ? ui.collectionLoadedNotFound
            : ui.moviesNotFoundDescription}
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded">
          {notFoundMovies.map((movie, index) => (
            <li key={index} className="text-gray-800 dark:text-gray-200">
              {movie}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{ui.spellingHint}</p>
      </Dialog>

      <section className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-emerald-200 dark:border-gray-600 shadow-lg">
          <button
            onClick={() => setIsLocalCollectionsExpanded(!isLocalCollectionsExpanded)}
            className="w-full p-6 text-left hover:bg-emerald-100 dark:hover:bg-gray-600 transition-colors rounded-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                📚 {ui.localCollections}
              </h3>
              <svg
                className={`w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform ${
                  isLocalCollectionsExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isLocalCollectionsExpanded && (
            <div className="px-6 pb-6">
              {localCollections.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{ui.noCollectionsFound}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {localCollections.map((collection) => {
                    const isActive = activeCollectionId === collection.id;
                    return (
                      <div
                        key={collection.id}
                        onClick={() => handleLoadLocalCollection(collection)}
                        className="group relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          opacity: isLoading && !isActive ? 0.5 : 1,
                          pointerEvents: isLoading && !isActive ? "none" : "auto",
                        }}
                      >
                        {/* Background Image */}
                        {collection.image ? (
                          <img
                            src={collection.image}
                            alt={collection.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-900" />
                        )}

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />

                        {/* Title Text */}
                        <div className="absolute inset-0 flex items-end justify-center p-4">
                          <h3 className="text-white font-bold text-center text-sm sm:text-base leading-tight drop-shadow-lg">
                            {collection.title}
                          </h3>
                        </div>

                        {/* Loading Spinner */}
                        {isActive && isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <svg
                              className="animate-spin w-8 h-8 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

 

      {/* Movie discovery options */}
      {tmdbApiKey ? (
        // TMDB-powered discovery (preferred when API key is available)
        <TMDBCategorySelector 
          onSelectMovies={handleSelectMovies} 
          tmdbBearerToken={tmdbApiKey}
          isExpanded={isDiscoveryExpanded}
          onToggleExpanded={setIsDiscoveryExpanded}
        />
      ) : (
        // Fallback to static category selector
        <CategorySelector 
          onSelectMovies={handleSelectMovies}
          tmdbBearerToken={tmdbApiKey} 
        />
      )}

      <div className="max-w-xl mx-auto px-4">
        <div className="mt-4">
          {!useTextarea ? (
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-12"
                placeholder={ui.searchPlaceholder}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setUseTextarea(true)}
                title={ui.searchMultipleMovies}
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
                placeholder={ui.enterOnePerLine}
                rows={4}
              />
              <button
                type="button"
                className="absolute right-2 top-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setUseTextarea(false)}
                title={ui.searchSingleMovie}
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
              {ui.searchList}
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="p-4">
          {isLoading && (
            <div className="text-center">
              <LoadingSpinner />
            </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {searchedMovies.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {searchedMovies.map((movie) => (
                <div
                  key={movie.imdbID}
                  className="border rounded-lg shadow-md overflow-hidden dark:border-gray-600 flex flex-col"
                >
                  <div className="w-full aspect-[2/3] rounded-t-lg overflow-hidden bg-gray-700">
                    <PosterImage
                      className="w-full h-full object-cover"
                      src={movie.Poster}
                      alt={movie.Title}
                      title={movie.Title}
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold mb-1 line-clamp-2">
                      {movie.Title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {movie.Year}
                    </p>
                    <div className="mt-auto">
                      <Button
                        variant="success"
                        size="small"
                        onClick={() => handleAddMovie(movie)}
                        fullWidth={true}
                      >
                        {ui.addToList}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {movieList.length > 0 && (
        <div ref={addedMoviesRef} className="container mx-auto px-4 mt-12">
          <div className="flex items-center justify-start mb-6 gap-2 flex-nowrap">
            <h2 className="text-2xl font-bold whitespace-nowrap">
              {ui.myAddedMovies} ({movieList.length})
            </h2>
            <Button
              variant="danger"
              size="small"
              onClick={() => setMovieList([])}
            >
              {ui.deleteMovies}
            </Button>
          </div>
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
