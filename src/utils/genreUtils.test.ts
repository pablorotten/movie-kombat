import { describe, it, expect } from 'vitest'
import { getGenreEmoji, getGenreWithEmoji } from './genreUtils'

describe('getGenreEmoji', () => {
  it('returns the correct emoji for known genres', () => {
    expect(getGenreEmoji('Action')).toBe('💥')
    expect(getGenreEmoji('Comedy')).toBe('😂')
    expect(getGenreEmoji('Horror')).toBe('👻')
    expect(getGenreEmoji('Science Fiction')).toBe('🚀')
    expect(getGenreEmoji('Western')).toBe('🤠')
  })

  it('returns fallback emoji for an unknown genre', () => {
    expect(getGenreEmoji('Unknown Genre')).toBe('🎬')
  })

  it('returns fallback emoji for an empty string', () => {
    expect(getGenreEmoji('')).toBe('🎬')
  })
})

describe('getGenreWithEmoji', () => {
  it('returns emoji followed by a space and the genre name', () => {
    expect(getGenreWithEmoji('Action')).toBe('💥 Action')
    expect(getGenreWithEmoji('Comedy')).toBe('😂 Comedy')
  })

  it('uses the fallback emoji for an unknown genre', () => {
    expect(getGenreWithEmoji('Unknown')).toBe('🎬 Unknown')
  })
})
