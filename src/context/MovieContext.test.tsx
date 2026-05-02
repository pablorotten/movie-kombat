import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { MAX_MOVIES_IN_LIST, MovieProvider, useMovies } from './MovieContext'
import { Movie } from '../types'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MovieProvider>{children}</MovieProvider>
)

const makeMovie = (n: number): Movie => ({
  Title: `Movie ${n}`,
  Year: '2020',
  imdbID: `tt${n}`,
  Type: 'movie',
  Poster: `/poster${n}.jpg`,
})

beforeEach(() => {
  localStorage.clear()
})

describe('useMovies', () => {
  it('throws when used outside MovieProvider', () => {
    const consoleError = console.error
    console.error = () => {}
    expect(() => renderHook(() => useMovies())).toThrow(
      'useMovies must be used within a MovieProvider'
    )
    console.error = consoleError
  })
})

describe('addMovie', () => {
  it('adds a movie to the list', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    act(() => {
      result.current.addMovie(makeMovie(1))
    })
    expect(result.current.movieList).toHaveLength(1)
    expect(result.current.movieList[0].imdbID).toBe('tt1')
  })

  it('does not add a duplicate (same imdbID)', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    act(() => {
      result.current.addMovie(makeMovie(1))
    })
    act(() => {
      result.current.addMovie(makeMovie(1))
    })
    expect(result.current.movieList).toHaveLength(1)
  })

  it('does not add more than the max movie limit', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })

    act(() => {
      for (let i = 1; i <= MAX_MOVIES_IN_LIST + 1; i += 1) {
        result.current.addMovie(makeMovie(i))
      }
    })

    expect(result.current.movieList).toHaveLength(MAX_MOVIES_IN_LIST)
    expect(result.current.movieList[result.current.movieList.length - 1]?.imdbID).toBe(`tt${MAX_MOVIES_IN_LIST}`)
  })
})

describe('setMovieList', () => {
  it('truncates direct list updates above the max movie limit', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    const overLimitMovies = Array.from({ length: MAX_MOVIES_IN_LIST + 5 }, (_, index) =>
      makeMovie(index + 1)
    )

    act(() => {
      result.current.setMovieList(overLimitMovies)
    })

    expect(result.current.movieList).toHaveLength(MAX_MOVIES_IN_LIST)
    expect(result.current.movieList[result.current.movieList.length - 1]?.imdbID).toBe(`tt${MAX_MOVIES_IN_LIST}`)
  })
})

describe('removeMovie', () => {
  it('removes a movie by imdbID', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    act(() => {
      result.current.addMovie(makeMovie(1))
      result.current.addMovie(makeMovie(2))
    })
    act(() => {
      result.current.removeMovie('tt1')
    })
    expect(result.current.movieList).toHaveLength(1)
    expect(result.current.movieList[0].imdbID).toBe('tt2')
  })

  it('is a no-op if the imdbID is not in the list', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    act(() => {
      result.current.addMovie(makeMovie(1))
    })
    act(() => {
      result.current.removeMovie('tt999')
    })
    expect(result.current.movieList).toHaveLength(1)
  })
})

describe('togglePostersVisibility', () => {
  it('starts true, toggles to false, then back to true', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    expect(result.current.arePostersVisible).toBe(true)
    act(() => {
      result.current.togglePostersVisibility()
    })
    expect(result.current.arePostersVisible).toBe(false)
    act(() => {
      result.current.togglePostersVisibility()
    })
    expect(result.current.arePostersVisible).toBe(true)
  })
})

describe('setSearchLanguage', () => {
  it('updates the search language', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    act(() => {
      result.current.setSearchLanguage('es-ES')
    })
    expect(result.current.searchLanguage).toBe('es-ES')
  })
})

describe('preferences onboarding', () => {
  it('starts with onboarding incomplete and all popular providers selected', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })

    expect(result.current.hasCompletedPreferences).toBe(false)
    expect(result.current.selectedRegion).toBe('')
    expect(result.current.selectedProviderIds.length).toBeGreaterThan(0)
  })

  it('completes onboarding and persists provider selection changes', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })

    act(() => {
      result.current.setSelectedRegion('US')
      result.current.toggleSelectedProvider(result.current.selectedProviderIds[0])
      result.current.completePreferences()
    })

    expect(result.current.hasCompletedPreferences).toBe(true)
    expect(localStorage.getItem('hasCompletedPreferences')).toBe('true')
    expect(localStorage.getItem('selectedRegion')).toBe('US')
    expect(JSON.parse(localStorage.getItem('selectedProviderIds') || '[]')).toHaveLength(
      result.current.selectedProviderIds.length
    )
  })
})

