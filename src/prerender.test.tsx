// @vitest-environment node
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { App } from './App.tsx'
import { person, projects } from './content.tsx'

// Mirrors scripts/prerender.ts: the page must render without a DOM.
describe('prerendered HTML', () => {
  const html = renderToString(<App />)

  it('contains the page content', () => {
    expect(html).toContain(person.name)
    for (const project of projects) expect(html).toContain(project.name)
  })

  it('leaves the clock empty so a stale build-time time never ships', () => {
    expect(html).toContain('<p class="site__time"></p>')
  })
})
