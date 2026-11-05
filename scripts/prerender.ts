/**
 * Renders <App /> to static HTML and injects it into dist/index.html so the page has
 * content before JavaScript runs. Runs after `vite build`; the client hydrates it.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from '../src/App.tsx'

const file = new URL('../dist/index.html', import.meta.url)
const shell = '<div id="root"></div>'
const html = readFileSync(file, 'utf8')

if (!html.includes(shell)) {
  throw new Error(`prerender: ${shell} not found in dist/index.html`)
}

writeFileSync(file, html.replace(shell, `<div id="root">${renderToString(createElement(App))}</div>`))
console.log('prerender: wrote dist/index.html')
