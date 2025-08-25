// This uses Vite's `import.meta.glob` feature to import all .jpeg files
// from the movie-placeholder folder as URLs.
const placeholderModules = import.meta.glob('../assets/movie-placeholder/*.jpeg', { eager: true, as: 'url' });

// This converts the object of modules into a simple array of image paths.
const placeholderImages = Object.values(placeholderModules);

export const getFirstPlaceholder = (): string => {
  if (placeholderImages.length === 0) {
    // Fallback in case no images are found
    return 'https://placehold.co/400x600/242424/646cff?text=No+Poster';
  }
  return placeholderImages[0];
};