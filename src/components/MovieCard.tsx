import { useEffect, useState } from 'react';
import Button from "../components/Button";
import PosterImage from "../components/PosterImage";
import { ProviderLogo } from "./ProviderLogo";
import { useMovies } from "../context/MovieContext";
import { getMovieProvidersForRegion, WatchProvider } from "../services/tmdbService";

const providerCache = new Map<string, WatchProvider[]>();

interface MovieCardProps {
  title: string;
  poster: string;
  imdbID: string;
  onDelete: (imdbID: string) => void;
}

export default function MovieCard({
  title,
  poster,
  imdbID,
  onDelete,
}: MovieCardProps) {
  const { selectedRegion, searchLanguage } = useMovies();
  const [providers, setProviders] = useState<WatchProvider[]>([]);

  useEffect(() => {
    const tmdbId = imdbID.startsWith('tmdb_') ? Number(imdbID.slice(5)) : Number.NaN;
    if (!Number.isFinite(tmdbId)) {
      setProviders([]);
      return;
    }

    let isActive = true;
    const cacheKey = `${tmdbId}_${selectedRegion}`;
    const cachedProviders = providerCache.get(cacheKey);
    if (cachedProviders) {
      setProviders(cachedProviders);
      return;
    }

    const loadProviders = async () => {
      try {
        const providerResults = await getMovieProvidersForRegion(tmdbId, selectedRegion);
        providerCache.set(cacheKey, providerResults);
        if (isActive) {
          setProviders(providerResults);
        }
      } catch {
        if (isActive) {
          setProviders([]);
        }
      }
    };

    loadProviders();

    return () => {
      isActive = false;
    };
  }, [imdbID, selectedRegion]);

  const providersTitle = searchLanguage === 'es-ES' ? 'Plataformas' : 'Platforms';

  return (
    <figure className="relative flex flex-col items-center justify-start p-8 pb-20 text-center bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </blockquote>

      <figcaption className="flex items-center justify-center w-full">
        {/* Container with a 2:3 aspect ratio */}
        <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-700">
<PosterImage
  className="w-full h-full object-cover"
  src={poster}
  alt={`${title} poster`}
  title={title} // Add this line
/>
        </div>
      </figcaption>

      {providers.length > 0 && (
        <div className="mt-3 w-full">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300 mb-2">
            {providersTitle}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {providers.map((provider) => (
              <div
                key={provider.provider_id}
                title={provider.provider_name}
                className="rounded-md bg-gray-100 dark:bg-gray-700 p-1"
              >
                <ProviderLogo
                  logoPath={provider.logo_path}
                  providerName={provider.provider_name}
                  className="w-6 h-6"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Button - centered at bottom of the card */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Button
          icon={
            <span role="img" aria-label="cross">
              ✘
            </span>
          }
          size="medium"
          variant="danger"
          onClick={() => onDelete(imdbID)}
        >
          Remove
        </Button>
      </div>
    </figure>
  );
}
