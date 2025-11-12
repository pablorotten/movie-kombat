// Utility functions for provider logos

/**
 * Constructs the full URL for a provider logo
 * @param logoPath - The logo path from TMDB (e.g., "/kO2SWXvDCHAquaUuTJBuZkTBAuU.jpg")
 * @param size - The size variant ("original" or "w154", "w300", etc.) 
 * @returns Full URL to the provider logo
 */
export const getProviderLogoUrl = (logoPath: string, size: string = "w154"): string => {
  if (!logoPath) return '';
  return `https://image.tmdb.org/t/p/${size}${logoPath}`;
};