import { describe, it, expect } from 'vitest'
import { createInitialStages, getStageName } from './kombatUtils'
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

describe('getStageName', () => {
  it('last stage → Final', () => {
    expect(getStageName(0, 1)).toBe('Final')
    expect(getStageName(1, 2)).toBe('Final')
    expect(getStageName(2, 3)).toBe('Final')
  })

  it('second-to-last stage → Semi-Finals', () => {
    expect(getStageName(0, 2)).toBe('Semi-Finals')
    expect(getStageName(1, 3)).toBe('Semi-Finals')
  })

  it('third-to-last stage → Quarter-Finals', () => {
    expect(getStageName(0, 3)).toBe('Quarter-Finals')
    expect(getStageName(1, 4)).toBe('Quarter-Finals')
  })

  it('earlier stages → Round N (1-indexed)', () => {
    expect(getStageName(0, 4)).toBe('Round 1')
    expect(getStageName(1, 5)).toBe('Round 2')
  })
})
