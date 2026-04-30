import { useEffect } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { MovieProvider, useMovies } from './context/MovieContext'
import type { Movie } from './types'

vi.mock('./pages/SearchPage', () => ({
  default: () => <div>Search Page</div>,
}))

vi.mock('./pages/KombatPage', async () => {
  const React = await vi.importActual<typeof import('react')>('react')
  const movieContextModule = await vi.importActual<typeof import('./context/MovieContext')>('./context/MovieContext')

  return {
    default: function KombatPageMock() {
      const { movieList } = movieContextModule.useMovies()
      return React.createElement('div', undefined, `Kombat Page ${movieList.length}`)
    },
  }
})

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

function renderApp(movies: Movie[]) {
  localStorage.setItem('hasCompletedPreferences', 'true')
  localStorage.setItem('selectedRegion', 'ES')
  localStorage.setItem('selectedProviderIds', JSON.stringify([8]))

  return render(
    <MemoryRouter initialEntries={['/']}>
      <MovieProvider>
        <SeedMovies movies={movies} />
        <App />
      </MovieProvider>
    </MemoryRouter>
  )
}

describe('App kombat start flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('shows a dynamic missing-movies message when there are fewer than 8 movies', () => {
    renderApp([1, 2, 3, 4, 5].map(makeMovie))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Add 3 movies to start!')).toBeInTheDocument()
  })

  it('shows a dynamic missing-movies message when there are between 9 and 15 movies', () => {
    renderApp(Array.from({ length: 12 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Add 4 movies to start!')).toBeInTheDocument()
  })

  it('starts kombat directly with exactly 8 movies', () => {
    renderApp(Array.from({ length: 8 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 8')).toBeInTheDocument()
  })

  it('starts kombat directly with exactly 16 movies', () => {
    renderApp(Array.from({ length: 16 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 16')).toBeInTheDocument()
  })

  it('stays on the selection screen when the user cancels the over-limit dialog', () => {
    renderApp(Array.from({ length: 18 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))
    expect(screen.getByText('Too many movies selected')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByText('Too many movies selected')).not.toBeInTheDocument()
    expect(screen.getByText('Search Page')).toBeInTheDocument()
  })

  it('randomly trims to 16 movies and starts kombat when the user confirms', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    renderApp(Array.from({ length: 18 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK, pick 16' }))

    expect(screen.getByText('Kombat Page 16')).toBeInTheDocument()
  })
})