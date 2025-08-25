const placeholderModules = import.meta.glob('../assets/movie-placeholder/*.jpeg', { eager: true, as: 'url' });

// Converts the object of modules into a simple array of image paths.
const placeholderImages = Object.values(placeholderModules);

export const getFirstPlaceholder = (): string => {
  if (placeholderImages.length === 0) {
    // Fallback in case no images are found
    return 'https://placehold.co/400x600/242424/646cff?text=No+Poster';
  }
  return placeholderImages[0];
};