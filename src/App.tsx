import { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import movieKombatLogo from "./assets/movie-kombat-logo.svg";
import SearchPage from "./pages/SearchPage";
import TournamentPage from "./pages/TournamentPage";
import Button from "./components/Button";
import { useMovies } from "./context/MovieContext";
import "./App.css";
import TournamentIcon from "./assets/tournament.svg";
import ApiKeyIcon from "./assets/api-key.svg";
import EyeOpenIcon from "./assets/eye-open.svg";
import EyeCloseIcon from "./assets/eye-close.svg";

// A simple modal component for the API key input
const ApiKeyModal = ({
  isOpen,
  onClose,
  apiKey = "",
  setApiKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  setApiKey: (key: string) => void;
}) => {
  const [inputValue, setInputValue] = useState(apiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(inputValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-white">
          Set Custom OMDB API Key
        </h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5 mb-4"
          placeholder="Enter your OMDB API key..."
        />
        <Button variant="primary" onClick={handleSave}>
          Save and Close
        </Button>
      </div>
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const {
    movieList,
    setApiKey,
    arePostersVisible,
    togglePostersVisibility,
  } = useMovies();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setApiKey={setApiKey}
      />
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

          <button
            onClick={() => setIsModalOpen(true)}
            title="Set custom API Key"
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-slate-300"
          >
            <span className="inline-block" aria-label="star">
              <img src={ApiKeyIcon} className="w-4 h-4" />
            </span>
          </button>
        </div>

        <button
          onClick={togglePostersVisibility}
          title={arePostersVisible ? "Blind Posters" : "Show Posters"}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors text-slate-300"
        >
          {arePostersVisible ? (
            <span className="inline-block" aria-label="star">
              <img src={EyeCloseIcon} className="w-6 h-6" />
            </span>
          ) : (
            <span className="inline-block" aria-label="star">
              <img src={EyeOpenIcon} className="w-6 h-6" />
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
          onClick={() => navigate("/tournament")}
          disabled={
            movieList.length <= 3 ||
            (movieList.length & (movieList.length - 1)) !== 0
          } // Disable if not a power of 2 or empty
        >
          Start Tournament
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
