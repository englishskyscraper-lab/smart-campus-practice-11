# Smart Campus Room Availability

A single-page web app that checks whether a campus room is free for a requested time slot. It filters rooms by attendee capacity and required equipment, shows the day's bookings on a timeline, and explains why a request is accepted or rejected.

The data is fictional and kept in memory. The app has no backend, no login, and does not create bookings.

## Features

- **Room requirements**: enter the number of attendees and tick required equipment. The room list updates immediately.
- **Room picker**: shows each room's building, seat count, and a "Blocked" badge for rooms that cannot be booked.
- **Booking time**: choose a start time, an end time, and the current time (slider). Bookings are limited to 120 minutes.
- **Availability check**: returns "Available" or "Unavailable" with the reason. Back-to-back bookings are allowed.
- **Daily timeline**: shows existing bookings, the candidate interval, and the current time on a 24-hour track.
- **Responsive layout**: usable on phones, tablets, and desktops.

## Technologies

- React 18 with TypeScript
- Vite 5 (dev server and production build)
- Tailwind CSS 3 for styling
- lucide-react for icons
- Vitest for unit, integration, and UI tests
- React Testing Library and jsdom for UI tests
- ESLint with the TypeScript and React Hooks rules

## Installation

Requires Node.js (a current LTS release) and npm.

```bash
npm install
```

## Running the app

```bash
npm run dev
```

Vite prints the local address to open in the browser. To preview the production build:

```bash
npm run build
npm run preview
```

## Quality checks

| Check | Command | What it does |
| --- | --- | --- |
| All tests | `npx vitest run` | Runs all 78 tests in 6 files once and exits |
| Watch tests | `npx vitest` | Re-runs tests as files change |
| Type checking | `npm run typecheck` | Checks TypeScript types for `src` without emitting files |
| Lint | `npm run lint` | Runs ESLint over the project |
| Production build | `npm run build` | Bundles the app into `dist/` with Vite (does not type check) |

`package.json` has no `test` script, so tests are run with `npx vitest run`.

## Project structure

```
src/
  App.tsx                      Page layout and wiring
  App.test.tsx                 UI tests (rendered app, jsdom)
  components/Timeline.tsx      Daily timeline visualization
  data/                        Fictional rooms, bookings, and config
  features/availability/       Time form, result banner, check hook, flow tests
  features/rooms/              Requirements filters and room picker
  lib/                         Pure logic: availability, bookings, filters, time
  types.ts                     Shared types
```

## Documentation

- [Assignment 04 report](docs/Assignment04-Report.md)
- [AI use evidence](docs/AI-Evidence.md)
