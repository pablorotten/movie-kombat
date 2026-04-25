import { describe, it, expect } from 'vitest'
import { getProviderLogoUrl } from './providerUtils'

describe('getProviderLogoUrl', () => {
  it('returns a full URL with the default size (w154)', () => {
    expect(getProviderLogoUrl('/logo.jpg')).toBe('https://image.tmdb.org/t/p/w154/logo.jpg')
  })

  it('returns a full URL with a custom size', () => {
    expect(getProviderLogoUrl('/logo.jpg', 'original')).toBe('https://image.tmdb.org/t/p/original/logo.jpg')
    expect(getProviderLogoUrl('/logo.jpg', 'w300')).toBe('https://image.tmdb.org/t/p/w300/logo.jpg')
  })

  it('returns an empty string for an empty logo path', () => {
    expect(getProviderLogoUrl('')).toBe('')
  })
})
