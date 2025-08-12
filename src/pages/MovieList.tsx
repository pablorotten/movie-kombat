import { useMovies } from '../context/MovieContext';
import MovieCard from '../components/MovieCard';

export default function MovieListPage() {
  const { movieList } = useMovies(); // Get the list from our context!

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center my-8">My Movie List</h1>
      
      {movieList.length === 0 ? (
        <p className="text-center text-xl text-gray-400">Your list is empty. Go add some movies!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          {movieList.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              title={movie.Title}
              poster={movie.Poster}
            />
          ))}
        </div>
      )}
    </div>
  );
}