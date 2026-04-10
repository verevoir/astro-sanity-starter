# Astro + Verevoir Starter

A minimal Astro starter powered by [Verevoir](https://verevoir.io) — composable TypeScript libraries for structured content. No hosted backend, no API keys, no vendor lock-in.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no accounts, no environment variables, no external services.

## What's Inside

A marketing site with composable page sections, all content-managed through Verevoir's schema engine and storage adapter:

- **Hero** — large heading, markdown body, call-to-action buttons
- **Cards** — grid of feature cards with badges, images, and CTAs
- **Logos** — animated logo strip with configurable motion
- **Testimonials** — quote cards with author info
- **CTA** — call-to-action section with heading and buttons

### Tech Stack

- [Astro](https://astro.build) — static site generation
- [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com) — styling and components
- [@verevoir/schema](https://www.npmjs.com/package/@verevoir/schema) — content model definitions
- [@verevoir/storage](https://www.npmjs.com/package/@verevoir/storage) — persistence (MemoryAdapter for dev)

## How It Works

1. **Content models** are defined in `src/schema/` using `defineBlock()` from `@verevoir/schema`
2. **Sample content** is seeded into a `MemoryAdapter` at startup via `src/seed.ts`
3. **Data fetching** uses `storage.list()` and `storage.get()` — no query language, no API calls
4. **Astro components** render each section type with Tailwind/DaisyUI styling

### Key Files

| File | Purpose |
|------|---------|
| `src/schema/` | Verevoir block definitions (content types) |
| `src/storage.ts` | MemoryAdapter singleton |
| `src/seed.ts` | Sample content — edit this to change what's on the site |
| `src/data/` | Data fetching layer (StorageAdapter calls) |
| `src/pages/[...slug].astro` | Dynamic page routing |
| `src/components/` | Astro components for each section type |

## Customising Content

Edit `src/seed.ts` to change the site content. Add new pages, modify sections, update copy. The MemoryAdapter reseeds on every dev server restart, so changes appear immediately.

## Going to Production

The MemoryAdapter is perfect for development and static sites. For a production CMS with persistent storage:

1. Install `pg` and configure a PostgreSQL database
2. Swap `MemoryAdapter` for `PostgresAdapter` in `src/storage.ts`
3. Add `@verevoir/editor` for a content editing UI
4. Move seed data into the database

See the [Verevoir documentation](https://verevoir.io) for guides on storage adapters, editors, and deployment.

## License

MIT
