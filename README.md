# FRUCSOR - Fructose & Sorbitol Scanner

Migrated from static HTML to Next.js 15.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Application routes (Home, Analysis, Planner).
- `src/components`: Reusable components (BottomNav).
- `src/app/globals.css`: Global styles and Tailwind v4 configuration (`@theme`).
- `_legacy`: Backup of the original `code.html`.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Fonts**: Space Grotesk (via `next/font/google`)
- **Icons**: Material Symbols Outlined (CDN)

## Key Features

- **PWA-ready layout**: Bottom navigation and mobile-first grid.
- **Design System**: "Mondrian" inspired card layout with strict color palette.
- **Optimized Assets**: Uses `next/image` for performance.
- **Dark Mode**: Fully supported via Tailwind `dark:` classes.
