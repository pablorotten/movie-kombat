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
// Import flag icons for popular countries
import { US, GB, CA, AU, BE, DE, FR, IT, ES, JP, KR, BR, MX, IN, CN, RU, NL, SE, NO, DK, FI } from 'country-flag-icons/react/3x2';

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

  // Static data from TMDB JSON files
  const [genres] = useState<Genre[]>(getGenres());
  const [providers] = useState<Provider[]>(getPopularProviders());
  const [regions] = useState<Region[]>(getRegions());

  // Map of country codes to flag components
  const countryFlagComponents: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'US': US,
    'GB': GB,
    'CA': CA,
    'AU': AU,
    'BE': BE,
    'DE': DE,
    'FR': FR,
    'IT': IT,
    'ES': ES,
    'JP': JP,
    'KR': KR,
    'BR': BR,
    'MX': MX,
    'IN': IN,
    'CN': CN,
    'RU': RU,
    'NL': NL,
    'SE': SE,
    'NO': NO,
    'DK': DK,
    'FI': FI
  };

  // Function to get flag component for a country code
  const getFlagComponent = (countryCode: string): React.ComponentType<{ className?: string }> | null => {
    return countryFlagComponents[countryCode] || null;
  };

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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            🎬 Discover Movies with TMDB
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Find movies by genre, streaming platform, and country using The Movie Database
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Genre *
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Streaming Platform
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any platform</option>
              {providers.map((provider) => (
                <option key={provider.provider_id} value={provider.provider_id}>
                  {provider.provider_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country *
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {regions.map((region) => {
                const FlagComponent = getFlagComponent(region.iso_3166_1);
                return (
                  <option key={region.iso_3166_1} value={region.iso_3166_1}>
                    {FlagComponent ? '🏳️' : '🌎'} {region.english_name}
                  </option>
                );
              })}
            </select>
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
    </div>
  );
}