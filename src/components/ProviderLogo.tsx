import React from 'react';
import { getProviderLogoUrl } from '../utils/providerUtils';

interface ProviderLogoProps {
  logoPath?: string;
  providerName: string;
  className?: string;
}

/**
 * Provider logo component that displays TMDB provider logos
 */
export const ProviderLogo: React.FC<ProviderLogoProps> = ({ 
  logoPath, 
  providerName, 
  className = "w-6 h-6" 
}) => {
  if (!logoPath) {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300`}>
        {providerName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={getProviderLogoUrl(logoPath, "w154")}
      alt={`${providerName} logo`}
      className={`${className} object-contain rounded`}
      onError={(e) => {
        // Fallback to first letter if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = `${className} bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300`;
        fallback.textContent = providerName.charAt(0).toUpperCase();
        target.parentNode?.insertBefore(fallback, target);
      }}
    />
  );
};