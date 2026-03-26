# Life Directory

Personal CRM / people directory PWA.

## Stack
- React 19 + TypeScript
- Vite 6 with vite-plugin-pwa
- Dexie.js 4 (IndexedDB) for local-only data storage
- CSS Modules + CSS Custom Properties for styling
- React Router v7 (HashRouter) for client-side routing

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build to dist/
- `npm run preview` - Preview production build

## Deployment
- Vercel (primary): https://life-directory.vercel.app/
- GitHub Pages (legacy): https://awmrakyat13.github.io/LifeDirectory/
- Vercel auto-deploys on push to main (GitHub integration connected)
- Vite base path: /

## Architecture
- All data is local (IndexedDB via Dexie). No backend.
- Photos stored as Blobs in IndexedDB.
- PWA: installable, works offline via Workbox service worker.
- Dark mode via CSS custom properties + data-theme attribute.

## Data Model
- See src/models/types.ts for all interfaces.
- Tables: people, categories, personCategories (join), interactions, settings.
- People <-> Categories is many-to-many via personCategories join table.
