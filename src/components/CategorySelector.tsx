import { useState } from 'react';
import { getRegions, Region, getGenres, getPopularProviders, discoverMovies, convertTMDBToAppMovie, Genre, Provider } from '../services/tmdbService';
import { Movie } from '../types';
import { countryFlagComponents } from '../constants/countries';

interface CategorySelectorProps {
  onSelectMovies: (movies: Movie[]) => void;
  tmdbBearerToken: string;
}

// Custom dropdown component for countries with flags
const CountrySelect = ({ 
  value, 
  onChange, 
  countries 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  countries: (Region & { FlagComponent: React.ComponentType<{ className?: string }> })[]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = countries.find(c => c.iso_3166_1 === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2 min-w-[140px] flex items-center gap-2 justify-between hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        {selectedCountry && (
          <>
            <selectedCountry.FlagComponent className="w-5 h-4" />
            <span>{selectedCountry.english_name}</span>
          </>
        )}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {countries.map((country) => (
              <button
                key={country.iso_3166_1}
                type="button"
                onClick={() => {
                  onChange(country.iso_3166_1);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
              >
                <country.FlagComponent className="w-5 h-4" />
                <span>{country.english_name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Get TMDB genres
const getTMDBGenres = (): Genre[] => {
  return getGenres();
};

// Get TMDB providers
const getTMDBProviders = (): Provider[] => {
  return getPopularProviders();
};

// Get popular regions for easier selection
const getPopularRegions = (): (Region & { FlagComponent: React.ComponentType<{ className?: string }> })[] => {
  const allRegions = getRegions();
  
  const popularRegionCodes = Object.keys(countryFlagComponents);
  
  return popularRegionCodes
    .map(code => {
      const region = allRegions.find(r => r.iso_3166_1 === code);
      return region ? { ...region, FlagComponent: countryFlagComponents[code] } : null;
    })
    .filter((region): region is Region & { FlagComponent: React.ComponentType<{ className?: string }> } => region !== null)
    .sort((a, b) => a.english_name.localeCompare(b.english_name));
};

export default function CategorySelector({ onSelectMovies, tmdbBearerToken }: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedProvider, setSelectedProvider] = useState<number | ''>('');
  const [selectedRegion, setSelectedRegion] = useState('ES'); // Default to Spain
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genres = getTMDBGenres();
  const providers = getTMDBProviders();
  const popularRegions = getPopularRegions();

  const handleLoadMovies = async () => {
    if (!selectedCategory || !tmdbBearerToken) {
      setError('Please select a genre and ensure TMDB API key is configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch multiple pages to get more variety
      const promises = [1, 2, 3].map(page => 
        discoverMovies(tmdbBearerToken, {
          genreId: Number(selectedCategory),
          providerId: selectedProvider ? Number(selectedProvider) : undefined,
          region: selectedRegion,
          page
        })
      );

      const responses = await Promise.all(promises);
      const allMovies = responses.flatMap(response => response.results);

      // Convert TMDB movies to app format
      const movies = allMovies.map(tmdbMovie => convertTMDBToAppMovie(tmdbMovie));

      // Randomly select up to 16 movies
      const shuffled = [...movies].sort(() => Math.random() - 0.5);
      const selectedMovies = shuffled.slice(0, 16);

      if (selectedMovies.length > 0) {
        onSelectMovies(selectedMovies);
      } else {
        setError('No movies found for the selected criteria');
      }
    } catch (err) {
      console.error('Error loading movies:', err);
      setError('Failed to load movies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Genre:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2 min-w-[150px]"
            >
              <option value="">Select genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2 min-w-[140px]"
            >
              <option value="">All Providers</option>
              {providers.map((provider) => (
                <option key={provider.provider_id} value={provider.provider_id}>
                  {provider.provider_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Region:</label>
            <CountrySelect
              value={selectedRegion}
              onChange={setSelectedRegion}
              countries={popularRegions}
            />
          </div>

          <button
            onClick={handleLoadMovies}
            disabled={!selectedCategory || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load Movies'}
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {selectedCategory && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {(() => {
              const genre = genres.find(g => g.id === selectedCategory);
              const provider = providers.find(p => p.provider_id === selectedProvider);
              const selectedRegionData = popularRegions.find(r => r.iso_3166_1 === selectedRegion);
              
              const genreName = genre ? genre.name : 'Unknown';
              const providerName = provider ? provider.provider_name : 'All Providers';
              
              return (
                <>
                  Will discover {genreName.toLowerCase()} movies{provider ? ` on ${providerName}` : ''} from{' '}
                  {selectedRegionData && (
                    <span className="inline-flex items-center gap-1">
                      <selectedRegionData.FlagComponent className="w-4 h-3 inline-block" />
                    </span>
                  )}{' '}
                  {selectedRegionData ? selectedRegionData.english_name : selectedRegion}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
