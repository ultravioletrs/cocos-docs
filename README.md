# Cocos Docs

This is the source code for the Cocos AI documentation site, built with [Next.js](https://nextjs.org/) and [Fumadocs](https://fumadocs.dev/).

The site is configured to live under:

```txt
https://www.ultraviolet.rs/docs/cocos-ai
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or newer)
- [pnpm](https://pnpm.io/) (v11 or newer)

### Installation

```bash
pnpm install
```

### Develop

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000/docs/cocos-ai](http://localhost:3000/docs/cocos-ai) with your browser to see the docs.

### Validate

```bash
pnpm run lint
pnpm run types:check
```

Biome is used for code linting and formatting:

```bash
pnpm run lint:fix
pnpm run format
```

### Build

```bash
pnpm run build
```

The build exports static assets to `out/`, then nests the export under `out/docs/cocos-ai` so Cloudflare Workers can serve the docs at the configured base path.

## Project Structure

- `app/`: Next.js app router pages and layouts.
- `content/docs/`: Documentation content in Markdown and MDX.
- `lib/`: Utility functions and Fumadocs configuration.
- `public/`: Static assets, Cloudflare `_headers`, `_redirects`, and `robots.txt`.
- `scripts/nest-static-export.mjs`: Moves the static export under `out/docs/cocos-ai`.
- `wrangler.jsonc`: Cloudflare Workers assets deployment config.

## Deploy

The site is exported as static assets and can be deployed to Cloudflare Workers with Wrangler:

```bash
pnpm run deploy
```

To upload a version without deploying it immediately:

```bash
pnpm run upload
```
