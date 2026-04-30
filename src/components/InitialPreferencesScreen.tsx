import { useEffect, useMemo, useRef, useState } from "react";
import movieKombatLogo from "../assets/movie-kombat-logo.svg";
import { getFlagComponent } from "../constants/countries";
import { ProviderLogo } from "./ProviderLogo";
import type { Provider, Region } from "../services/tmdbService";

interface InitialPreferencesUi {
  country: string;
  countryPlaceholder: string;
  platform: string;
  onboardingTitle: string;
  onboardingDescription: string;
  onboardingContinue: string;
  onboardingPlatformHint: string;
  onboardingPlatformError: string;
  onboardingCountryError: string;
}

interface InitialPreferencesScreenProps {
  ui: InitialPreferencesUi;
  filteredRegions: Region[];
  providers: Provider[];
  selectedRegion: string;
  selectedProviderIds: number[];
  setSelectedRegion: (region: string) => void;
  toggleSelectedProvider: (providerId: number) => void;
  onCompletePreferences: () => void;
}

export default function InitialPreferencesScreen({
  ui,
  filteredRegions,
  providers,
  selectedRegion,
  selectedProviderIds,
  setSelectedRegion,
  toggleSelectedProvider,
  onCompletePreferences,
}: InitialPreferencesScreenProps) {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const hasAttemptedGeoSelection = useRef(false);

  const selectedProviders = useMemo(
    () => providers.filter((provider) => selectedProviderIds.includes(provider.provider_id)),
    [providers, selectedProviderIds]
  );

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
        // Permission denied or unavailable; keep empty.
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  }, [filteredRegions, selectedRegion, setSelectedRegion]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex items-center gap-3">
                <img
                  src={movieKombatLogo}
                  alt="Movie Kombat Logo"
                  className="h-12 w-12 flex-shrink-0"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Movie Kombat</p>
                  <h1 className="text-3xl font-black sm:text-4xl">{ui.onboardingTitle}</h1>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                {ui.onboardingDescription}
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {ui.country}
                  </label>
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white transition hover:border-cyan-400/60"
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
                          <span className="text-slate-400">{ui.countryPlaceholder}</span>
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
                      <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 shadow-xl">
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
                              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-white/10 ${
                                selectedRegion === region.iso_3166_1 ? "bg-cyan-500/20 text-cyan-100" : "text-white"
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

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-semibold text-slate-200">
                      {ui.platform}
                    </label>
                    <span className="text-xs text-slate-400">
                      {selectedProviderIds.length}/{providers.length}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-slate-400">{ui.onboardingPlatformHint}</p>
                  <div className="flex flex-wrap gap-2">
                    {providers.map((provider) => {
                      const isSelected = selectedProviderIds.includes(provider.provider_id);
                      return (
                        <button
                          key={provider.provider_id}
                          type="button"
                          onClick={() => toggleSelectedProvider(provider.provider_id)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-400 text-slate-950"
                              : "border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
                          }`}
                        >
                          <ProviderLogo
                            logoPath={provider.logo_path}
                            providerName={provider.provider_name}
                            className="h-5 w-5 flex-shrink-0"
                          />
                          <span>{provider.provider_name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedProviderIds.length === 0 && (
                    <p className="mt-2 text-xs text-amber-300">{ui.onboardingPlatformError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_55%),linear-gradient(180deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.98))] p-6 sm:p-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ready</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-sm text-slate-400">{ui.country}</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {selectedRegion
                      ? filteredRegions.find((region) => region.iso_3166_1 === selectedRegion)?.english_name || selectedRegion
                      : ui.countryPlaceholder}
                  </p>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-sm text-slate-400">{ui.platform}</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {selectedProviders.length > 0
                      ? selectedProviders.map((provider) => provider.provider_name).join(", ")
                      : ui.onboardingPlatformError}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCompletePreferences}
                disabled={!selectedRegion || selectedProviderIds.length === 0}
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
