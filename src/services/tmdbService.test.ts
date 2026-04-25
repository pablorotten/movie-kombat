import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getGenres,
  getProviders,
  getRegions,
  getGenreById,
  getProviderById,
  getRegionByCode,
  getGenreByName,
  getProviderByName,
  getPopularProviders,
  getTMDBImageUrl,
  convertTMDBToAppMovie,
  discoverMovies,
  searchMovies,
  getMovieDetails,
  TMDBMovie,
} from './tmdbService'

// ─── Static data helpers ─────────────────────────────────────────────────────

describe('getGenres', () => {
  it('returns a non-empty array with id and name fields', () => {
    const genres = getGenres()
    expect(genres.length).toBeGreaterThan(0)
    expect(genres[0]).toHaveProperty('id')
    expect(genres[0]).toHaveProperty('name')
  })
})

describe('getProviders', () => {
  it('returns a non-empty array', () => {
    expect(getProviders().length).toBeGreaterThan(0)
  })
})

describe('getRegions', () => {
  it('returns a non-empty array', () => {
    expect(getRegions().length).toBeGreaterThan(0)
  })
})

describe('getGenreById', () => {
  it('returns the genre for a known id', () => {
    const genre = getGenreById(28)
    expect(genre).toBeDefined()
    expect(genre?.id).toBe(28)
    expect(typeof genre?.name).toBe('string')
  })

  it('returns undefined for an unknown id', () => {
    expect(getGenreById(99999)).toBeUndefined()
  })
})

describe('getProviderById', () => {
  it('returns Netflix for id 8', () => {
    const provider = getProviderById(8)
    expect(provider).toBeDefined()
    expect(provider?.provider_name).toBe('Netflix')
  })

  it('returns undefined for an unknown id', () => {
    expect(getProviderById(99999)).toBeUndefined()
  })
})

describe('getRegionByCode', () => {
  it('returns the region for a known code', () => {
    const region = getRegionByCode('US')
    expect(region).toBeDefined()
    expect(region?.iso_3166_1).toBe('US')
  })

  it('returns undefined for an unknown code', () => {
    expect(getRegionByCode('ZZ')).toBeUndefined()
  })
})

describe('getGenreByName', () => {
  it('is case-insensitive', () => {
    expect(getGenreByName('action')).toBeDefined()
    expect(getGenreByName('ACTION')).toBeDefined()
    expect(getGenreByName('Action')).toBeDefined()
  })

  it('returns undefined for an unknown name', () => {
    expect(getGenreByName('NotAGenre')).toBeUndefined()
  })
})

describe('getProviderByName', () => {
  it('finds Netflix case-insensitively', () => {
    expect(getProviderByName('netflix')).toBeDefined()
    expect(getProviderByName('Netflix')).toBeDefined()
  })

  it('returns undefined for an unknown provider', () => {
    expect(getProviderByName('zzznomatchatall')).toBeUndefined()
  })
})

describe('getPopularProviders', () => {
  it('returns a non-empty array of providers', () => {
    const providers = getPopularProviders()
    expect(providers.length).toBeGreaterThan(0)
    expect(providers[0]).toHaveProperty('provider_id')
  })
})

// ─── Image / conversion helpers ──────────────────────────────────────────────

describe('getTMDBImageUrl', () => {
  it('returns null for a null input', () => {
    expect(getTMDBImageUrl(null)).toBeNull()
  })

  it('returns a full TMDB image URL for a valid path', () => {
    expect(getTMDBImageUrl('/poster.jpg')).toBe('https://image.tmdb.org/t/p/w500/poster.jpg')
  })
})

const mockTMDBMovie: TMDBMovie = {
  id: 123,
  title: 'Test Movie',
  original_title: 'Test Movie',
  overview: 'A test movie.',
  poster_path: '/poster.jpg',
  backdrop_path: null,
  release_date: '2020-05-15',
  vote_average: 7.5,
  vote_count: 1000,
  popularity: 80,
  genre_ids: [28, 12],
}

describe('convertTMDBToAppMovie', () => {
  it('maps id, title, year, type, and poster correctly', () => {
    const movie = convertTMDBToAppMovie(mockTMDBMovie)
    expect(movie.imdbID).toBe('tmdb_123')
    expect(movie.Title).toBe('Test Movie')
    expect(movie.Year).toBe('2020')
    expect(movie.Type).toBe('movie')
    expect(movie.Poster).toBe('https://image.tmdb.org/t/p/w500/poster.jpg')
  })

  it('uses "N/A" for a null poster_path', () => {
    const movie = convertTMDBToAppMovie({ ...mockTMDBMovie, poster_path: null })
    expect(movie.Poster).toBe('N/A')
  })

  it('uses "Unknown" for a missing release_date', () => {
    const movie = convertTMDBToAppMovie({ ...mockTMDBMovie, release_date: '' })
    expect(movie.Year).toBe('Unknown')
  })
})

// ─── Async fetch functions ────────────────────────────────────────────────────

const mockJsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status })

const emptyDiscoverResponse = { page: 1, results: [], total_pages: 1, total_results: 0 }

describe('discoverMovies', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('calls the correct endpoint with authorization header and returns parsed data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(emptyDiscoverResponse))

    const result = await discoverMovies('my-token', { page: 1 })

    expect(fetch).toHaveBeenCalledOnce()
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/discover/movie')
    expect((options?.headers as Record<string, string>)?.Authorization).toBe('Bearer my-token')
    expect(result).toEqual(emptyDiscoverResponse)
  })

  it('throws on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401, statusText: 'Unauthorized' }))
    await expect(discoverMovies('bad-token', {})).rejects.toThrow('TMDB API error: 401')
  })
})

describe('searchMovies', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('calls the search endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(emptyDiscoverResponse))

    await searchMovies('my-token', 'Inception')

    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/search/movie')
  })

  it('throws on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 403, statusText: 'Forbidden' }))
    await expect(searchMovies('my-token', 'Inception')).rejects.toThrow('TMDB API error: 403')
  })
})

describe('getMovieDetails', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('calls the movie details endpoint with the correct id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: 123, title: 'Test' }))

    await getMovieDetails('my-token', 123)

    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/movie/123')
  })

  it('throws on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 404, statusText: 'Not Found' }))
    await expect(getMovieDetails('my-token', 999)).rejects.toThrow('TMDB API error: 404')
  })
})
