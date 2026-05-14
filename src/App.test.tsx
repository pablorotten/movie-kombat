import { useEffect } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { MovieProvider, useMovies } from './context/MovieContext'
import { LANGUAGE_ES_ES } from './constants/languages'
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

  it('shows a dynamic missing-movies message when there are fewer than 4 movies', () => {
    renderApp([1, 2, 3].map(makeMovie))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Add 1 movie to start!')).toBeInTheDocument()
  })

  it('starts kombat directly with exactly 4 movies', () => {
    renderApp(Array.from({ length: 4 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 4')).toBeInTheDocument()
  })

  it('starts kombat directly when there are 5-7 movies', () => {
    renderApp(Array.from({ length: 6 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 6')).toBeInTheDocument()
  })

  it('starts kombat directly with exactly 8 movies', () => {
    renderApp(Array.from({ length: 8 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 8')).toBeInTheDocument()
  })

  it('starts kombat directly when there are 9-15 movies', () => {
    renderApp(Array.from({ length: 12 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 12')).toBeInTheDocument()
  })

  it('starts kombat directly with exactly 16 movies', () => {
    renderApp(Array.from({ length: 16 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 16')).toBeInTheDocument()
  })

  it('starts kombat directly when there are 17-20 movies', () => {
    renderApp(Array.from({ length: 20 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Kombat Page 20')).toBeInTheDocument()
  })

  it('shows pick-20 dialog when there are more than 20 movies', () => {
    renderApp(Array.from({ length: 21 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Too many movies')).toBeInTheDocument()
    expect(
      screen.getByText("There're too many movies!!!. I recommend to select 20 max! I can randomly select them and start the Kombat"),
    ).toBeInTheDocument()
  })

  it('shows updated Spanish pick-20 message without "Hay demasiadas películas"', () => {
    localStorage.setItem('searchLanguage', LANGUAGE_ES_ES)
    renderApp(Array.from({ length: 21 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Empezar Kombat' }))

    expect(screen.getByText('Demasiadas películas')).toBeInTheDocument()
    expect(
      screen.getByText('Te recomiendo seleccionar un máximo de 20. Puedo seleccionarlas al azar y empezar el Kombat.'),
    ).toBeInTheDocument()
  })

  it('shows the empty-list prompt when there are no movies', () => {
    renderApp([])

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))

    expect(screen.getByText('Add movies to start the Kombat')).toBeInTheDocument()
  })

  it('stays on the selection screen when the user cancels the pick-20 dialog', () => {
    renderApp(Array.from({ length: 21 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))
    expect(screen.getByText('Too many movies')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByText('Too many movies')).not.toBeInTheDocument()
    expect(screen.getByText('Search Page')).toBeInTheDocument()
  })

  it('randomly trims to 20 movies and starts kombat when the user confirms pick-20', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    renderApp(Array.from({ length: 32 }, (_, index) => makeMovie(index + 1)))

    fireEvent.click(screen.getByRole('button', { name: 'Start Kombat' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(await screen.findByText('Kombat Page 20')).toBeInTheDocument()
  })
})
