import Button from "../components/Button";
import PosterImage from "../components/PosterImage";
import { useMovies } from "../context/MovieContext";

interface MovieCardProps {
  title: string;
  poster: string;
  imdbID: string;
  onDelete: (imdbID: string) => void;
}

export default function MovieCard({
  title,
  poster,
  imdbID,
  onDelete,
}: MovieCardProps) {
  useMovies();
  return (
    <figure className="relative flex flex-col items-center justify-center p-8 text-center bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </blockquote>

      <figcaption className="flex items-center justify-center w-full">
        {/* Container with a 2:3 aspect ratio */}
        <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-700">
          <PosterImage
            className="w-full h-full object-cover"
            src={poster}
            alt={`${title} poster`}
          />
        </div>
      </figcaption>

      {/* Delete Button */}

      <div className="flex flex-wrap gap-3 mt-4">
        <Button
          icon={
            <span role="img" aria-label="cross">
              ✘
            </span>
          }
          size="medium"
          variant="danger"
          fullWidth={true}
          onClick={() => onDelete(imdbID)}
        >
          Remove
        </Button>
      </div>
    </figure>
  );
}
