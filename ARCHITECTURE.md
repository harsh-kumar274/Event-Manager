# Architecture Overview

This document describes the high-level architecture of the Event Manager frontend application.

## Components

- src/pages — route-backed pages (Home, EventList, EventDetails, Admin, etc.)
- src/components — reusable UI components (Navbar, EventCard, Modal, Badge, Spinner)
- src/context — React contexts for Auth and Cart state
- src/api — thin HTTP client wrappers around Axios (auth, events, registration)
- src/mocks — MSW handlers and seed data used for local development and testing

## Runtime flow

1. User opens the SPA served by Vite (dev) or a static server (production Docker image).
2. The router (`react-router-dom`) maps URLs to `pages` components.
3. Pages call services in `src/api` which either perform real HTTP requests or use MSW in development.
4. Shared state is managed through `src/context` providers and local component state.

## Deployment

- Development: `npm run dev` runs Vite dev server with HMR and MSW.
- Production: built assets are produced by `npm run build` and served by a static Node server in Docker.

## Diagram (Mermaid)

```mermaid
flowchart LR
  Browser -->|HTTP| StaticServer[Static Server (Docker / serve)]
  StaticServer --> SPA[React SPA]
  SPA --> Router[react-router-dom]
  Router --> Pages[Pages (Home, EventList, Details)]
  Pages --> Components[UI Components]
  Pages -->|API| API[API Client (Axios)]
  API -->|dev: MSW| MSW[MSW handlers]
  API -->|prod: backend| Backend[(Backend API)]
  SPA --> Contexts[Auth / Cart Contexts]
```

---

For more details, inspect `src/mocks/handlers.js` and the `src/api` services.
