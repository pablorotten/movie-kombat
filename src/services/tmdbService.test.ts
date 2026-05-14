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
  getMovieProvidersForRegion,
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
  it('returns the curated platform list with a single Prime Video provider and HBO Max included', () => {
    const providers = getPopularProviders()
    const providerIds = providers.map((provider) => provider.provider_id)

    expect(providerIds).toEqual(expect.arrayContaining([8, 119, 122, 350, 63, 283, 1899]))
    expect(providerIds).not.toContain(9)
    expect(providerIds).not.toContain(613)
    expect(providerIds).not.toContain(2100)
    expect(providerIds).not.toContain(1796)
    expect(providerIds).not.toContain(35) // Rakuten TV should not be in the popular provider list
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

  it('calls the proxy discover endpoint and returns parsed data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(emptyDiscoverResponse))

    const result = await discoverMovies({ page: 1 })

    expect(fetch).toHaveBeenCalledOnce()
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/discover/movie')
    expect(result).toEqual(emptyDiscoverResponse)
  })

  it('throws on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401, statusText: 'Unauthorized' }))
    await expect(discoverMovies({})).rejects.toThrow('TMDB API error: 401')
  })

  it('sends multiple providers in a single discover request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(emptyDiscoverResponse))

    await discoverMovies({ providerIds: [8, 119], region: 'ES' })

    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('watch_region=ES')
    expect(String(url)).toContain('with_watch_providers=8%7C9%7C119')
    expect(String(url)).not.toContain('613')
    expect(String(url)).not.toContain('2100')
  })

  it('sends multiple genres in a single discover request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(emptyDiscoverResponse))

    await discoverMovies({ genreIds: [28, 12] })

    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('with_genres=28%7C12')
  })
})

describe('searchMovies', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('calls the search endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse(emptyDiscoverResponse))

    await searchMovies('Inception')

    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/search/movie')
  })

  it('throws on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 403, statusText: 'Forbidden' }))
    await expect(searchMovies('Inception')).rejects.toThrow('TMDB API error: 403')
  })
})

describe('getMovieDetails', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('calls the movie details endpoint with the correct id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ id: 123, title: 'Test' }))

    await getMovieDetails(123)

    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/movie/123')
  })

  it('throws on a non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 404, statusText: 'Not Found' }))
    await expect(getMovieDetails(999)).rejects.toThrow('TMDB API error: 404')
  })
})

describe('getMovieProvidersForRegion', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns all flatrate providers and excludes rent and buy', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({
      id: 11970,
      results: {
        BE: {
          flatrate: [
            { provider_id: 8, provider_name: 'Netflix', logo_path: '/netflix.png' },
            { provider_id: 35, provider_name: 'Rakuten TV', logo_path: '/rakuten.png' },
          ],
          rent: [
            { provider_id: 2, provider_name: 'Apple TV Store', logo_path: '/apple.png' },
          ],
          buy: [
            { provider_id: 10, provider_name: 'Amazon Video', logo_path: '/amazon.png' },
          ],
        },
      },
    }))

    const providers = await getMovieProvidersForRegion(11970, 'BE')
    const providerIds = providers.map((provider) => provider.provider_id)

    expect(providerIds).toContain(8)    // Netflix (flatrate)
    expect(providerIds).toContain(35)   // Rakuten TV (flatrate, non-whitelisted — still shown)
    expect(providerIds).not.toContain(2)  // Apple TV Store (rent only)
    expect(providerIds).not.toContain(10) // Amazon Video (buy only)
  })

  it('returns Disney Plus as-is (provider_id 337) without normalization', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({
      id: 330457,
      results: {
        BE: {
          flatrate: [
            { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/disney-legacy.png' },
          ],
        },
      },
    }))

    const providers = await getMovieProvidersForRegion(330457, 'BE')
    const providerIds = providers.map((provider) => provider.provider_id)

    expect(providerIds).toContain(337)  // returned as-is from TMDB
  })

  it('returns empty array when region has no providers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({
      id: 11970,
      results: {
        BE: {},
      },
    }))

    const providers = await getMovieProvidersForRegion(11970, 'BE')

    expect(providers).toEqual([])
  })

  it('falls back to non-flatrate providers when flatrate is missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({
      id: 330457,
      results: {
        ES: {
          rent: [
            { provider_id: 122, provider_name: 'Disney+', logo_path: '/disney.png' },
          ],
        },
      },
    }))

    const providers = await getMovieProvidersForRegion(330457, 'ES')

    expect(providers).toEqual([
      { provider_id: 122, provider_name: 'Disney+', logo_path: '/disney.png' },
    ])
  })
})
