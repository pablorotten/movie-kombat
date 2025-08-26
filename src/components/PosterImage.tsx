import { useState, useEffect } from 'react';
import { getFirstPlaceholder } from '../utils/placeholderUtils';

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function PosterImage({ src, alt, className }: PosterImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleImageError = () => {
    setImageSrc(getFirstPlaceholder());
  };

  const isPlaceholder = imageSrc && imageSrc.includes('placeholder');

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${isPlaceholder ? 'filter opacity-75 blur-[2px]' : ''}`}
      onError={handleImageError}
    />
  );
}