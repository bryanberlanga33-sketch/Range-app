# AGENTS.md

## Project overview

This repository hosts ranch/rangeland tooling. The `mobile/` directory contains
**Rangeland Journal**, an iOS app (Expo + React Native + expo-router, TypeScript) for
journaling rangeland conditions on a property. A landing page links to four feature
screens: Journal Entries, Locations, Plant Species, and Livestock & Wildlife. Records
are persisted on-device via AsyncStorage (uses `localStorage` when run on web).

## Cursor Cloud specific instructions

- The mobile app lives in `mobile/`. Run all `npm`/`expo` commands from that directory
  (it has its own `package.json`). Dependencies install automatically on startup.
- This is a frontend-only Expo app — there is no backend/database/API service to start.
- Standard commands (run inside `mobile/`):
  - `npm run web` (or `npx expo start --web`) — start the dev server. Web is served on
    `http://localhost:8081` and is the way to preview/test in the Cloud VM (no macOS
    needed). The first run of `expo start` for native targets prints a QR code for
    Expo Go; the web build is what runs headlessly here.
  - `npm run ios` — requires macOS/Xcode (or Expo Go on a device); not runnable in the
    Linux Cloud VM. Use `npm run web` for verification here instead.
  - `npm run lint` — runs `expo lint` (ESLint). Type-check with `npx tsc --noEmit`.
- Routing is file-based via expo-router under `mobile/src/app/` (the `@/*` path alias
  maps to `mobile/src/*`). Add a screen by creating a file there and registering it in
  `src/app/_layout.tsx`.
- On-device data is stored under AsyncStorage keys `journal-entries`, `locations`,
  `plant-species`, and `livestock-wildlife`. On web this maps to `localStorage`; clear
  those keys to reset state during manual testing.
