import { describe, it, expect } from 'vitest'
import {
  createInitialStages,
  getKombatStartRequirement,
  getStageName,
  MAX_KOMBAT_MOVIES,
  MIN_KOMBAT_MOVIES,
  selectRandomMovies,
} from './kombatUtils'
import { Movie } from '../types'

const makeMovie = (n: number): Movie => ({
  Title: `Movie ${n}`,
  Year: '2020',
  imdbID: `tt${n}`,
  Type: 'movie',
  Poster: `/poster${n}.jpg`,
})

describe('createInitialStages', () => {
  it('2 movies → 1 stage with 1 match, no TBDs', () => {
    const stages = createInitialStages([makeMovie(1), makeMovie(2)])
    expect(stages).toHaveLength(1)
    expect(stages[0]).toHaveLength(1)
    expect(stages[0][0].first.id).toBe('tt1')
    expect(stages[0][0].second.id).toBe('tt2')
    expect(stages[0][0].winnerTitle).toBe('')
  })

  it('4 movies → 2 stages with correct match counts', () => {
    const stages = createInitialStages([1, 2, 3, 4].map(makeMovie))
    expect(stages).toHaveLength(2)
    expect(stages[0]).toHaveLength(2)
    expect(stages[1]).toHaveLength(1)
  })

  it('8 movies → 3 stages with correct match counts', () => {
    const stages = createInitialStages([1, 2, 3, 4, 5, 6, 7, 8].map(makeMovie))
    expect(stages).toHaveLength(3)
    expect(stages[0]).toHaveLength(4)
    expect(stages[1]).toHaveLength(2)
    expect(stages[2]).toHaveLength(1)
  })

  it('3 movies → padded to 4, last slot is TBD', () => {
    const stages = createInitialStages([1, 2, 3].map(makeMovie))
    expect(stages).toHaveLength(2)
    expect(stages[0]).toHaveLength(2)
    expect(stages[0][1].second.id).toMatch(/^tbd/)
  })

  it('1 movie → padded to 2, BYE auto-advances winner', () => {
    const stages = createInitialStages([makeMovie(1)])
    expect(stages).toHaveLength(1)
    expect(stages[0][0].winnerTitle).toBe('Movie 1')
  })

  it('3 movies → BYE auto-advances movie 3 and propagates to next stage', () => {
    const stages = createInitialStages([1, 2, 3].map(makeMovie))
    // Match index 1: Movie 3 vs TBD → BYE
    expect(stages[0][1].winnerTitle).toBe('Movie 3')
    // Movie 3 should be propagated as second slot in the stage-1 match
    expect(stages[1][0].second.id).toBe('tt3')
  })

  it('movies are mapped to correct id, title, poster', () => {
    const stages = createInitialStages([makeMovie(1), makeMovie(2)])
    const { first, second } = stages[0][0]
    expect(first).toMatchObject({ id: 'tt1', title: 'Movie 1', poster: '/poster1.jpg' })
    expect(second).toMatchObject({ id: 'tt2', title: 'Movie 2', poster: '/poster2.jpg' })
  })
})

describe('getKombatStartRequirement', () => {
  it('reports how many movies are needed to reach the minimum bracket size', () => {
    expect(getKombatStartRequirement(5)).toEqual({
      status: 'below-minimum',
      missingMovies: 3,
      targetMovieCount: MIN_KOMBAT_MOVIES,
    })
  })

  it('allows starting immediately when minimum count is reached', () => {
    expect(getKombatStartRequirement(8)).toEqual({ status: 'ready' })
  })

  it('requires more movies when count is between 9 and 15', () => {
    expect(getKombatStartRequirement(12)).toEqual({
      status: 'below-recommended',
      missingMovies: 4,
      targetMovieCount: MAX_KOMBAT_MOVIES,
    })
  })

  it('allows starting immediately with 16 movies', () => {
    expect(getKombatStartRequirement(16)).toEqual({ status: 'ready' })
  })

  it('allows starting immediately with exactly 16 movies', () => {
    expect(getKombatStartRequirement(16)).toEqual({ status: 'ready' })
  })

  it('requires trimming when more than 16 movies are selected', () => {
    expect(getKombatStartRequirement(21)).toEqual({
      status: 'above-maximum',
      extraMovies: 5,
      targetMovieCount: MAX_KOMBAT_MOVIES,
    })
  })
})

describe('selectRandomMovies', () => {
  it('returns all movies unchanged when the pool is already within the limit', () => {
    const movies = [1, 2, 3]
    expect(selectRandomMovies(movies, 16, () => 0.5)).toEqual(movies)
  })

  it('shuffles and trims the pool to the requested size', () => {
    const pool = [1, 2, 3, 4, 5]
    const randomValues = [0.1, 0.8, 0.2, 0.6]
    let randomIndex = 0

    const selected = selectRandomMovies(pool, 3, () => {
      const value = randomValues[randomIndex]
      randomIndex += 1
      return value
    })

    expect(selected).toHaveLength(3)
    expect(selected).toEqual([3, 2, 5])
  })
})

describe('getStageName', () => {
  it('last stage → crown', () => {
    expect(getStageName(0, 1)).toBe('👑')
    expect(getStageName(1, 2)).toBe('👑')
    expect(getStageName(2, 3)).toBe('👑')
  })

  it('semi-final stage → 1/2', () => {
    expect(getStageName(0, 2)).toBe('1/2')
    expect(getStageName(1, 3)).toBe('1/2')
  })

  it('quarter-final stage → 1/4', () => {
    expect(getStageName(0, 3)).toBe('1/4')
    expect(getStageName(1, 4)).toBe('1/4')
  })

  it('eighth-final stage → 1/8', () => {
    expect(getStageName(0, 4)).toBe('1/8')
  })

  it('earlier stages use powers of two', () => {
    expect(getStageName(0, 5)).toBe('1/16')
    expect(getStageName(1, 6)).toBe('1/16')
  })
})
