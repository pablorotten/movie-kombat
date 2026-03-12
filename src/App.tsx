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
import TournamentPage from "./pages/TournamentPage";
import Button from "./components/Button";
import Dialog from "./components/Dialog";
import { useMovies } from "./context/MovieContext";
import "./App.css";
import TournamentIcon from "./assets/tournament.svg";
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
        startNewTournamentTitle: "Empezar nuevo torneo?",
        startNewTournamentWarning: "Se perdera el progreso del torneo actual",
        confirmStartNew: "Si, empezar nuevo",
        cancel: "Cancelar",
        configureApiKeys: "Configurar API Keys",
        blindPosters: "Ocultar posters",
        showPosters: "Mostrar posters",
        startTournament: "Empezar torneo",
      }
    : {
        startNewTournamentTitle: "Start New Tournament?",
        startNewTournamentWarning: "Current tournament progress will be lost",
        confirmStartNew: "Yes, Start New",
        cancel: "Cancel",
        configureApiKeys: "Configure API Keys",
        blindPosters: "Blind Posters",
        showPosters: "Show Posters",
        startTournament: "Start Tournament",
      };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Add this function to handle tournament start with shuffle
  const handleStartTournament = () => {
    // Check if we're already on the tournament page
    if (location.pathname === "/tournament") {
      setIsConfirmDialogOpen(true);
      return;
    }

    // Normal flow: go to tournament page
    navigate("/tournament");
  };

  const handleConfirmNewTournament = () => {
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
        title={ui.startNewTournamentTitle}
        onConfirm={handleConfirmNewTournament}
        onCancel={() => setIsConfirmDialogOpen(false)}
        confirmText={ui.confirmStartNew}
        cancelText={ui.cancel}
        confirmVariant="danger"
      >
        <p>{ui.startNewTournamentWarning}</p>
      </Dialog>

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
              <img src={TournamentIcon} className="w-4 h-4" />
            </span>
          }
          onClick={handleStartTournament}
          disabled={
            movieList.length <= 3 ||
            (movieList.length & (movieList.length - 1)) !== 0
          } // Disable if not a power of 2 or empty
        >
          {ui.startTournament}
          {movieList.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {movieList.length}
            </span>
          )}
        </Button>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/tournament" element={<TournamentPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
