import { useState, useEffect } from "react";
import { getPlaceholder } from "../utils/placeholderUtils";
import { useMovies } from "../context/MovieContext";

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
  title?: string; // Add title prop for text poster
}

export default function PosterImage({
  src,
  alt,
  className,
  title,
}: PosterImageProps) {
  const { arePostersVisible } = useMovies();
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleImageError = () => {
    setImageSrc(getPlaceholder());
  };

  const isOriginallyPlaceholder =
    src === getPlaceholder() || src?.includes("placeholder");
  const shouldShowTextPoster =
    !arePostersVisible && title && !isOriginallyPlaceholder;
  const shouldShowBlurredPlaceholder =
    isOriginallyPlaceholder || imageSrc === getPlaceholder();

// If posters are hidden and we have a title, show text poster
if (shouldShowTextPoster) {
  // Adjust font size based on title length
  const getFontSize = (titleLength: number) => {
    if (titleLength <= 10) return 'clamp(1.5rem, 5vw, 3rem)'; // Large for short titles
    if (titleLength <= 20) return 'clamp(1.2rem, 4vw, 2.2rem)'; // Medium for medium titles
    if (titleLength <= 35) return 'clamp(1rem, 3.5vw, 1.8rem)'; // Smaller for long titles
    return 'clamp(0.75rem, 3vw, 1.5rem)'; // Smallest for very long titles
  };

  return (
    <div className={`${className} bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6`}>
      <h2 
        className="text-white font-black text-center leading-tight break-words hyphens-auto" 
        style={{ 
          fontSize: getFontSize(title.length),
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        {title.toUpperCase()}
      </h2>
    </div>
  );
}

  // Otherwise show image or placeholder
  const displaySrc = shouldShowBlurredPlaceholder ? getPlaceholder() : imageSrc;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={`${className} ${
        shouldShowBlurredPlaceholder ? "filter opacity-75 blur-[2px]" : ""
      }`}
      onError={handleImageError}
    />
  );
}
