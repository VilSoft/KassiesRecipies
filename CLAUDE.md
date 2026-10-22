# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Kassies Recipes is a full-stack application with TypeScript, React, and Node.js. Uses Mongoose for MongoDB, Redux for state management, and a Stripe/Apple-style design system with Framer Motion animations.

## Directory Structure
- **app/api**: Backend API routes (Next.js App Router)
- **app/globals.css**: Design tokens and global utility classes
- **components**: Frontend UI components
- **components/ui**: shadcn/ui + Radix primitives (Button, Input, Select, Dialog, etc.)
- **interfaces**: TypeScript interfaces and Zod validation schemas
- **models**: Mongoose models
- **redux**: Redux Toolkit store and slices
- **styles**: CSS Modules (List, Recipie, RecipieForm)
- **utils/connectMongo.tsx**: MongoDB connection setup

## Setup Instructions
1. Ensure MongoDB is running locally (`mongodb://localhost:27017/recipies`)
2. Start the development server: `npm run dev`

## Development Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Test**: `npm run test`
- **Run single test**: `npm run test -- --testName="YourTestName"`
- **Type check**: `npx tsc --noEmit`

## Key Technologies
- Next.js 15.1.3 (App Router), React 19, TypeScript 5
- Tailwind CSS 3.4 + CSS Modules
- shadcn/ui + Radix UI (Dialog, Select, NavigationMenu, etc.)
- Framer Motion (list stagger, form row AnimatePresence)
- Redux Toolkit + React-Redux
- React Hook Form + Zod validation
- Mongoose 8 + MongoDB
- lucide-react icons

## Design System
Mirrors the sibling **homeauto** dashboard (`../homeauto/styles/globals.css`). Brand color is indigo `--primary` (`243 75% 59%` light / `243 75% 65%` dark). `--accent` is a neutral hover surface (shadcn semantics) — never use it as the brand color. Inter font via `next/font` (`--font-inter`, `font-sans`).

**CSS variables** (defined in `app/globals.css` @layer base, HSL triplets):
- `--background`, `--foreground`, `--foreground-muted`, `--foreground-subtle`, `--surface`, `--surface-raised`
- `--card`, `--card-border`, `--card-edge` (full color incl. alpha — use `hsl(var(--card-edge))` only, no `/ alpha`), `--card-shadow`
- `--primary` (indigo), `--primary-foreground`, `--ring` (indigo)
- `--muted`, `--muted-foreground`, `--accent` (neutral), `--destructive`, `--success`
- `--nav-bg`, `--blob-opacity`
- `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-hover` (primary glow)
- `--radius: 0.75rem`, `--radius-sm`, `--radius-lg`, `--radius-xl`

CSS Modules reference `hsl(var(--primary) / x)` — no hardcoded color literals.

**Dark mode (default)**: near-black navy `230 40% 3%`. Light mode only when user picks it (`localStorage.theme === 'light'`). Toggled via `.dark` class on `<html>`.

**Global utility classes** in `globals.css`: `.section-label`, `.action-btn`, `.btn-primary`, `.btn-ghost`, `.search-input`, `.recipe-card-clean`, `.fade-up`, `.bg-blobs` / `.bg-blob-1..3` (drifting radial background in `Layout.tsx`), `.brand-title` (gradient wordmark), `.glass-nav` (blurred navbar)

**Cards**: translucent `hsl(var(--card) / 0.72–0.82)`, subtle edge border, hover → `--primary / 0.45` border + glow.

**Theme persistence**: FOUC-free via inline blocking script in `<head>` that reads `localStorage` before React hydrates.

## Animations
- **Recipe list**: Framer Motion stagger (`containerVariants` + `itemVariants`) in `Recipies.tsx`
- **Form rows**: `AnimatePresence mode="popLayout"` on ingredient/instruction rows in both form components — smooth enter/exit when adding/removing rows
- **Modals**: Radix `data-[state=open/closed]` CSS animation classes (do not wrap with Framer AnimatePresence)
- **Hover**: `whileHover={{ y: -2 }}` on recipe list items via Framer

## API Routes
| Method | Path | Action |
|--------|------|--------|
| GET | `/api/recipie` | Fetch all recipes |
| POST | `/api/recipie` | Add / modify / delete recipe |
| GET | `/api/conversion` | Fetch all conversions |
| POST | `/api/conversion` | Add conversion |
| GET | `/api/uploads/[filename]` | Serve uploaded images |
| GET | `/api/health` | Health check |

POST body uses `action: 'add' | 'modify' | 'delete'`. Add/modify use `multipart/form-data` with `image` file and `recipie` JSON fields.

## Redux Store Shape
```typescript
{
  recipieReducer: { value: { recipies: Array<recipie> } },
  convertionReducer: { value: { conversions: Array<conversion> } },
  recipieListReducer: {
    searchParam: string,
    addRecipieIsOpen: boolean,
    addConversionIsOpen: boolean,
    recipieIsOpen: boolean
  }
}
```

## MongoDB Notes
- Connection: `mongodb://localhost:27017/recipies` by default (IPv4 forced); override with `RECIPES_MONGO_URI`. Not `MONGO_URI` — that name held a placeholder in docker-compose and must not be honored.
- One cached connection per process (`globalThis`), never closed per request
- Models: `Recipie`, `Conversion`. GET routes use `.lean()` so reads return documents exactly as stored — keep that; live data may predate current schema fields
- Server-side validation in `interfaces/zServer.ts` (separate from, and looser than, the form schemas)
- Status codes: add → 201, modify/delete → 200, bad input → 400, missing → 404. Frontend checks `res.ok`
- Uploaded images are deleted when no recipe references them anymore (`utils/uploads.ts`)

## Important Rules
- **Do not modify** Redux store shape, API routes, Zod schemas, or React Hook Form logic without explicit request
- **Do not wrap** Radix Dialog/Modal with Framer `AnimatePresence` — Radix controls mount/unmount internally
- **Textarea auto-resize** logic (`scrollHeight`) in form components must be preserved
- **`onInteractOutside` prevention** in `Modal.tsx` is intentional — modals are non-dismissible by backdrop click
- All focus rings use indigo (`hsl(var(--ring))` / `--primary`)
- Dark mode overrides via CSS variable inheritance — no `html:global(.dark)` selectors needed in CSS Modules
