# Portfolio

My personal site: one page with a bio, work history, and side projects on a dotted-notebook background.

Page copy lives in `src/content.tsx`. The dot grid and cursor spotlight are tuned with CSS variables (`--dot-*`, `--spot-*`) in `src/index.css`.

Built with React, TypeScript, and Vite. Uses [Bun](https://bun.sh) as the package manager and script runner.

## Development

```bash
bun install
bun run dev      # start dev server
bun run build    # type-check, build, and prerender the page to static HTML
bun run lint     # lint with oxlint
bun run test     # run the Vitest suite
```
