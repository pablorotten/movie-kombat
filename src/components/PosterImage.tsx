import React, { useState, useEffect } from 'react';
import { getFirstPlaceholder } from '../utils/placeholderUtils';

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function PosterImage({ src, alt, className }: PosterImageProps) {
  // Use state to manage the image source, initialized with the prop
  const [imageSrc, setImageSrc] = useState(src);

  // Keep the state in sync if the prop changes
  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleImageError = () => {
    // When an error occurs, update the state to the placeholder
    setImageSrc(getFirstPlaceholder());
  };

  // Now, the placeholder check is based on the CURRENT image source
  const isPlaceholder = imageSrc && imageSrc.includes('placeholder');

  return (
    <img
      src={imageSrc} // Use the state variable here
      alt={alt}
      className={`${className} ${isPlaceholder ? 'filter grayscale opacity-75' : ''}`}
      onError={handleImageError}
    />
  );
}