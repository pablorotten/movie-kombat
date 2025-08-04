// The data we get from the OMDB API has properties with uppercase first letters.
// We'll define our interface to match the API response.
export interface Movie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

// This could be expanded with more details if you want them
// export interface MovieDetails extends Movie {
//   Plot: string;
//   Director: string;
//   Actors: string;
//   imdbRating: string;
// }