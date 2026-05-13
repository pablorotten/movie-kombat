import { useEffect } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SearchPage from './SearchPage'
import { MAX_MOVIES_IN_LIST, MovieProvider, useMovies } from '../context/MovieContext'
import type { Movie } from '../types'

const searchMoviesMock = vi.fn()

vi.mock('../services/tmdbService', () => ({
  PROVIDER_NETFLIX: 8,
  PROVIDER_AMAZON_PRIME: 119,
  PROVIDER_DISNEY_PLUS: 122,
  searchMovies: (...args: unknown[]) => searchMoviesMock(...args),
  convertTMDBToAppMovie: (movie: { id: number; title: string; release_date: string }) => ({
    imdbID: `tmdb_${movie.id}`,
    Title: movie.title,
    Year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : 'Unknown',
    Poster: 'N/A',
    Type: 'movie',
  }),
  getMovieDetails: vi.fn(async (id: number) => ({
    id,
    title: `Movie ${id}`,
    release_date: '2020-01-01',
    poster_path: null,
  })),
  getTMDBImageUrl: vi.fn(() => null),
  getPopularProviders: vi.fn(() => [
    { provider_id: 8, provider_name: 'Netflix', logo_path: '/logo.png', display_priority: 1 },
  ]),
}))

vi.mock('../services/localMovieCollectionsService', () => ({
  loadLocalMovieCollections: vi.fn(() => [
    {
      id: 'top-picks',
      title: 'Top Picks',
      movieTitles: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'],
      image: null,
      localImage: null,
    },
  ]),
  shuffle: vi.fn(<T,>(arr: T[]) => arr),
}))

vi.mock('../components/TMDBCategorySelector', () => ({
  default: ({ onSelectMovies }: { onSelectMovies: (movies: Movie[]) => void }) => (
    <button
      type='button'
      onClick={() => {
        const movies = Array.from({ length: 16 }, (_, index) => ({
          imdbID: `tmdb_discover_${index + 1}`,
          Title: `Discover ${index + 1}`,
          Year: '2020',
          Poster: '/poster.jpg',
          Type: 'movie',
        }))
        onSelectMovies(movies)
      }}
    >
      Mock discover add
    </button>
  ),
}))

const makeMovie = (n: number): Movie => ({
  Title: `Movie ${n}`,
  Year: '2020',
  imdbID: `tt${n}`,
  Type: 'movie',
  Poster: `/poster${n}.jpg`,
})

function SeedMovies({ movies }: { movies: Movie[] }) {
  const { setMovieList } = useMovies()

  useEffect(() => {
    setMovieList(movies)
  }, [movies, setMovieList])

  return null
}

function renderSearchPage(movies: Movie[]) {
  return render(
    <MemoryRouter>
      <MovieProvider>
        <SeedMovies movies={movies} />
        <SearchPage />
      </MovieProvider>
    </MemoryRouter>
  )
}

describe('SearchPage movie-cap behavior', () => {
  beforeEach(() => {
    searchMoviesMock.mockReset()
    searchMoviesMock.mockImplementation(async (title: string) => ({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [
        {
          id: Math.abs(Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0)),
          title,
          original_title: title,
          overview: '',
          poster_path: '/poster.jpg',
          backdrop_path: null,
          release_date: '2020-01-01',
          vote_average: 7,
          vote_count: 100,
          popularity: 100,
          genre_ids: [],
        },
      ],
    }))
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('shows the movie-limit popup when trying to add more movies and list is full', async () => {
    renderSearchPage(Array.from({ length: MAX_MOVIES_IN_LIST }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Mock discover add' }))

    expect(screen.getByText('Limit reached')).toBeInTheDocument()
    expect(screen.getByText('There are already too many movies (100). Delete some before adding more.')).toBeInTheDocument()
    expect(screen.getByText(/(?:Movies|Peliculas) \(100\)/)).toBeInTheDocument()
  })

  it('stops expanded search requests at remaining capacity and warns with added count', async () => {
    renderSearchPage(Array.from({ length: MAX_MOVIES_IN_LIST - 2 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByTitle('Search multiple movies'))
    fireEvent.change(screen.getByPlaceholderText('Enter one movie per line...'), {
      target: { value: 'One\nTwo\nThree\nFour\nFive' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Search List' }))

    await waitFor(() => {
      expect(searchMoviesMock).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByText('Only 2 movies were added because the list is already capped at 100.')).toBeInTheDocument()
    expect(screen.getByText(/(?:Movies|Peliculas) \(100\)/)).toBeInTheDocument()
  })

  it('stops collection requests at remaining capacity and warns with added count', async () => {
    renderSearchPage(Array.from({ length: MAX_MOVIES_IN_LIST - 2 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: /Movie Collections/i }))
    fireEvent.click(screen.getByText('Top Picks'))

    await waitFor(() => {
      expect(searchMoviesMock).toHaveBeenCalledTimes(2)
    })

    expect(screen.getByText('Only 2 movies were added because the list is already capped at 100.')).toBeInTheDocument()
    expect(screen.getByText(/(?:Movies|Peliculas) \(100\)/)).toBeInTheDocument()
  })

  it('caps discover adds at 100 and shows partial warning when near limit', async () => {
    renderSearchPage(Array.from({ length: MAX_MOVIES_IN_LIST - 2 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Mock discover add' }))

    await waitFor(() => {
      expect(screen.getByText('Only 2 movies were added because the list is already capped at 100.')).toBeInTheDocument()
    })

    expect(screen.getByText(/(?:Movies|Peliculas) \(100\)/)).toBeInTheDocument()
  })
})
