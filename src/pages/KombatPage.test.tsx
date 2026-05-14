import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { useEffect } from 'react'
import KombatPage from './KombatPage'
import { LANGUAGE_ES_ES } from '../constants/languages'
import { MovieProvider, useMovies } from '../context/MovieContext'
import { Movie } from '../types'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
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

function renderKombatPage(options?: { movies?: Movie[]; language?: string }) {
  const movies = options?.movies ?? [makeMovie(1), makeMovie(2)]

  if (options?.language) {
    localStorage.setItem('searchLanguage', options.language)
  }

  return render(
    <MemoryRouter>
      <MovieProvider>
        <SeedMovies movies={movies} />
        <KombatPage />
      </MovieProvider>
    </MemoryRouter>
  )
}

describe('KombatPage fight animation flow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    navigateMock.mockReset()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('hides choose buttons immediately and advances only after final delay', () => {
    renderKombatPage()

    const chooseButton = screen.getAllByRole('button', { name: 'Choose' })[0]
    fireEvent.click(chooseButton)

    expect(screen.queryByRole('button', { name: 'Choose' })).not.toBeInTheDocument()
    expect(screen.queryByText('🏆 The Winner Is! 🏆')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2299)
    })
    expect(screen.queryByText('🏆 The Winner Is! 🏆')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByText('🏆 The Winner Is! 🏆')).toBeInTheDocument()
  })

  it('shows FINISH HIM first and then FATALITY text at expected delays', () => {
    renderKombatPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[0])

    expect(screen.queryByText('FINISH HIM!!')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByText('FINISH HIM!!')).toBeInTheDocument()
    expect(screen.queryByText('FATALITY!')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText('FATALITY!')).toBeInTheDocument()
  })

  it('applies winner charge class after charge delay when first movie is chosen', () => {
    const { container } = renderKombatPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[0])

    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect(container.querySelector('.kombat-winner-charge-right')).toBeTruthy()
  })

  it('uses explode fatality class when random selects explode', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.34) // floor(0.34*3)=1 => explode
    const { container } = renderKombatPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[0])

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(container.querySelector('.kombat-loser-explode')).toBeTruthy()
  })

  it('uses smash-right when first movie wins', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8) // floor(0.8*3)=2 => smash
    const { container } = renderKombatPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[0])

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(container.querySelector('.kombat-loser-smash-right')).toBeTruthy()
    expect(container.querySelector('.kombat-loser-smash-left')).toBeFalsy()
  })

  it('uses smash-left when second movie wins', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.8) // floor(0.8*3)=2 => smash
    const { container } = renderKombatPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[1])

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(container.querySelector('.kombat-loser-smash-left')).toBeTruthy()
    expect(container.querySelector('.kombat-loser-smash-right')).toBeFalsy()
  })

  it('renders slice halves when random selects slice', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // floor(0*3)=0 => slice
    const { container } = renderKombatPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[0])

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(container.querySelector('.kombat-slice-top')).toBeTruthy()
    expect(container.querySelector('.kombat-slice-bottom')).toBeTruthy()
  })

  it('shows English fatality texts even when language is es-ES', () => {
    renderKombatPage({ language: LANGUAGE_ES_ES })

    fireEvent.click(screen.getAllByRole('button', { name: 'Elegir' })[0])

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByText('FINISH HIM!!')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText('FATALITY!')).toBeInTheDocument()
  })

  it('scrolls to the top when the Kombat page mounts', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)

    renderKombatPage()

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('cleans timers on unmount without throwing', () => {
    const { unmount } = renderKombatPage()

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[0])
    unmount()

    expect(() => {
      act(() => {
        vi.runAllTimers()
      })
    }).not.toThrow()
  })

  it('advances past round 10/16 with 20 movies and continues to next stage', () => {
    renderKombatPage({ movies: Array.from({ length: 20 }, (_, index) => makeMovie(index + 1)) })

    for (let round = 0; round < 10; round += 1) {
      fireEvent.click(screen.getAllByRole('button', { name: 'Choose' })[0])
      act(() => {
        vi.advanceTimersByTime(2300)
      })
    }

    expect(screen.getByText('Round 1 of 8')).toBeInTheDocument()
  })
})
