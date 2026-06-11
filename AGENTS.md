# AGENTS.md

## Project overview

Range App is a single-page web app (Vite + React + TypeScript) for ranchers to track
herds, pastures, and head counts. There is no backend — herd data is persisted in the
browser via `localStorage`. See `README.md` for scripts and project structure.

## Cursor Cloud specific instructions

- Dependencies are installed automatically on startup (`npm install`). No extra system
  packages are required; the app uses Node 22 (already present on the VM).
- This is a frontend-only SPA. The only service is the Vite dev server:
  `npm run dev` (serves on `http://localhost:5173`, bound to `0.0.0.0`). There is no
  database, API, or other backend process to start.
- Standard commands are defined in `package.json`: `npm run dev`, `npm run build`
  (runs `tsc -b` then `vite build`), `npm run lint` (ESLint), `npm run preview`.
- App state lives entirely in browser `localStorage` under the key `range-app:herds`.
  To reset to a clean state during manual testing, clear site data / that key in the
  browser; there is no server-side state to reset.
