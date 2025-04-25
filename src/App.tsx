import movieKombatLogo from "./assets/movie-kombat-logo.svg";
import "./App.css";

function addMovie() {
  console.log("Add movie button clicked with parameter:");
}

function App() {
  return (
    <>
      <header className="flex items-center p-4 bg-gray-800 text-white">
        <img
          src={movieKombatLogo}
          alt="Movie Kombat Logo"
          className="h-8 w-8 mr-2"
        />
        <h1 className="text-2xl font-bold">Movie Kombat</h1>
      </header>

      <div className="max-w-3xl mx-auto text-center mt-16">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2 pb-4 relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Add your movies
          </span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></span>
        </h1>
        <p className="text-lg mb-8">Search and add 8 🎬 movies</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="flex items-center max-w-sm mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              id="movieInput"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search movie..."
              required
            />
          </div>
          <button
            type="button"
            id="addMovieButton"
            onClick={addMovie}
            className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Add
            <span className="sr-only">Search</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
