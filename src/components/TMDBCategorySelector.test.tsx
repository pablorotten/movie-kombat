import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TMDBCategorySelector from './TMDBCategorySelector'
import { MovieProvider } from '../context/MovieContext'

const discoverMoviesMock = vi.fn()

vi.mock('../services/tmdbService', () => ({
  PROVIDER_NETFLIX: 8,
  PROVIDER_AMAZON_PRIME: 119,
  PROVIDER_DISNEY_PLUS: 122,
  getGenres: vi.fn(() => [{ id: 28, name: 'Action' }]),
  getPopularProviders: vi.fn(() => [{ provider_id: 8, provider_name: 'Netflix', logo_path: '/logo.png', display_priority: 1 }]),
  getRegions: vi.fn(() => [{ iso_3166_1: 'US', english_name: 'United States', native_name: 'United States' }]),
  discoverMovies: (...args: unknown[]) => discoverMoviesMock(...args),
  convertTMDBToAppMovie: vi.fn((movie: { id: number; title: string; release_date: string }) => ({
    imdbID: `tmdb_${movie.id}`,
    Title: movie.title,
    Year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'Unknown',
    Poster: '/poster.jpg',
    Type: 'movie',
  })),
}))

function renderSelector(maxMoviesToSelect: number, onSelectMovies = vi.fn()) {
  return render(
    <MovieProvider>
      <TMDBCategorySelector
        onSelectMovies={onSelectMovies}
        isExpanded={true}
        onToggleExpanded={vi.fn()}
        maxMoviesToSelect={maxMoviesToSelect}
      />
    </MovieProvider>
  )
}

describe('TMDBCategorySelector movie-cap behavior', () => {
  beforeEach(() => {
    discoverMoviesMock.mockReset()
    discoverMoviesMock.mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 4,
      results: [
        {
          id: 1,
          title: 'Movie A',
          original_title: 'Movie A',
          overview: '',
          poster_path: '/a.jpg',
          backdrop_path: null,
          release_date: '2020-01-01',
          vote_average: 7,
          vote_count: 100,
          popularity: 100,
          genre_ids: [28],
        },
        {
          id: 2,
          title: 'Movie B',
          original_title: 'Movie B',
          overview: '',
          poster_path: '/b.jpg',
          backdrop_path: null,
          release_date: '2020-01-01',
          vote_average: 7,
          vote_count: 100,
          popularity: 100,
          genre_ids: [28],
        },
        {
          id: 3,
          title: 'Movie C',
          original_title: 'Movie C',
          overview: '',
          poster_path: '/c.jpg',
          backdrop_path: null,
          release_date: '2020-01-01',
          vote_average: 7,
          vote_count: 100,
          popularity: 100,
          genre_ids: [28],
        },
      ],
    })

    localStorage.clear()
    localStorage.setItem('selectedRegion', 'US')
    localStorage.setItem('selectedProviderIds', JSON.stringify([8]))
  })

  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('warns and skips discover requests when there are no slots left', async () => {
    renderSelector(0)

    fireEvent.click(screen.getByRole('button', { name: /Action/i }))
    const discoverButton = await screen.findByRole('button', { name: 'Discover Movies' })
    await waitFor(() => {
      expect(discoverButton).not.toBeDisabled()
    })
    fireEvent.click(discoverButton)

    await waitFor(() => {
      expect(screen.getByText('There are already too many movies (100). Delete some before adding more.')).toBeInTheDocument()
    })

    expect(discoverMoviesMock).not.toHaveBeenCalled()
  })

  it('uses a single discover request when only a few slots are available', async () => {
    const onSelectMovies = vi.fn()
    renderSelector(2, onSelectMovies)

    fireEvent.click(screen.getByRole('button', { name: /Action/i }))
    const discoverButton = await screen.findByRole('button', { name: 'Discover Movies' })
    await waitFor(() => {
      expect(discoverButton).not.toBeDisabled()
    })
    fireEvent.click(discoverButton)

    await waitFor(() => {
      expect(onSelectMovies).toHaveBeenCalledTimes(1)
    })

    expect(discoverMoviesMock).toHaveBeenCalledTimes(1)
    expect(onSelectMovies.mock.calls[0]?.[0]).toHaveLength(2)
  })
})
