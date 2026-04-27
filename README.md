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