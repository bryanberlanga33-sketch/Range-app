# Range-app

The repository for my range app for ranchers.

Range App is a starter ranch-management web app for tracking **herds**, **pastures**,
and head counts. It is built with [Vite](https://vite.dev/), React, and TypeScript.
Herd data is persisted locally in the browser via `localStorage`.

## Requirements

- Node.js 22+ (the repo is developed against Node 22)
- npm (ships with Node)

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
```

## Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server (hot reload)       |
| `npm run build`   | Type-check and build the production bundle   |
| `npm run preview` | Preview the production build locally         |
| `npm run lint`    | Run ESLint over the project                  |

## Project structure

```
src/
  main.tsx            # React entry point
  App.tsx             # App shell, stats, and state
  types.ts            # Shared types (Herd, LivestockType)
  storage.ts          # localStorage load/save helpers
  components/
    HerdForm.tsx      # Form to add a herd
    HerdList.tsx      # List/remove herds
```
