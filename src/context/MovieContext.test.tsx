import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { MovieProvider, useMovies } from './MovieContext'
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

describe('setTmdbApiKey', () => {
  it('updates the API key', () => {
    const { result } = renderHook(() => useMovies(), { wrapper })
    act(() => {
      result.current.setTmdbApiKey('my-new-key')
    })
    expect(result.current.tmdbApiKey).toBe('my-new-key')
  })
})
