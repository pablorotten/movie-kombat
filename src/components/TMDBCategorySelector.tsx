import { useState } from 'react';
import { 
  getGenres, 
  getPopularProviders, 
  getRegions, 
  discoverMovies,
  convertTMDBToAppMovie,
  Genre,
  Provider,
  Region
} from '../services/tmdbService';
import { getPlaceholder } from '../utils/placeholderUtils';
import { Movie } from '../types';
import { ProviderLogo } from './ProviderLogo';
import { getGenreWithEmoji } from '../utils/genreUtils';
import { useMovies } from '../context/MovieContext';
import tmdbLogo from '../assets/TMDB.svg';

interface TMDBCategorySelectorProps {
  onSelectMovies: (movies: Movie[]) => void;
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
}

export default function TMDBCategorySelector({ onSelectMovies, isExpanded: controlledExpanded, onToggleExpanded }: TMDBCategorySelectorProps) {
  const {
    searchLanguage,
    selectedRegion,
    selectedProviderIds,
    toggleSelectedProvider,
  } = useMovies();
  const isSpanish = searchLanguage === 'es-ES';
  const ui = isSpanish
    ? {
      selectGenreAndApi: 'Selecciona un genero para continuar',
        selectCountry: 'Selecciona un pais para continuar',
        selectPlatform: 'Selecciona al menos una plataforma',
        noMoviesFound: 'No se encontraron peliculas',
        noMoviesFoundHint: 'Prueba otro genero, plataforma o pais.',
        loadMoviesError: 'No se pudieron cargar las peliculas. Revisa tu API key de TMDB e intentalo de nuevo.',
        discoverMovies: 'Descubrir peliculas con TMDB',
        genre: 'Genero',
        selectGenre: 'Selecciona al menos un genero',
        selectedGenres: 'Generos seleccionados',
        platform: 'Plataforma de streaming',
        loading: 'Cargando...',
        discoverButton: 'Descubrir peliculas',
        willSelectUpTo: 'Se seleccionaran aleatoriamente hasta 16 peliculas de',
        from: 'de',
        in: 'en',
        poweredByTmdb: 'Impulsado por TMDB',
        tmdbAttribution: 'Este producto utiliza la API de TMDB pero no esta avalado ni certificado por TMDB.',
      }
    : {
      selectGenreAndApi: 'Please select a genre to continue',
        selectCountry: 'Please select a country to continue',
        selectPlatform: 'Please select at least one platform',
        noMoviesFound: 'No movies found',
        noMoviesFoundHint: 'Try a different genre, platform, or country.',
        loadMoviesError: 'Failed to load movies. Please check your TMDB API key and try again.',
        discoverMovies: 'Discover Movies with TMDB',
        genre: 'Genre',
        selectGenre: 'Select at least one genre',
        selectedGenres: 'Selected genres',
        platform: 'Streaming Platform',
        loading: 'Loading...',
        discoverButton: 'Discover Movies',
        willSelectUpTo: 'Will randomly select up to 16',
        from: 'from',
        in: 'in',
        poweredByTmdb: 'Powered by TMDB',
        tmdbAttribution: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
      };
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const setIsExpanded = (expanded: boolean) => {
    if (onToggleExpanded) {
      onToggleExpanded(expanded);
    } else {
      setInternalExpanded(expanded);
    }
  };
  // Static data from TMDB JSON files
  const [genres] = useState<Genre[]>(getGenres());
  const [providers] = useState<Provider[]>(getPopularProviders());
  const [regions] = useState<Region[]>(getRegions());

  const handleLoadMovies = async () => {
    if (selectedGenreIds.length === 0) {
      setError(ui.selectGenreAndApi);
      return;
    }

    if (!selectedRegion) {
      setError(ui.selectCountry);
      return;
    }

    if (selectedProviderIds.length === 0) {
      setError(ui.selectPlatform);
      return;
    }

    setIsLoading(true);
    setError(null);

    const genreNames = getSelectedGenreNames();
    const providerNames = getSelectedProviderNames();
    const countryName = getSelectedCountryName();

    console.log(`Loading ${genreNames.join(', ')} movies from ${providerNames.join(', ')} in ${countryName} (${selectedRegion})`);

    try {
      // Fetch multiple pages to get more variety
      const requests = [1, 2, 3].map(page => 
        discoverMovies({
          genreIds: selectedGenreIds,
          providerIds: selectedProviderIds,
          region: selectedRegion,
          page,
          sortBy: 'popularity.desc',
          language: searchLanguage
        })
      );

      const responses = await Promise.all(requests);
      const allMovies = responses.flatMap(response => response.results);

      // Remove duplicates and get up to 20 movies for variety
      const uniqueMovies = Array.from(
        new Map(allMovies.map(movie => [movie.id, movie])).values()
      ).slice(0, 20);

      // Randomly select up to 16 movies
      const shuffledMovies = [...uniqueMovies].sort(() => Math.random() - 0.5);
      const selectedMovies = shuffledMovies.slice(0, 16);

      // Convert TMDB movies to app format
      const appMovies = selectedMovies.map(movie => {
        const appMovie = convertTMDBToAppMovie(movie);
        
        // Use placeholder if no poster
        if (!appMovie.Poster || appMovie.Poster === 'N/A') {
          appMovie.Poster = getPlaceholder();
        }

        return appMovie;
      });

      if (appMovies.length > 0) {
        console.log(`Successfully loaded ${appMovies.length} ${genreNames.join(', ')} movies from ${providerNames.join(', ')} in ${countryName}`);
        onSelectMovies(appMovies);
      } else {
        setError(`${ui.noMoviesFound}: ${genreNames.join(', ').toLowerCase()} ${ui.from} ${providerNames.join(', ')} ${ui.in} ${countryName}. ${ui.noMoviesFoundHint}`);
      }

    } catch (err) {
      console.error('Error loading movies from TMDB:', err);
      setError(ui.loadMoviesError);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectedGenre = (genreId: number) => {
    setSelectedGenreIds((currentGenreIds) =>
      currentGenreIds.includes(genreId)
        ? currentGenreIds.filter((currentGenreId) => currentGenreId !== genreId)
        : [...currentGenreIds, genreId]
    );
  };

  const getSelectedGenreNames = (): string[] => {
    return genres
      .filter((genre) => selectedGenreIds.includes(genre.id))
      .map((genre) => genre.name);
  };

  const getSelectedProviderNames = (): string[] => {
    return providers
      .filter((provider) => selectedProviderIds.includes(provider.provider_id))
      .map((provider) => provider.provider_name);
  };

  const getSelectedCountryName = (): string => {
    const region = regions.find(r => r.iso_3166_1 === selectedRegion);
    return region ? region.english_name : selectedRegion;
  };

  const getAvailableMoviesText = (): string => {
    const genreNames = getSelectedGenreNames();
    const providerNames = getSelectedProviderNames();
    const countryName = getSelectedCountryName();

    let text = `${ui.willSelectUpTo} ${genreNames.join(', ')} ${isSpanish ? 'peliculas' : 'movies'}`;

    text += ` ${ui.from} ${providerNames.join(', ')}`;
    
    text += ` ${ui.in} ${countryName}`;
    
    return text;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 mt-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600 shadow-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 text-left hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                🎬 {ui.discoverMovies}
              </h3>

            </div>
            <svg
              className={`w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 mb-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {ui.genre} *
            </label>
            <div className="rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => {
                  const isSelected = selectedGenreIds.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => {
                        setError(null);
                        toggleSelectedGenre(genre.id);
                      }}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{getGenreWithEmoji(genre.name)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedGenreIds.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                {ui.selectedGenres}: {getSelectedGenreNames().join(', ')}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {ui.platform}
            </label>
            <div className="rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-700">
              <div className="flex flex-wrap gap-2">
                {providers.map((provider) => {
                  const isSelected = selectedProviderIds.includes(provider.provider_id);
                  return (
                    <button
                      key={provider.provider_id}
                      type="button"
                      title={provider.provider_name}
                      aria-label={provider.provider_name}
                      onClick={() => {
                        setError(null);
                        toggleSelectedProvider(provider.provider_id);
                      }}
                      className={`inline-flex items-center justify-center rounded-full border p-2 transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <ProviderLogo
                        logoPath={provider.logo_path}
                        providerName={provider.provider_name}
                        className="h-5 w-5 flex-shrink-0"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleLoadMovies}
              disabled={selectedGenreIds.length === 0 || !selectedRegion || selectedProviderIds.length === 0 || isLoading}
              className="self-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg text-xs transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {ui.loading}
                </div>
              ) : (
                ui.discoverButton
              )}
            </button>
          </div>
        </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {selectedGenreIds.length > 0 && !error && !isLoading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {getAvailableMoviesText()}
                </div>
              </div>
            )}

            <div className="mt-3 border border-blue-200 dark:border-blue-800 bg-white/70 dark:bg-gray-800/60 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span>{ui.poweredByTmdb}</span>
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center hover:opacity-90 transition-opacity"
                    aria-label="TMDB"
                  >
                    <img src={tmdbLogo} alt="TMDB" className="h-4 w-auto" />
                  </a>
                </div>
                <span className="hidden md:block text-right">{ui.tmdbAttribution}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}