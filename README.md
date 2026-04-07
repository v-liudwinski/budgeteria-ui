# Budgeteria UI

React + TypeScript frontend for Budgeteria — a family budget tracking application.

## Tech Stack

- **React 18** + **TypeScript** — Vite-based SPA
- **Tailwind CSS** — utility-first styling
- **Auth0** — authentication via `@auth0/auth0-react`
- **TanStack Query** — server state management
- **React Router v6** — client-side routing
- **i18next** — internationalization (English, Czech, Ukrainian)
- **Vitest** + **Testing Library** — unit tests

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- A running [Budgeteria API](../budgeteria-api) instance
- Auth0 Single Page Application configured

## Getting Started

### 1. Configure environment

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.budgeteria.online/
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCKS=false   # set to "true" to run without the API
```

### 2. Install and run

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### 3. Test

```bash
npm test
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
  api/            # API client, per-domain fetch functions, React Query keys
  auth/           # Auth0 provider and ProtectedRoute wrapper
  components/     # Shared UI components
  context/        # AppContext (global state)
  i18n/           # Translation files (en, cs, uk)
  screens/        # Page-level components
    onboarding/   # Multi-step onboarding wizard
  utils/          # Date helpers, formatters, category definitions
```

## Mock Mode

Set `VITE_USE_MOCKS=true` in `.env.local` to run the app with local mock data instead of hitting the API. Useful for UI development without a running backend.
