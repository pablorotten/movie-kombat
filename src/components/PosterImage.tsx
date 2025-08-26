import { useState, useEffect } from "react";
import { getPlaceholder } from "../utils/placeholderUtils";
import { useMovies } from "../context/MovieContext";

interface PosterImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function PosterImage({ src, alt, className }: PosterImageProps) {
  const { arePostersVisible } = useMovies();
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  const handleImageError = () => {
    setImageSrc(getPlaceholder());
  };

  const isPlaceholder = imageSrc === getPlaceholder() || !arePostersVisible;
  const displaySrc = isPlaceholder ? getPlaceholder() : imageSrc;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={`${className} ${
        isPlaceholder ? "filter opacity-75 blur-[2px]" : ""
      }`}
      // If the image is broken (fails to load), show the placeholder
      onError={handleImageError}
    />
  );
}
