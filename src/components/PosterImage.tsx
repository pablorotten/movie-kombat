import React from 'react';
import { getFirstPlaceholder } from '../utils/placeholderUtils';

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function PosterImage({ src, alt, className }: PosterImageProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!e.currentTarget.src.includes('placeholder')) {
      e.currentTarget.src = getFirstPlaceholder();
    }
  };

  // Check if the image source is one of our local placeholders.
  // The path for imported local images will contain '/assets/'.
  const isPlaceholder = src && src.includes('/assets/movie-placeholder');

  return (
    <img
      src={src}
      alt={alt}
      // Conditionally add the grayscale and opacity classes
      className={`${className} ${isPlaceholder ? 'filter grayscale opacity-75' : ''}`}
      onError={handleImageError}
    />
  );
}