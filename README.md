# Stowfully

Keep what matters. Find it when it does.

Stowfully is a local-first visual memory vault for links, notes, and images. It combines a calm card-based library with fast text/tag search, portable exports, and no required account.

![Stowfully social preview](public/og.png)

## Working MVP

- Capture links, notes, and small images
- Search titles, notes, URLs, and tags
- Filter by keepsake type
- Responsive masonry-style library
- Browser-local persistence
- JSON backup and restore
- Per-item deletion
- Seed collection that can be reset by clearing site data

The browser build keeps data in `localStorage`; images are limited to 1.5 MB to avoid silently exhausting browser storage. It does not fetch remote pages or upload anything.

## Develop

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Quality gate:

```bash
npm run check
npm audit
```

## Architecture

- React 19 and TypeScript
- Tailwind CSS and shadcn components
- Vinext/Vite with Cloudflare Workers output
- Pure vault validation/search helpers covered by Vitest
- Portable JSON as the canonical backup format

Stowfully is an independent project and is not affiliated with mymind or any bookmarking service.

## License

MIT
