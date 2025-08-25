import React from 'react';
import { getFirstPlaceholder } from '../utils/placeholderUtils';

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function PosterImage({ src, alt, className }: PosterImageProps) {
  // This function will run if the image from `src` fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // To prevent an infinite loop if the placeholder also fails,
    // we can add a check.
    if (!e.currentTarget.src.includes('placeholder')) {
      e.currentTarget.src = getFirstPlaceholder();
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  );
}