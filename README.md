# web-shop

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Self, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **tRPC** - End-to-end type-safe APIs
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **PWA** - Progressive Web App support

## Getting Started

First, install the dependencies:

```bash
npm install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up (`npm run db:start` runs one in Docker).
2. Update your `apps/web/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
npm run db:push
```

## Image storage (MinIO)

Product images are stored in [MinIO](https://min.io) (S3-compatible).

- `npm run minio:start` — start MinIO in Docker (console at http://localhost:9001, default
  credentials `minioadmin` / `minioadmin`, matching `apps/web/.env`).
- `npm run minio:stop` — stop it.
- The `product-images` bucket and its public read policy are created automatically on first
  upload.

## Admin panel

The admin panel (`/admin`) lets you add, edit and remove products, categories and product
images. To access it:

1. Start Postgres and MinIO (`npm run db:start` and `npm run minio:start`), push the schema,
   then run the app (`npm run dev`).
2. Sign up a normal account at [http://localhost:3001/login](http://localhost:3001/login).
3. Promote that account to admin: run `npm run db:studio`, open the `user` table, and set the
   `role` column to `admin` for your account.
4. Open [http://localhost:3001/admin](http://localhost:3001/admin).

Open [http://localhost:3001](http://localhost:3001) in your browser to see the fullstack application.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@web-shop/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Deployment

### Docker Compose

- Target: web + server
- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)
- Build images: npm run docker:build
- Start: npm run docker:up
- Logs: npm run docker:logs
- Stop: npm run docker:down

Environment variables are read from each app's `.env` file (baked into web builds for public variables) and overridden in `docker-compose.yml` for container networking.

For more details, see the guide on [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).

## Git Hooks and Formatting

- Run checks: `npm run check`

## Project Structure

```
web-shop/
├── apps/
│   └── web/         # Fullstack application (Next.js)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   ├── db/          # Database schema & queries
│   └── storage/     # MinIO (S3-compatible) client for product images
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:generate`: Generate database client/types
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open database studio UI
- `npm run minio:start` / `npm run minio:stop`: Start/stop the MinIO container for product images
- `npm run check`: Run Biome formatting and linting
- `cd apps/web && npm run generate-pwa-assets`: Generate PWA assets
- `npm run docker:build`: Build the Docker Compose images
- `npm run docker:up`: Build and start the Docker Compose stack
- `npm run docker:logs`: Tail logs from the Docker Compose stack
- `npm run docker:down`: Stop the Docker Compose stack
