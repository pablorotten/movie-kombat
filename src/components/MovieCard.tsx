export default function MovieCard({ title, poster }: { title: string, poster: string }) {
  return (
    <figure className="flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e dark:bg-gray-800 dark:border-gray-700">
      <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </blockquote>
      <figcaption className="flex items-center justify-center">
        <img
          className=""
          src={poster}
          alt="profile picture"
        />
      </figcaption>
    </figure>
  );
}
