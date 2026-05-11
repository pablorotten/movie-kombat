# Movie Kombat — Copilot Instructions

## Stack
- React 19 + TypeScript (strict) + Vite
- Tailwind CSS v4
- React Router v7
- Vitest + Testing Library for tests
- Vercel Functions for the serverless proxy (`api/` folder)

## Architecture
- `src/` — React frontend (components, pages, context, services, utils)
- `api/` — Vercel serverless proxy handlers (TypeScript, ESM)
- `api/_lib/tmdbProxy.ts` — shared proxy helper; all handlers import from here
- `src/services/tmdbService.ts` — frontend TMDB client; calls `/api/*` routes, never TMDB directly
- `src/context/MovieContext.tsx` — global app state via React Context
- `src/types.tsx` — shared domain types (`Movie`, etc.)
- `movies/` — local markdown movie collections (parsed by `localMovieCollectionsService.ts`)

## Key Conventions

### TypeScript
- Strict mode enforced (`noUnusedLocals`, `noUnusedParameters`, strict null checks)
- Named exports preferred over default exports, except for React page/component files
- Interfaces for object shapes, types for unions/aliases

### Vercel Functions (`api/`)
- Runtime is Node ESM — imports **must use `.js` extension** even for `.ts` source files
  - Correct: `import { proxyTmdbRequest } from '../_lib/tmdbProxy.js'`
  - Wrong: `import { proxyTmdbRequest } from '../_lib/tmdbProxy'`
- `TMDB_API_KEY` is read from `process.env` server-side only — never expose it to the frontend

### TMDB Integration
- The frontend never holds or sends the TMDB API key
- All TMDB traffic goes through proxy endpoints: `/api/search/movie`, `/api/discover/movie`, `/api/movie/[id]`, `/api/movie/[id]/watch/providers`

### Testing
- Tests live alongside source files (`*.test.ts` / `*.test.tsx`)
- Use `vi.mock` / `vi.fn` for mocking; mock `/api/*` endpoints, not TMDB URLs directly
- Setup file: `src/test/setup.ts`

## Commands
```
npm run dev          # Vite only (no proxy — API calls will fail)
npm run dev:vercel   # Full local dev with Vercel Functions (use this)
npm run build        # tsc + vite build
npm run test         # Vitest watch
npm run test:run     # Vitest single run
```
