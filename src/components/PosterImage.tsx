import { useState, useEffect } from 'react';
import { getPlaceholder } from '../utils/placeholderUtils';
import { useMovies } from '../context/MovieContext';

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function PosterImage({ src, alt, className }: PosterImageProps) {
  // 2. Get the poster visibility state from the context
  const { arePostersVisible } = useMovies();

  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleImageError = () => {
    setImageSrc(getPlaceholder());
  };

  // 3. Determine if the poster was a placeholder from the start
  const isOriginallyPlaceholder = src && src.includes('placeholder');

  // 4. Decide if a placeholder should be displayed NOW
  // (Either because blind mode is on, OR because it never had a real poster)
  const shouldDisplayPlaceholder = !arePostersVisible || isOriginallyPlaceholder;

  // 5. Choose the final image URL to render
  const displaySrc = shouldDisplayPlaceholder ? getPlaceholder() : imageSrc;

  return (
    <img
      src={displaySrc} // Use the final URL
      alt={alt}
      // 6. Apply styles only if what's being shown is a placeholder
      className={`${className} ${
        shouldDisplayPlaceholder ? 'filter opacity-75 blur-[2px]' :  isOriginallyPlaceholder ? 'filter opacity-75 blur-[2px]' : ''
      }`}
      onError={handleImageError}
    />
  );
}

      // className={`${className} ${isPlaceholder ? 'filter opacity-75 blur-[2px]' : ''}`}
