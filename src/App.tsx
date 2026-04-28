import { useEffect, useMemo, useRef, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import movieKombatLogo from "./assets/movie-kombat-logo.svg";
import SearchPage from "./pages/SearchPage";
import KombatPage from "./pages/KombatPage";
import Button from "./components/Button";
import Dialog from "./components/Dialog";
import { useMovies } from "./context/MovieContext";
import "./App.css";
import tmdbLogo from "./assets/TMDB.svg";
// // import ApiKeyIcon from "./assets/api-key.svg";
import { getRegions } from "./services/tmdbService";
import { getFlagComponent, selectedCountries } from "./constants/countries";

// A simple modal component for API keys
const ApiKeyModal = ({
  isOpen,
  onClose,
  tmdbApiKey = "",
  setTmdbApiKey,
  searchLanguage,
}: {
  isOpen: boolean;
  onClose: () => void;
  tmdbApiKey?: string;
  setTmdbApiKey: (key: string) => void;
  searchLanguage: string;
}) => {
  const isSpanish = searchLanguage === "es-ES";
  const ui = isSpanish
    ? {
        apiConfig: "Configuracion de API",
        tmdbTokenLabel: "TMDB Bearer Token (para buscar y descubrir peliculas)",
        tmdbPlaceholder: "Escribe tu token Bearer de TMDB...",
        getToken: "Consigue un token gratis en:",
        cancel: "Cancelar",
        save: "Guardar",
      }
    : {
        apiConfig: "API Configuration",
        tmdbTokenLabel: "TMDB Bearer Token (for movie search and discovery)",
        tmdbPlaceholder: "Enter your TMDB Bearer token...",
        getToken: "Get free token at:",
        cancel: "Cancel",
        save: "Save",
      };
  const [tmdbInputValue, setTmdbInputValue] = useState(tmdbApiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    setTmdbApiKey(tmdbInputValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-white">{ui.apiConfig}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {ui.tmdbTokenLabel}
            </label>
            <input
              type="text"
              value={tmdbInputValue}
              onChange={(e) => setTmdbInputValue(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"
              placeholder={ui.tmdbPlaceholder}
            />
            <p className="text-xs text-gray-400 mt-1">
              {ui.getToken}{" "}
              <span className="text-blue-400">https://www.themoviedb.org/settings/api</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} fullWidth>
            {ui.cancel}
          </Button>
          <Button variant="primary" onClick={handleSave} fullWidth>
            {ui.save}
          </Button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    movieList,
    setMovieList,
    setTmdbApiKey,
    tmdbApiKey,
    arePostersVisible,
    togglePostersVisibility,
    searchLanguage,
    selectedRegion,
    setSelectedRegion,
  } = useMovies();
  const isSpanish = searchLanguage === "es-ES";
  const ui = isSpanish
    ? {
        startNewKombatTitle: "Empezar nuevo Kombat?",
        startNewKombatWarning: "Se perderá el progreso del Kombat actual",
        confirmStartNew: "Sí, empezar nuevo",
        cancel: "Cancelar",
        configureApiKeys: "Configurar API Keys",
        blindPosters: "Ocultar posters",
        showPosters: "Mostrar posters",
        startKombat: "Empezar Kombat",
        needMoreMoviesTitle: "Agrega 16 peliculas para empezar!",
        understood: "Entendido",
        country: "Pais",
        tmdbDataSource: "Datos proporcionados por",
        tmdbAttribution:
          "Este producto utiliza la API de TMDB pero no esta avalado ni certificado por TMDB.",
      }
    : {
        startNewKombatTitle: "Start New Kombat?",
        startNewKombatWarning: "Current Kombat progress will be lost",
        confirmStartNew: "Yes, Start New",
        cancel: "Cancel",
        configureApiKeys: "Configure API Keys",
        blindPosters: "Blind Posters",
        showPosters: "Show Posters",
        startKombat: "Start Kombat",
        needMoreMoviesTitle: "Add 16 movies to start!",
        understood: "Understood",
        country: "Country",
        tmdbDataSource: "Data provided by",
        tmdbAttribution:
          "This product uses the TMDB API but is not endorsed or certified by TMDB.",
      };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isNotEnoughMoviesDialogOpen, setIsNotEnoughMoviesDialogOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const regions = useMemo(() => getRegions(), []);
  const filteredRegions = useMemo(
    () => regions.filter((region) => selectedCountries.includes(region.iso_3166_1)),
    [regions]
  );

  // Add this function to handle kombat start with shuffle
  const handleStartKombat = () => {
    // Check if we're already on the kombat page
    if (location.pathname === "/kombat") {
      setIsConfirmDialogOpen(true);
      return;
    }

    // Normal flow: go to kombat page
    navigate("/kombat");
  };

  const handleConfirmNewKombat = () => {
    // Clear all movies and go back to search page
    setMovieList([]);
    navigate("/");
  };

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

  const canStartKombat =
    movieList.length > 3 && (movieList.length & (movieList.length - 1)) === 0;

  const handleStartButtonClick = () => {
    if (!canStartKombat) {
      setIsNotEnoughMoviesDialogOpen(true);
      return;
    }

    handleStartKombat();
  };

  return (
    <>
      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tmdbApiKey={tmdbApiKey}
        setTmdbApiKey={setTmdbApiKey}
        searchLanguage={searchLanguage}
      />

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
        title={ui.needMoreMoviesTitle}
        onCancel={() => setIsNotEnoughMoviesDialogOpen(false)}
        cancelText={ui.understood}
      />

      <div className="min-h-screen flex flex-col pb-24">
        <header className="flex items-center justify-between gap-2 p-3 sm:p-4 bg-gray-800 text-white">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img
                src={movieKombatLogo}
                alt="Movie Kombat Logo"
                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
              />
              <h1 className="hidden sm:block text-xl sm:text-2xl font-bold truncate max-w-[140px] sm:max-w-none">Movie Kombat</h1>
            </Link>

            {/* API Configuration button */}
            <button
              onClick={() => setIsModalOpen(true)}
              title={ui.configureApiKeys}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors text-slate-300 flex-shrink-0"
            >
              <span className="inline-block" aria-label="settings">
                ⚙️
              </span>
            </button>
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
                    const region = regions.find((r) => r.iso_3166_1 === selectedRegion);
                    return (
                      <>
                        {FlagComponent && <FlagComponent className="w-4 h-3 object-cover rounded-sm" />}
                        <span className="truncate">{region?.english_name || selectedRegion}</span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                          selectedRegion === region.iso_3166_1 ? "bg-blue-900/30" : ""
                        }`}
                      >
                        {FlagComponent && (
                          <FlagComponent className="w-4 h-3 object-cover rounded-sm flex-shrink-0" />
                        )}
                        <span className="text-sm text-white">{region.english_name}</span>
                      </button>
                    );
                  })}
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
          <div className="max-w-6xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
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
            <p className="hidden md:block text-right">{ui.tmdbAttribution}</p>
          </div>
        </footer>

        {location.pathname !== "/kombat" && (
          <button
            onClick={handleStartButtonClick}
            aria-label={ui.startKombat}
            title={ui.startKombat}
            className={`fixed bottom-6 right-6 z-50 inline-flex h-20 w-20 flex-col items-center justify-center rounded-full text-white transition ${
              canStartKombat
                ? "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.95),0_0_42px_rgba(16,185,129,0.65)] animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-500 shadow-xl"
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
            <span className="mt-1 text-[10px] font-black tracking-[0.12em]">START</span>
            {movieList.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1 text-xs font-bold text-white">
                {movieList.length}
              </span>
            )}
          </button>
        )}
      </div>
    </>
  );
}

export default App;
