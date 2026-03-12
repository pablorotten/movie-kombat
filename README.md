# Movie Kombat

Movie Kombat is a React + TypeScript web app where you build a movie list and run a knockout kombat to pick a winner.

Live app: https://movie-kombat.vercel.app/

## Features

- Search movies with TMDB (single title or bulk list mode).
- Discover movies with TMDB by genre, streaming provider, and country.
- Smart poster handling (fallback placeholders when posters are missing).
- Blind mode to hide posters and vote by title.
- Interactive bracket visualization through each kombat stage.
- Final winner screen with IMDb link.

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

## API keys

The app uses TMDB through the in-app **⚙️ API Configuration** dialog.

- **TMDB Bearer token** is used for title search and discovery filters (genre/provider/country).

Keys are saved in browser `localStorage` under:

- `tmdbApiKey`

If no custom key is provided, the app can still run using default values defined in the context.

## Available scripts

- `npm run dev` — start Vite dev server
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

This repository includes GitHub Pages deployment via `gh-pages`:

```sh
npm run deploy
```

Make sure your repository Pages settings are configured to serve the published branch.

## License

See [LICENSE](LICENSE).