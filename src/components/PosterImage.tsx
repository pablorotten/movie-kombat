import React from 'react';
import { getRandomPlaceholder } from '../utils/placeholderUtils';

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function PosterImage({ src, alt, className }: PosterImageProps) {
  // This function will run ONLY if the image from `src` fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Replace the broken image source with a random placeholder
    e.currentTarget.src = getRandomPlaceholder();
  };

  // The component now directly uses the `src` prop.
  // We trust that the placeholder was already assigned when the movie was added.
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
}