// Shared country flag components for the application
import { BE, DE, ES, FR, GB, NL, US, IT } from "country-flag-icons/react/3x2";

// Map of country codes to flag components (alphabetically by country name)
export const countryFlagComponents: {
  [key: string]: React.ComponentType<{ className?: string }>;
} = {
  BE: BE,
  FR: FR,
  GB: GB,
  DE: DE,
  NL: NL,
  ES: ES,
  US: US,
  IT: IT,
};

// Selected countries list
export const selectedCountries = ["BE", "FR", "DE", "GB", "NL", "ES", "US", "IT"];

// Function to get flag component for a country code
export const getFlagComponent = (
  countryCode: string
): React.ComponentType<{ className?: string }> | null => {
  return countryFlagComponents[countryCode] || null;
};
