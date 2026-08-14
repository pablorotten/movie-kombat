import { useEffect, useRef, useState } from "react";
import movieKombatLogo from "../assets/dragon-original.svg";
import { getFlagComponent } from "../constants/countries";
import { LANGUAGE_EN_US, LANGUAGE_ES_ES } from "../constants/languages";
import type { Region } from "../services/tmdbService";

interface InitialPreferencesUi {
  country: string;
  countryPlaceholder: string;
  onboardingTitle: string;
  onboardingContinue: string;
  onboardingCountryError: string;
  appLanguage: string;
}

interface InitialPreferencesScreenProps {
  ui: InitialPreferencesUi;
  filteredRegions: Region[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  searchLanguage: string;
  setSearchLanguage: (language: string) => void;
  onCompletePreferences: () => void;
}

export default function InitialPreferencesScreen({
  ui,
  filteredRegions,
  selectedRegion,
  setSelectedRegion,
  searchLanguage,
  setSearchLanguage,
  onCompletePreferences,
}: InitialPreferencesScreenProps) {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const hasAttemptedGeoSelection = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedRegion || hasAttemptedGeoSelection.current) {
      return;
    }

    hasAttemptedGeoSelection.current = true;

    if (!navigator.geolocation) {
      return;
    }

    const setRegionFromCoordinates = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`
        );
        if (!response.ok) {
          return;
        }

        const data: { address?: { country_code?: string } } = await response.json();
        const detectedCountryCode = data.address?.country_code?.toUpperCase();
        if (!detectedCountryCode) {
          return;
        }

        const isAllowedCountry = filteredRegions.some(
          (region) => region.iso_3166_1 === detectedCountryCode
        );
        if (isAllowedCountry) {
          setSelectedRegion(detectedCountryCode);
        }
      } catch {
        // Leave empty so the user can select manually.
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void setRegionFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Permission denied or unavailable --> keep empty.
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  }, [filteredRegions, selectedRegion, setSelectedRegion]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-8 sm:px-6">
        <div className="overflow-visible rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50 shadow-2xl dark:border-white/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="p-6 sm:p-10">
              <div className="mb-8 flex items-center gap-3">
                <img
                  src={movieKombatLogo}
                  alt="Movie Kombat Logo"
                  className="h-12 w-12 flex-shrink-0"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">
                    Movie Kombat
                  </p>
                  <h1 className="text-3xl font-black sm:text-4xl">{ui.onboardingTitle}</h1>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {ui.appLanguage}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setSearchLanguage(LANGUAGE_EN_US)}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        searchLanguage === LANGUAGE_EN_US
                          ? 'bg-cyan-400 text-slate-950'
                          : 'border border-slate-300 bg-white text-slate-800 hover:border-cyan-400/60 dark:border-white/10 dark:bg-black/20 dark:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchLanguage(LANGUAGE_ES_ES)}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        searchLanguage === LANGUAGE_ES_ES
                          ? 'bg-cyan-400 text-slate-950'
                          : 'border border-slate-300 bg-white text-slate-800 hover:border-cyan-400/60 dark:border-white/10 dark:bg-black/20 dark:text-white'
                      }`}
                    >
                      Español
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {ui.country}
                  </label>
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-900 transition hover:border-cyan-400/60 dark:border-white/10 dark:bg-black/20 dark:text-white"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {selectedRegion ? (
                          (() => {
                            const FlagComponent = getFlagComponent(selectedRegion);
                            const region = filteredRegions.find((currentRegion) => currentRegion.iso_3166_1 === selectedRegion);
                            return (
                              <>
                                {FlagComponent && <FlagComponent className="h-4 w-6 rounded-sm" />}
                                <span className="truncate">{region?.english_name || selectedRegion}</span>
                              </>
                            );
                          })()
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">{ui.countryPlaceholder}</span>
                        )}
                      </div>
                      <svg
                        className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isCountryDropdownOpen && (
                      <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
                        {filteredRegions.map((region) => {
                          const FlagComponent = getFlagComponent(region.iso_3166_1);
                          return (
                            <button
                              key={region.iso_3166_1}
                              type="button"
                              onClick={() => {
                                setSelectedRegion(region.iso_3166_1);
                                setIsCountryDropdownOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-white/10 ${
                                selectedRegion === region.iso_3166_1
                                  ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-100"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {FlagComponent && <FlagComponent className="h-4 w-6 rounded-sm flex-shrink-0" />}
                              <span>{region.english_name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {!selectedRegion && (
                    <p className="mt-2 text-xs text-amber-300">{ui.onboardingCountryError}</p>
                  )}
                </div>
              <button
                type="button"
                onClick={onCompletePreferences}
                disabled={!selectedRegion}
                className="mt-8 rounded-2xl bg-cyan-400 px-5 py-4 text-base font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {ui.onboardingContinue}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
