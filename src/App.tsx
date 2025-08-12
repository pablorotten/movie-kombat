import { Routes, Route, Link } from 'react-router-dom';
import movieKombatLogo from './assets/movie-kombat-logo.svg';
import SearchPage from './pages/SearchPage';
import MovieListPage from './pages/MovieList';
import { useMovies } from './context/MovieContext';
import "./App.css";


function App() {
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

        {/* This Link navigates to the new page */}
        <Link to="/list" className="btn-secondary relative">
          Show movie list
          {movieList.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {movieList.length}
            </span>
          )}
        </Link>
      </header>

      <main>
        {/* This section decides which page to show based on the URL */}
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/list" element={<MovieListPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;