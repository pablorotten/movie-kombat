import { Routes, Route, Link } from 'react-router-dom';
import movieKombatLogo from './assets/movie-kombat-logo.svg';
import SearchPage from './pages/SearchPage';
// import MovieListPage from './pages/MovieList'; // Remove this
import TournamentPage from './pages/TournamentPage'; // Import the new page
import { useMovies } from './context/MovieContext';
import "./App.css";

function App() {
  const { movieList } = useMovies();

  return (
    <>
      <header /* ... */ >
        {/* ... header content ... */}
        <Link to="/list" className="btn-secondary relative">
          Start Tournament
          {/* ... badge ... */}
        </Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          {/* Change this line to point to the new component */}
          <Route path="/list" element={<TournamentPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;