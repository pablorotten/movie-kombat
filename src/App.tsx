import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import movieKombatLogo from "./assets/dragon-original.svg";
import SearchPage from "./pages/SearchPage";
import KombatPage from "./pages/KombatPage";
import Dialog from "./components/Dialog";
import InitialPreferencesScreen from "./components/InitialPreferencesScreen";
import { ProviderLogo } from "./components/ProviderLogo";
import { useMovies } from "./context/MovieContext";
import { LANGUAGE_EN_US, LANGUAGE_ES_ES } from "./constants/languages";
import "./App.css";
import tmdbLogo from "./assets/TMDB.svg";
// // import ApiKeyIcon from "./assets/api-key.svg";
import { getPopularProviders, getRegions } from "./services/tmdbService";
import { getFlagComponent, selectedCountries } from "./constants/countries";
import {
  getKombatStartRequirement,
  selectRandomMovies,
} from "./utils/kombatUtils";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    movieList,
    setMovieList,
    arePostersVisible,
    togglePostersVisibility,
    searchLanguage,
    setSearchLanguage,
    selectedRegion,
    setSelectedRegion,
    selectedProviderIds,
    toggleSelectedProvider,
    hasCompletedPreferences,
    completePreferences,
  } = useMovies();
  const isSpanish = searchLanguage === LANGUAGE_ES_ES;
  const ui = isSpanish
    ? {
        startNewKombatTitle: "Empezar nuevo Kombat?",
        startNewKombatWarning: "Se perderá el progreso del Kombat actual",
        confirmStartNew: "Sí, empezar nuevo",
        cancel: "Cancelar",
        blindPosters: "Ocultar posters",
        showPosters: "Mostrar posters",
        startKombat: "Empezar Kombat",
        needMoreMoviesTitle: (missingMovies: number) =>
          missingMovies === 4
            ? "Agrega peliculas para empezar el Kombat"
            : `Agrega ${missingMovies} pelicula${missingMovies === 1 ? "" : "s"} para empezar!`,
        pick4Title: "Empezar Kombat?",
        pick4Message: "Se seleccionaran 4 peliculas al azar.",
        pick4Confirm: "OK",
        pick8Title: "Empezar Kombat?",
        pick8Message: "Se seleccionaran 8 peliculas al azar.",
        pick8Confirm: "OK",
        pick16Title: "Empezar Kombat?",
        pick16Message: "Se seleccionaran 16 peliculas al azar.",
        pick16Confirm: "OK",
        understood: "Entendido",
        country: "Pais",
        countryPlaceholder: "Selecciona un pais",
        platform: "Plataformas",
        platformPlaceholder: "Selecciona plataformas",
        selectedPlatforms: "Plataformas seleccionadas",
        onboardingTitle: "Antes de empezar",
        onboardingDescription:
          "Elige tu pais y las plataformas que quieres usar para descubrir peliculas.",
        onboardingContinue: "Continuar",
        onboardingPlatformHint: "Toca para seleccionar o quitar plataformas.",
        onboardingPlatformError: "Selecciona al menos una plataforma.",
        onboardingCountryError: "Selecciona un pais para continuar.",
        tmdbDataSource: "Datos proporcionados por",
        tmdbAttribution:
          "Este producto utiliza la API de TMDB pero no esta avalado ni certificado por TMDB.",
        appLanguage: "Idioma de la app:",
      }
    : {
        startNewKombatTitle: "Start New Kombat?",
        startNewKombatWarning: "Current Kombat progress will be lost",
        confirmStartNew: "Yes, Start New",
        cancel: "Cancel",
        blindPosters: "Blind Posters",
        showPosters: "Show Posters",
        startKombat: "Start Kombat",
        needMoreMoviesTitle: (missingMovies: number) =>
          missingMovies === 4
            ? "Add movies to start the Kombat"
            : `Add ${missingMovies} movie${missingMovies === 1 ? "" : "s"} to start!`,
        pick4Title: "Start Kombat?",
        pick4Message: "4 movies will be randomly selected.",
        pick4Confirm: "OK",
        pick8Title: "Start Kombat?",
        pick8Message: "8 movies will be randomly selected.",
        pick8Confirm: "OK",
        pick16Title: "Start Kombat?",
        pick16Message: "16 movies will be randomly selected.",
        pick16Confirm: "OK",
        understood: "Understood",
        country: "Country",
        countryPlaceholder: "Select a country",
        platform: "Platforms",
        platformPlaceholder: "Select platforms",
        selectedPlatforms: "Selected platforms",
        onboardingTitle: "Before you start",
        onboardingDescription:
          "Choose your country and the streaming platforms you want to use for discovery.",
        onboardingContinue: "Continue",
        onboardingPlatformHint: "Tap to select or unselect platforms.",
        onboardingPlatformError: "Select at least one platform.",
        onboardingCountryError: "Select a country to continue.",
        tmdbDataSource: "Data provided by",
        tmdbAttribution:
          "This product uses the TMDB API but is not endorsed or certified by TMDB.",
        appLanguage: "App language:",
      };
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isNotEnoughMoviesDialogOpen, setIsNotEnoughMoviesDialogOpen] =
    useState(false);
  const [isPickMoviesDialogOpen, setIsPickMoviesDialogOpen] = useState<
    null | "4" | "8" | "16"
  >(null);
  const [shouldAutoStartKombat, setShouldAutoStartKombat] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const platformDropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const regions = useMemo(() => getRegions(), []);
  const providers = useMemo(() => getPopularProviders(), []);
  const filteredRegions = useMemo(
    () =>
      regions.filter((region) => selectedCountries.includes(region.iso_3166_1)),
    [regions],
  );

  const selectedProviderNames = useMemo(
    () =>
      providers.filter((provider) =>
        selectedProviderIds.includes(provider.provider_id),
      ),
    [providers, selectedProviderIds],
  );
  const kombatStartRequirement = useMemo(
    () => getKombatStartRequirement(movieList.length),
    [movieList.length],
  );
  const canStartKombat = movieList.length >= 4;

  // Add this function to handle kombat start with shuffle
  const handleStartKombat = useCallback(() => {
    // Check if we're already on the kombat page
    if (location.pathname === "/kombat") {
      setIsConfirmDialogOpen(true);
      return;
    }

    // Normal flow: go to kombat page
    navigate("/kombat");
  }, [location.pathname, navigate]);

  const handleConfirmNewKombat = () => {
    // Clear all movies and go back to search page
    setMovieList([]);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
      if (
        platformDropdownRef.current &&
        !platformDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPlatformDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (Math.abs(delta) < 6) {
        return;
      }

      if (currentScrollY <= 0) {
        setIsHeaderVisible(true);
      } else if (delta > 0 && currentScrollY > 80) {
        setIsHeaderVisible(false);
      } else if (delta < 0) {
        setIsHeaderVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!shouldAutoStartKombat) {
      return;
    }

    // Auto-start only when we reach a valid bracket size (ready status)
    if (kombatStartRequirement.status !== "ready") {
      return;
    }

    setShouldAutoStartKombat(false);
    handleStartKombat();
  }, [handleStartKombat, kombatStartRequirement, shouldAutoStartKombat]);

  const handleStartButtonClick = () => {
    if (kombatStartRequirement.status === "add-movies") {
      setIsNotEnoughMoviesDialogOpen(true);
      return;
    }

    if (kombatStartRequirement.status === "pick-4") {
      setIsPickMoviesDialogOpen("4");
      return;
    }

    if (kombatStartRequirement.status === "pick-8") {
      setIsPickMoviesDialogOpen("8");
      return;
    }

    if (kombatStartRequirement.status === "pick-16") {
      setIsPickMoviesDialogOpen("16");
      return;
    }

    handleStartKombat();
  };

  const handleConfirmRandomSelection = (targetCount: 4 | 8 | 16) => {
    setMovieList((currentMovies) =>
      selectRandomMovies(currentMovies, targetCount),
    );
    setIsPickMoviesDialogOpen(null);
    setShouldAutoStartKombat(true);
  };

  const handleCompletePreferences = () => {
    if (!selectedRegion) {
      return;
    }

    if (selectedProviderIds.length === 0) {
      return;
    }

    completePreferences();
  };

  if (!hasCompletedPreferences) {
    return (
      <InitialPreferencesScreen
        ui={ui}
        filteredRegions={filteredRegions}
        providers={providers}
        selectedRegion={selectedRegion}
        selectedProviderIds={selectedProviderIds}
        setSelectedRegion={setSelectedRegion}
        toggleSelectedProvider={toggleSelectedProvider}
        searchLanguage={searchLanguage}
        setSearchLanguage={setSearchLanguage}
        onCompletePreferences={handleCompletePreferences}
      />
    );
  }

  return (
    <>
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        title={ui.startNewKombatTitle}
        onConfirm={handleConfirmNewKombat}
        onCancel={() => setIsConfirmDialogOpen(false)}
        confirmText={ui.confirmStartNew}
        cancelText={ui.cancel}
        confirmVariant="danger"
      >
        <p>{ui.startNewKombatWarning}</p>
      </Dialog>

      <Dialog
        open={isNotEnoughMoviesDialogOpen}
        onClose={() => setIsNotEnoughMoviesDialogOpen(false)}
        title={ui.needMoreMoviesTitle(
          kombatStartRequirement.status === "add-movies"
            ? kombatStartRequirement.missingMovies
            : 0,
        )}
        onCancel={() => setIsNotEnoughMoviesDialogOpen(false)}
        cancelText={ui.understood}
      />

      <Dialog
        open={isPickMoviesDialogOpen === "4"}
        onClose={() => setIsPickMoviesDialogOpen(null)}
        title={ui.pick4Title}
        onConfirm={() => handleConfirmRandomSelection(4)}
        onCancel={() => setIsPickMoviesDialogOpen(null)}
        confirmText={ui.pick4Confirm}
        cancelText={ui.cancel}
      >
        <p>{ui.pick4Message}</p>
      </Dialog>

      <Dialog
        open={isPickMoviesDialogOpen === "8"}
        onClose={() => setIsPickMoviesDialogOpen(null)}
        title={ui.pick8Title}
        onConfirm={() => handleConfirmRandomSelection(8)}
        onCancel={() => setIsPickMoviesDialogOpen(null)}
        confirmText={ui.pick8Confirm}
        cancelText={ui.cancel}
      >
        <p>{ui.pick8Message}</p>
      </Dialog>

      <Dialog
        open={isPickMoviesDialogOpen === "16"}
        onClose={() => setIsPickMoviesDialogOpen(null)}
        title={ui.pick16Title}
        onConfirm={() => handleConfirmRandomSelection(16)}
        onCancel={() => setIsPickMoviesDialogOpen(null)}
        confirmText={ui.pick16Confirm}
        cancelText={ui.cancel}
      >
        <p>{ui.pick16Message}</p>
      </Dialog>

      <div className="min-h-screen flex flex-col pb-24">
        <header
          className={`sticky top-0 z-40 flex items-center justify-between gap-2 p-3 sm:p-4 bg-gray-800 text-white transition-transform duration-300 will-change-transform ${
            isHeaderVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img
                src={movieKombatLogo}
                alt="Movie Kombat Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              />
              <h1 className="hidden sm:block text-xl sm:text-2xl font-bold truncate max-w-[140px] sm:max-w-none movie-kombat-gradient-text">
                Movie Kombat
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={togglePostersVisibility}
              title={arePostersVisible ? ui.blindPosters : ui.showPosters}
              className="h-14 w-14 p-0 inline-flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors text-slate-200 border border-gray-600"
            >
              {arePostersVisible ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="block w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7" />
                  <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
                  <path d="M3 3l18 18" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="block w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>

            <div className="relative" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-[138px] sm:w-[180px] bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-2.5 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {(() => {
                    const FlagComponent = getFlagComponent(selectedRegion);
                    const region = regions.find(
                      (r) => r.iso_3166_1 === selectedRegion,
                    );
                    return (
                      <>
                        {FlagComponent && (
                          <FlagComponent className="w-4 h-3 object-cover rounded-sm" />
                        )}
                        <span className="truncate">
                          {region?.english_name || selectedRegion}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isCountryDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute right-0 z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                        className={`w-full text-left px-3 py-2 hover:bg-gray-600 flex items-center gap-2 ${
                          selectedRegion === region.iso_3166_1
                            ? "bg-blue-900/30"
                            : ""
                        }`}
                      >
                        {FlagComponent && (
                          <FlagComponent className="w-4 h-3 object-cover rounded-sm flex-shrink-0" />
                        )}
                        <span className="text-sm text-white">
                          {region.english_name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="relative" ref={platformDropdownRef}>
              <button
                type="button"
                onClick={() =>
                  setIsPlatformDropdownOpen(!isPlatformDropdownOpen)
                }
                className="w-[112px] sm:w-[150px] bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between gap-2"
                title={
                  selectedProviderNames.length > 0
                    ? selectedProviderNames
                        .map((provider) => provider.provider_name)
                        .join(", ")
                    : ui.platformPlaceholder
                }
              >
                <div className="flex min-w-0 items-center gap-1">
                  {selectedProviderNames.length > 0 ? (
                    selectedProviderNames
                      .slice(0, 3)
                      .map((provider) => (
                        <ProviderLogo
                          key={provider.provider_id}
                          logoPath={provider.logo_path}
                          providerName={provider.provider_name}
                          className="w-4 h-4 flex-shrink-0"
                        />
                      ))
                  ) : (
                    <span className="truncate text-xs text-slate-300">
                      {ui.platform}
                    </span>
                  )}
                  {selectedProviderNames.length > 3 && (
                    <span className="text-[10px] font-semibold text-slate-300">
                      +{selectedProviderNames.length - 3}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isPlatformDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isPlatformDropdownOpen && (
                <div className="absolute right-0 z-10 w-[280px] max-w-[calc(100vw-2rem)] mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-600 text-xs text-slate-300">
                    {ui.selectedPlatforms}: {selectedProviderIds.length}/
                    {providers.length}
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    <div className="flex flex-wrap gap-2">
                      {providers.map((provider) => {
                        const isSelected = selectedProviderIds.includes(
                          provider.provider_id,
                        );
                        return (
                          <button
                            key={provider.provider_id}
                            type="button"
                            onClick={() =>
                              toggleSelectedProvider(provider.provider_id)
                            }
                            title={provider.provider_name}
                            aria-label={provider.provider_name}
                            className={`inline-flex items-center justify-center rounded-full border p-2 text-xs transition-colors ${
                              isSelected
                                ? "border-blue-500 bg-blue-600 text-white"
                                : "border-gray-500 bg-gray-800 text-slate-200 hover:bg-gray-600"
                            }`}
                          >
                            <ProviderLogo
                              logoPath={provider.logo_path}
                              providerName={provider.provider_name}
                              className="w-4 h-4 flex-shrink-0"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/kombat" element={<KombatPage />} />
          </Routes>
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-2 sm:py-3 flex flex-col items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="w-full flex justify-center">
              <div className="flex items-center gap-1">
                <span className="mr-1">{ui.appLanguage}</span>
                <button
                  onClick={() => setSearchLanguage(LANGUAGE_EN_US)}
                  className={`px-2 py-1 rounded font-medium transition-colors text-xs ${
                    searchLanguage === LANGUAGE_EN_US
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setSearchLanguage(LANGUAGE_ES_ES)}
                  className={`px-2 py-1 rounded font-medium transition-colors text-xs ${
                    searchLanguage === LANGUAGE_ES_ES
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Español
                </button>
              </div>
            </div>
            <div className="w-full flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center gap-2">
                <span>{ui.tmdbDataSource}</span>
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TMDB"
                  className="inline-flex items-center hover:opacity-90 transition-opacity"
                >
                  <img src={tmdbLogo} alt="TMDB" className="h-4 w-auto" />
                </a>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="https://github.com/pablorotten/movie-kombat"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/pablo-antonio-rodriguez-rubio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>

        {location.pathname !== "/kombat" && (
          <>
            <button
              onClick={handleStartButtonClick}
              aria-label={ui.startKombat}
              title={ui.startKombat}
              className={`fixed bottom-6 right-6 z-50 inline-flex h-20 w-20 flex-col items-center justify-center rounded-full text-white transition ${
                canStartKombat
                  ? "bg-emerald-500 hover:bg-emerald-400"
                  : "bg-slate-500/55 hover:bg-slate-500/65 shadow backdrop-blur-sm"
              }`}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-black/20">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="mt-1 text-[10px] font-black tracking-[0.12em]">
                START
              </span>
              {movieList.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-bold text-white">
                  {movieList.length}
                </span>
              )}
            </button>
            {/* Dummy shadow layer behind the real button; visual-only, never interactive */}
            {canStartKombat && (
              <div
                aria-hidden="true"
                className="pointer-events-none fixed bottom-6 right-6 z-40 h-20 w-20 rounded-full animate-pulse bg-emerald-500 shadow-[0_0_28px_10px_rgba(236,72,153,0.75),0_0_56px_20px_rgba(168,85,247,0.55),0_0_92px_30px_rgba(168,85,247,0.32)]"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
