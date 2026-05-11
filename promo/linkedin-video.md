# Linkedin Video

## TMDB Endpoints:

```
GET https://api.themoviedb.org/3/search/movie
GET https://api.themoviedb.org/3/discover/movie
GET https://api.themoviedb.org/3/movie/{id}
GET https://api.themoviedb.org/3/movie/{id}/watch/providers
```

## Example query parameters used by the app

- `/api/search/movie?language=en-US&query=spawn&page=1&include_adult=false`
- `/api/discover/movie?language=en-US&page=1&sort_by=popularity.desc&include_adult=false&include_video=false`
- `/api/discover/movie?...&with_genres=XX` when filtering by genre
- `/api/discover/movie?...&watch_region=US&with_watch_providers=YY` when filtering by streaming provider

Images from `https://image.tmdb.org/t/p/w500/{poster_path}`

