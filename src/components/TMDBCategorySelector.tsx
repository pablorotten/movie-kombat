import { useState, useRef, useEffect } from 'react';
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
import { selectedCountries, getFlagComponent } from '../constants/countries';
import { ProviderLogo } from './ProviderLogo';
import { getGenreWithEmoji } from '../utils/genreUtils';

interface TMDBCategorySelectorProps {
  onSelectMovies: (movies: Movie[]) => void;
  tmdbBearerToken: string;
}

export default function TMDBCategorySelector({ onSelectMovies, tmdbBearerToken }: TMDBCategorySelectorProps) {
  const [selectedGenre, setSelectedGenre] = useState<number | ''>('');
  const [selectedProvider, setSelectedProvider] = useState<number | ''>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ES'); // Default to Spain
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  // Static data from TMDB JSON files
  const [genres] = useState<Genre[]>(getGenres());
  const [providers] = useState<Provider[]>(getPopularProviders());
  const [regions] = useState<Region[]>(getRegions());

  // Get filtered regions for only our selected countries
  const getFilteredRegions = () => {
    return regions.filter(region => selectedCountries.includes(region.iso_3166_1));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setIsProviderDropdownOpen(false);
      }
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLoadMovies = async () => {
    if (!selectedGenre || !tmdbBearerToken) {
      setError('Please select a genre and ensure TMDB API key is configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    const genreName = getSelectedGenreName();
    const providerName = getSelectedProviderName();
    const countryName = getSelectedCountryName();

    console.log(`Loading ${genreName} movies${providerName ? ` from ${providerName}` : ''} in ${countryName} (${selectedRegion})`);

    try {
      // Fetch multiple pages to get more variety
      const promises = [1, 2, 3].map(page => 
        discoverMovies(tmdbBearerToken, {
          genreId: Number(selectedGenre),
          providerId: selectedProvider ? Number(selectedProvider) : undefined,
          region: selectedRegion,
          page,
          sortBy: 'popularity.desc'
        })
      );

      const responses = await Promise.all(promises);
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
        console.log(`Successfully loaded ${appMovies.length} ${genreName} movies${providerName ? ` from ${providerName}` : ''} in ${countryName}`);
        onSelectMovies(appMovies);
      } else {
        setError(`No ${genreName.toLowerCase()} movies found${providerName ? ` on ${providerName}` : ''} in ${countryName}. Try a different genre, platform, or country.`);
      }

    } catch (err) {
      console.error('Error loading movies from TMDB:', err);
      setError('Failed to load movies. Please check your TMDB API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedGenreName = (): string => {
    if (!selectedGenre) return '';
    const genre = genres.find(g => g.id === Number(selectedGenre));
    return genre ? genre.name.toLowerCase() : '';
  };

  const getSelectedProviderName = (): string => {
    if (!selectedProvider) return '';
    const provider = providers.find(p => p.provider_id === Number(selectedProvider));
    return provider ? provider.provider_name : '';
  };

  const getSelectedCountryName = (): string => {
    const region = regions.find(r => r.iso_3166_1 === selectedRegion);
    return region ? region.english_name : selectedRegion;
  };

  const getAvailableMoviesText = (): string => {
    const genreName = getSelectedGenreName();
    const providerName = getSelectedProviderName();
    const countryName = getSelectedCountryName();

    let text = `Will randomly select up to 16 ${genreName} movies`;
    
    if (providerName) {
      text += ` from ${providerName}`;
    }
    
    text += ` in ${countryName}`;
    
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
                🎬 Discover Movies with TMDB
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Genre *
            </label>
            <div className="relative" ref={genreDropdownRef}>
              <button
                type="button"
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    if (!selectedGenre) {
                      return <span>Select genre</span>;
                    }
                    const genre = genres.find(g => g.id === Number(selectedGenre));
                    return (
                      <span>{genre ? getGenreWithEmoji(genre.name) : 'Select genre'}</span>
                    );
                  })()}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isGenreDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGenre('');
                      setIsGenreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                      !selectedGenre ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-900 dark:text-white">Select genre</span>
                  </button>
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(genre.id);
                        setIsGenreDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                        selectedGenre === genre.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <span className="text-sm text-gray-900 dark:text-white">{getGenreWithEmoji(genre.name)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Streaming Platform
            </label>
            <div className="relative" ref={providerDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    if (!selectedProvider) {
                      return <span>Any platform</span>;
                    }
                    const provider = providers.find(p => p.provider_id === Number(selectedProvider));
                    return (
                      <>
                        {provider?.logo_path && (
                          <ProviderLogo
                            logoPath={provider.logo_path}
                            providerName={provider.provider_name}
                            className="w-5 h-5"
                          />
                        )}
                        <span>{provider?.provider_name || 'Any platform'}</span>
                      </>
                    );
                  })()}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isProviderDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isProviderDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider('');
                      setIsProviderDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                      !selectedProvider ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                      *
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">Any platform</span>
                  </button>
                  {providers.map((provider) => (
                    <button
                      key={provider.provider_id}
                      type="button"
                      onClick={() => {
                        setSelectedProvider(provider.provider_id);
                        setIsProviderDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                        selectedProvider === provider.provider_id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <ProviderLogo
                        logoPath={provider.logo_path}
                        providerName={provider.provider_name}
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{provider.provider_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country *
            </label>
            <div className="relative" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const FlagComponent = getFlagComponent(selectedRegion);
                    const region = regions.find(r => r.iso_3166_1 === selectedRegion);
                    return (
                      <>
                        {FlagComponent && (
                          <FlagComponent className="w-4 h-3 object-cover rounded-sm" />
                        )}
                        <span>{region?.english_name || selectedRegion}</span>
                      </>
                    );
                  })()}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCountryDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {getFilteredRegions().map((region) => {
                    const FlagComponent = getFlagComponent(region.iso_3166_1);
                    return (
                      <button
                        key={region.iso_3166_1}
                        type="button"
                        onClick={() => {
                          setSelectedRegion(region.iso_3166_1);
                          setIsCountryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                          selectedRegion === region.iso_3166_1 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        {FlagComponent && (
                          <FlagComponent className="w-4 h-3 object-cover rounded-sm flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">{region.english_name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleLoadMovies}
              disabled={!selectedGenre || isLoading || !tmdbBearerToken}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                'Discover Movies'
              )}
            </button>
          </div>
        </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {selectedGenre && !error && !isLoading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {getAvailableMoviesText()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}