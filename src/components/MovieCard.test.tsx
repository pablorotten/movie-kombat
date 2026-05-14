import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MovieCard from './MovieCard'
import { MovieProvider, useMovies } from '../context/MovieContext'
import React from 'react'

// Helper to render with context
const renderWithContext = (component: React.ReactElement) => {
  return render(
    <MovieProvider>
      {component}
    </MovieProvider>
  )
}

// Helper component that exposes the poster visibility toggle
function ToggleWrapper({ title, poster, imdbID }: { title: string; poster: string; imdbID: string }) {
  const { togglePostersVisibility } = useMovies()
  return (
    <>
      <button data-testid="toggle-posters" onClick={togglePostersVisibility}>
        Toggle
      </button>
      <MovieCard title={title} poster={poster} imdbID={imdbID} onDelete={vi.fn()} />
    </>
  )
}

describe('MovieCard', () => {
  it('displays movie title and poster', () => {
    renderWithContext(
      <MovieCard
        title="Inception"
        poster="/poster.jpg"
        imdbID="tt1234"
        onDelete={vi.fn()}
      />
    )
    
    expect(screen.getByText('Inception')).toBeInTheDocument()
    expect(screen.getByAltText('Inception poster')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', async () => {
    const mockDelete = vi.fn()
    const user = userEvent.setup()
    
    renderWithContext(
      <MovieCard
        title="Inception"
        poster="/poster.jpg"
        imdbID="tt1234"
        onDelete={mockDelete}
      />
    )
    
    // Find and click delete button
    const deleteButton = screen.getByRole('button')
    await user.click(deleteButton)
    
    expect(mockDelete).toHaveBeenCalledWith('tt1234')
  })

  it('shows text poster instead of image when posters are hidden', async () => {
    const user = userEvent.setup()

    render(
      <MovieProvider>
        <ToggleWrapper title="Inception" poster="/poster.jpg" imdbID="tt1234" />
      </MovieProvider>
    )

    await user.click(screen.getByTestId('toggle-posters'))

    // PosterImage renders an h2 with the uppercased title when posters are hidden
    expect(screen.getByRole('heading', { name: 'INCEPTION' })).toBeInTheDocument()
  })

  it('shows a loading spinner while platform providers are being fetched', async () => {
    let resolveFetch: ((response: Response) => void) | undefined

    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve
          })
      )
    )

    renderWithContext(
      <MovieCard
        title="Inception"
        poster="/poster.jpg"
        imdbID="tmdb_999999"
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByRole('status', { name: 'Loading platforms' })).toBeInTheDocument()

    resolveFetch?.(
      new Response(JSON.stringify({ id: 999999, results: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'Loading platforms' })).not.toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })

  it('shows one icon per offered platform when TMDB returns duplicate aliases', async () => {
    localStorage.setItem('selectedRegion', 'ES')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              id: 999999,
              results: {
                ES: {
                  flatrate: [
                    { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/disney-legacy.png' },
                    { provider_id: 122, provider_name: 'Disney+', logo_path: '/disney.png' },
                    { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/prime-a.png' },
                    { provider_id: 119, provider_name: 'Amazon Prime Video', logo_path: '/prime-b.png' },
                    { provider_id: 35, provider_name: 'Rakuten TV', logo_path: '/rakuten.png' },
                  ],
                },
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
        ),
      ),
    )

    renderWithContext(
      <MovieCard
        title="Inception"
        poster="/poster.jpg"
        imdbID="tmdb_999998"
        onDelete={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByAltText('Disney+ logo')).toBeInTheDocument()
    })

    expect(screen.getAllByAltText('Disney+ logo')).toHaveLength(1)
    expect(screen.getAllByAltText('Amazon Prime Video logo')).toHaveLength(1)
    expect(screen.queryByAltText('Rakuten TV logo')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalled()
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain('/movie/999998/watch/providers')

    vi.unstubAllGlobals()
    localStorage.removeItem('selectedRegion')
  })
})
