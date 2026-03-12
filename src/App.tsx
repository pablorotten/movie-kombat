import { useState } from "react";
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
import KombatIcon from "./assets/kombat.svg";
import tmdbLogo from "./assets/TMDB.svg";
// // import ApiKeyIcon from "./assets/api-key.svg";
import EyeOpenIcon from "./assets/eye-open.svg";
import EyeCloseIcon from "./assets/eye-close.svg";

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
        tmdbDataSource: "Data provided by",
        tmdbAttribution:
          "This product uses the TMDB API but is not endorsed or certified by TMDB.",
      };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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

      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={movieKombatLogo}
                alt="Movie Kombat Logo"
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold">Movie Kombat</h1>
            </Link>

            {/* API Configuration button */}
            <button
              onClick={() => setIsModalOpen(true)}
              title={ui.configureApiKeys}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors text-slate-300"
            >
              <span className="inline-block" aria-label="settings">
                ⚙️
              </span>
            </button>
          </div>

          <button
            onClick={togglePostersVisibility}
            title={arePostersVisible ? ui.blindPosters : ui.showPosters}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-slate-300 btn-primary"
          >
            {arePostersVisible ? (
              <span className="inline-block" aria-label="star">
                <img src={EyeCloseIcon} className="w-6 h-6 dark:invert" />
              </span>
            ) : (
              <span className="inline-block" aria-label="star">
                <img src={EyeOpenIcon} className="w-6 h-6 dark:invert" />
              </span>
            )}
          </button>

          <Button
            variant="success"
            size="small"
            fullWidth={true}
            icon={
              <span className="inline-block" aria-label="star">
                <img src={KombatIcon} className="w-4 h-4" />
              </span>
            }
            onClick={handleStartKombat}
            disabled={
              movieList.length <= 3 ||
              (movieList.length & (movieList.length - 1)) !== 0
            } // Disable if not a power of 2 or empty
          >
            {ui.startKombat}
            {movieList.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {movieList.length}
              </span>
            )}
          </Button>
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
      </div>
    </>
  );
}

export default App;
