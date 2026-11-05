import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App.tsx'
import { person, projects, work } from './content.tsx'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }))
  })

  it('introduces Carlos', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: person.name })).toBeTruthy()
  })

  it('lists every role', () => {
    render(<App />)
    const list = screen.getByRole('heading', { name: 'Work' }).nextElementSibling as HTMLElement
    expect(within(list).getAllByRole('listitem')).toHaveLength(work.length)
  })

  it('opens every project in a new tab without leaking the opener', () => {
    render(<App />)
    for (const project of projects) {
      const link = screen.getByRole('link', { name: new RegExp(project.name) })
      expect(link.getAttribute('href')).toBe(project.href)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }
  })

  it('keeps the email link in the same tab', () => {
    render(<App />)
    const email = screen.getByRole('link', { name: 'Email' })
    expect(email.getAttribute('href')).toBe(`mailto:${person.email}`)
    expect(email.hasAttribute('target')).toBe(false)
  })

  it('shows the local time after mounting', () => {
    render(<App />)
    expect(screen.getByText(new RegExp(`in ${person.city}$`))).toBeTruthy()
  })
})
