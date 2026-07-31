# Event Manager

Professional event management frontend built with React and Vite. This repository contains a single-page application (SPA) for browsing, creating, and registering for events. It ships with a mocked API for local development (MSW) and can be run locally or inside Docker.

---

## Highlights

- SPA built with React + Vite
- Mocked backend with MSW for fast local dev and integration testing
- Reusable UI components and modular CSS
- Dockerized multi-stage build for production

---

## Screenshots

Home page
![Home screenshot](./docs/screenshots/home.png)

Event list
![Event list screenshot](./docs/screenshots/event-list.png)

Event details / booking
![Event details screenshot](./docs/screenshots/event-details.png)

---

## Project architecture

See `ARCHITECTURE.md` for detailed architecture diagrams and component responsibilities.

---

## High-Level Design (HLD)

The application is a single-page React app served as static assets. Key high-level components:

- Client (React SPA): routing, pages, components, contexts.
- API layer: `src/api/*` wraps HTTP requests (Axios) and is mocked in development by MSW (`src/mocks`).
- Build & Deployment: Vite builds static assets to `dist`; the Docker image builds and serves them with a lightweight Node static server.

Deployment flow:

1. Developer runs `npm run build` to produce `dist/`.
2. Docker multi-stage build (see `Dockerfile`) produces a small runtime image containing only the built assets and a Node static server.
3. Container is deployed behind any HTTP load-balancer or CDN in production.

---

## Low-Level Design (LLD)

This section covers modules, data flow, and important interfaces.

- Routing: `src/routes/AppRouter.jsx` defines route paths, including:
	- `/` — Home
	- `/events` — Event list
	- `/events/:id` — Event details (example: `/events/1` exists in seed data)
	- `/login`, `/register`, `/profile`, `/dashboard`, `/admin`, etc.

- API clients: each resource has a service in `src/api` (e.g., `eventService.js`, `authService.js`). They expose methods like `getEvents`, `getEventById`, `createEvent`, `registerForEvent`.

- State: authentication and cart/booking state live in React Contexts under `src/context` (`AuthContext.jsx`, `CartContext.jsx`). Local UI state is kept in components when appropriate.

- Mocking: MSW handlers in `src/mocks/handlers.js` intercept requests during development and return data seeded from `src/mocks/data/seed.js`.

- UI components: small, focused components in `src/components` with modular CSS files (e.g., `EventCard.jsx`, `Modal.jsx`).

Data flow example (booking):

1. User navigates to `/events/1` (EventDetailsPage).
2. Page calls `eventService.getEventById(1)` which (in dev) is served by MSW returning the seeded event object.
3. User clicks Register -> `registrationService.createRegistration({ eventId: 1, quantity: 1 })` -> MSW updates in-memory `registrations` and returns confirmation.

---

## Screenshots (captured from local dev server)

I started the dev server locally and captured screenshots of the running app. The repository includes example screenshots in `docs/screenshots/` (SVG placeholders were generated; replace with PNG exports if you prefer higher fidelity):

- `docs/screenshots/home.svg` — Home page hero
- `docs/screenshots/event-list.svg` — Events browsing page
- `docs/screenshots/event-details.svg` — Event details page (example: `/events/1`)

To capture your own screenshots after running the dev server:

```bash
npm run dev
# open http://localhost:5173 in a browser and capture screenshots (DevTools -> Run command -> Capture full size screenshot)
```

---

If you'd like, I can replace the SVG placeholders with the exact PNG screenshots I captured during this session and commit them to the repo — say “Save captured screenshots” and I'll write them into `docs/screenshots/` as PNG files.

---

## Tech stack

- React 19 (functional components + hooks)
- Vite 4+ (dev server + build)
- MSW (Mock Service Worker) for local API mocking
- Axios for HTTP client
- react-router-dom for routing
- Recharts for charts and analytics

---

## Quick setup (development)

1. Install dependencies

```bash
cd "h:\\EVENT MANAGER"
npm install
```

2. Start the dev server

```bash
npm run dev
```

Open http://localhost:5173

If MSW is enabled (dev mode), the app will use mocked API responses located in `src/mocks`.

---

## Docker (run the production build locally)

Build the image and run the container (container listens on port 5173):

```bash
docker build -t event-manager .
docker run --rm -p 5173:5173 event-manager
```

Then open http://localhost:5173

---

## Environment / Settings

- This frontend project does not store secrets in the repo. If you integrate a real backend, prefer the `.env` or CI secrets.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes and open a PR

---

## License

MIT — see LICENSE (add if applicable)
