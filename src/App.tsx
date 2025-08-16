import { Routes, Route, Link, useNavigate } from "react-router-dom";
import movieKombatLogo from "./assets/movie-kombat-logo.svg";
import SearchPage from "./pages/SearchPage";
import TournamentPage from "./pages/TournamentPage";
import Button from "./components/Button";
import { useMovies } from "./context/MovieContext";
import "./App.css";
import TournamentIcon from "./assets/tournament.svg";

function App() {
  const navigate = useNavigate();
  const { movieList } = useMovies();

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={movieKombatLogo}
            alt="Movie Kombat Logo"
            className="h-8 w-8"
          />
          <h1 className="text-2xl font-bold">Movie Kombat</h1>
        </Link>

        <Button
          variant="success"
          size="small"
          fullWidth={true}
          // This works
          // icon={<span role="img" aria-label="star">⭐</span>}
          icon={
            <span className="inline-block" aria-label="star">
              <img src={TournamentIcon} />
            </span>
          }
          onClick={() => navigate("/list")}
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
          <Route path="/list" element={<TournamentPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
