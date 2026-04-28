# Movie Kombat

Movie Kombat is a React + TypeScript web app where you build a movie list and run a knockout kombat to pick a winner.

Live app: https://movie-kombat.vercel.app/

## Features

- Search movies with TMDB (single title or bulk list mode).
- Discover movies with TMDB by genre, streaming provider, and country.
- Load ready-made local movie collections from markdown files in `movies/`.
- Smart poster handling (fallback placeholders when posters are missing).
- Blind mode to hide posters and vote by title.
- Interactive bracket visualization through each kombat stage.
- Final winner screen with IMDb link.

## Local movie collections

You can add your own collection tiles shown in the app by creating markdown files inside the root `movies/` folder.

Rules:

- Create one `.md` file per collection in `movies/`.
- Use a first-level heading (`#`) as the collection title.
- Add movie titles as bullet points (one title per line).
- Optional: include an HTML image tag to use a custom tile image.
- Keep at least 16 movie titles so the app can build a 16-movie kombat selection.

Example (`movies/my-collection.md`):

```md
# My Collection
<img src="https://example.com/my-image.jpg" alt="my collection" />

* Movie Title 1
* Movie Title 2
* Movie Title 3
* Movie Title 4
* Movie Title 5
* Movie Title 6
* Movie Title 7
* Movie Title 8
* Movie Title 9
* Movie Title 10
* Movie Title 11
* Movie Title 12
* Movie Title 13
* Movie Title 14
* Movie Title 15
* Movie Title 16
```

Notes:

- File name becomes the internal collection id.
- The app ignores `movies/README.md`.
- Duplicate titles are automatically deduplicated (case-insensitive).

## Kombat rules

- You need at least **4 movies** to start.
- The total must be a **power of two** (4, 8, 16, ...).
- When starting, the list is shuffled and seeded into the bracket.

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router

## Getting started

### 1) Install dependencies

```sh
npm install
```

### 2) Run development server

```sh
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

### 3) Run full local stack (frontend + serverless API)

If you are working on TMDB search/discovery flows locally, use:

```sh
npm run dev:vercel
```

This runs Vercel's local runtime so `/api/*` serverless endpoints are available.
Use `npm run dev` only for frontend-only work.

Request routing summary:

- `npm run dev` + TMDB search/discover = it should fail locally for API-backed flows
- `npm run dev:vercel` = local serverless functions handle the request
- deployed app on Vercel = Vercel serverless functions handle the request

## TMDB proxy (server-side key)

The app now uses serverless proxy endpoints under `/api/*`.

- Frontend never sends or stores the TMDB key.
- Serverless functions call TMDB with a server-side bearer token.

Copy `.env.example` to `.env.local` and set the token:

```sh
TMDB_API_KEY=your_tmdb_bearer_token_here
```

Proxy endpoints implemented:

- `/api/search/movie`
- `/api/discover/movie`
- `/api/movie/[id]`
- `/api/movie/[id]/watch/providers`

## Available scripts

- `npm run dev` — start Vite dev server
- `npm run dev:vercel` — start local Vercel runtime (frontend + `/api/*` functions)
- `npm run dev:full` — alias of `dev:vercel`
- `npm run build` — type-check and build production bundle
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint
- `npm run predeploy` — build before deploy
- `npm run deploy` — deploy `dist/` to GitHub Pages

## Project structure

```text
src/
	components/        Reusable UI and kombat components
	context/           Global movie/app state
	pages/             Search and kombat routes
	services/          TMDB integration and helpers
	utils/             Utility functions (genres, providers, kombat logic)
	assets/            Static data and images
```

## Deployment

Recommended: deploy with serverless functions enabled.

- Vercel Functions: included with Vercel hosting (simple setup)
- Netlify Functions: included with Netlify
- AWS Lambda + API Gateway: free tier supports around 1M requests/month

For Vercel/Netlify/AWS, configure `TMDB_API_KEY` in the platform environment settings.

GitHub Pages deployment (`npm run deploy`) is static-only and does not run serverless functions.

## License

See [LICENSE](LICENSE).

## Filmaffinity Scrapper Tool

This repository contains a small, non-app Python tool to scrape FilmAffinity movie titles for personal use. It's not used by the app.

Setup:

```powershell
cd tools\filmaffinity
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Usage:

Add filmaffinity links to `links` file (one per line)

```
https://www.filmaffinity.com/es/film147735.html
https://www.filmaffinity.com/es/film847055.html
...
```

Run:

```powershell
python filmaffinity-scrapper.py
```

Output will be saved to movies file in the same folder.

## OMDB API

### Query examples

Seach movies starting with "The last":

`https://api.themoviedb.org/3/search/movie?language=en-US&query=The%2520last&page=1&include_adult=false`
```json
"page": 1,
    "results": [
        {
            "adult": false,
            "backdrop_path": "/sS3zGYFPcfM5pArVNWl6qLyaSmU.jpg",
            "genre_ids": [ 16, 28, 12, 14],
            "id": 980431,
            "title": "Avatar Aang: The Last Airbender",
            "original_language": "en",
            "original_title": "Avatar Aang: The Last Airbender",
            "overview": "Avatar Aang, the world's last Airbender, learns of an ancient power that could save his culture from extinction. With the help of his friends, he embarks on a global quest to find it before it falls into the wrong hands and threatens to upend the peace they sacrificed everything to achieve.",
            "popularity": 253.5738,
            "poster_path": "/29Jdsak3SrwGds5k1t43kH6Khed.jpg",
            "release_date": "2026-10-09",
            "softcore": false,
            "video": false,
            "vote_average": 0.0,
            "vote_count": 0
        },
        {
            ...
            "id": 1038392,
            "title": "The Conjuring: Last Rites",
            ...
        {
            ...
            "id": 912649,
            "title": "Venom: The Last Dance",
			...
        },
        {
            ...
            "id": 1451398,
            "title": "Re/Member: The Last Night",
			...
        },
        ...
    ],
    "total_pages": 233,
    "total_results": 4649
}
```

Search `Action` moviess in `Spain` with `Netflix` streaming. Sorted by popularity:
`https://api.themoviedb.org/3/discover/movie?language=en-US&page=2&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres=28&watch_region=ES&with_watch_providers=8`
```json
{
    "page": 1,
    "results": [
        {
            ...
            "title": "Apex",
            "original_language": "en",
            "original_title": "Apex",
            ...
        },
        {
            ...
            "id": 1265609,
            "title": "War Machine",
            "original_language": "en"
			...
		}
	...
```