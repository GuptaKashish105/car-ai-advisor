# Car AI Advisor

A full-stack AI-assisted car buying advisor that turns a wide-open search into a confident, ranked shortlist. Buyers answer a short preference form — budget, use case, must-haves, and what matters most to them — and get back a deterministic, explainable shortlist of real cars, enriched with a natural-language explanation from Google's Gemini API.

Built as a demonstration of production-grade full-stack engineering: a clean separation between deterministic business logic and AI enrichment, a fully token-based design system with light/dark theming, and a deployment setup ready to ship to real infrastructure (Vercel + Render).

---

## Table of Contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Recommendation Engine](#recommendation-engine)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Production Deployment](#production-deployment)
- [Build Commands Reference](#build-commands-reference)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Screenshots

> Placeholder — add real screenshots before sharing this repo publicly. Recommended: light mode form, dark mode results grid, and the mobile layout.

| Preference form (light) | Shortlist results (dark) | Mobile |
|---|---|---|
| `docs/screenshots/form-light.png` | `docs/screenshots/results-dark.png` | `docs/screenshots/mobile.png` |

---

## Features

- **Guided preference form** — budget range, primary use, body type, multi-select must-haves (AWD, hybrid, EV, third-row, manual), and six weighted priority sliders (price, reliability, fuel economy, performance, space, safety).
- **Deterministic, explainable scoring engine** — hard filters (budget/body type/must-haves) followed by weighted multi-criteria scoring against the buyer's stated priorities. Every score is reproducible and auditable; nothing about the ranking depends on the AI call.
- **AI-generated explanations** — Google Gemini enriches the already-ranked top matches with a short, natural-language "why this fits you," using structured JSON output validated before it ever reaches the UI. If Gemini is unavailable, the app still returns fully-scored, fully-explained (via deterministic match reasons) results — AI is additive, never load-bearing.
- **Light / dark theme** — system-preference detection on first load, manual toggle, persisted in `localStorage`, applied via CSS custom properties (no per-component theme logic).
- **Full request lifecycle handling** — loading skeletons, empty-state guidance, friendly error banners with a **Retry** button that re-submits the last search.
- **Responsive, accessible UI** — semantic HTML, visible focus states, ARIA live regions for async state changes, keyboard-operable custom controls (chips, sliders), WCAG AA color contrast in both themes.
- **Zero UI component libraries** — a small, consistent, hand-built design token system (spacing/typography/radius/shadow/color scales) drives every component in both themes.

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 8
- Plain CSS with a custom design-token system (no Tailwind/Bootstrap/MUI/Chakra)

**Backend**
- Node.js + Express 5 + TypeScript
- Zod — request validation
- Vitest — unit/integration tests for the scoring engine
- `@google/genai` — Gemini API client

**Tooling**
- npm workspaces (monorepo: `client/` + `server/`)
- ESLint (flat config, `typescript-eslint`)
- `tsx` for TypeScript dev execution, `tsc -b` for production builds

**Deployment**
- Frontend → **Vercel** (static build)
- Backend → **Render** (Node web service)

---

## Architecture

**Production**

```
┌───────────────────────┐                              ┌──────────────────────────┐
│        Vercel          │                              │          Render          │
│  ─────────────────────  │        HTTPS (JSON)         │  ────────────────────────  │
│  Static React build     │ ───────────────────────────▶ │  Express + TypeScript API  │
│  (client/dist)          │   POST /api/recommendations  │  Scoring engine + Gemini  │
│                         │ ◀─────────────────────────── │  enrichment                │
└───────────────────────┘         JSON response          └─────────────┬────────────┘
                                                                        │ HTTPS
                                                                        ▼
                                                          ┌──────────────────────────┐
                                                          │      Gemini API           │
                                                          │  (AI explanations only)   │
                                                          └──────────────────────────┘
```

**Local development**

```
┌────────────────────────┐   /api/* proxied   ┌──────────────────────────┐
│  Vite dev server        │ ──────────────────▶ │  Express server           │
│  http://localhost:5173  │ ◀────────────────── │  http://localhost:3001    │
└────────────────────────┘                     └──────────────────────────┘
```

In dev, the frontend never talks to a hardcoded backend URL — Vite's dev server proxies `/api/*` to the local Express server (see `client/vite.config.ts`). In production, the frontend and backend are two independently deployed services on different origins, connected via the `VITE_API_BASE_URL` build-time environment variable (see [Environment Variables](#environment-variables)).

### Why this split?

The scoring/ranking logic is 100% deterministic — pure functions over the car dataset, with no AI involved (`server/src/services/{filterEngine,scoringEngine,matchReasons}.ts`). Gemini is called **only after** ranking is final, purely to generate prose explaining a decision that's already been made. This means the core product (a trustworthy, explainable shortlist) works correctly even if the AI provider is slow, rate-limited, or down.

---

## Folder Structure

```
car-ai-advisor/
├── render.yaml                  # Render blueprint (backend)
├── vercel.json                  # Vercel build config (frontend)
├── package.json                 # npm workspaces root + convenience scripts
│
├── client/                      # React + TypeScript (Vite)
│   ├── vite.config.ts           # dev proxy config (local only)
│   ├── .env.example
│   └── src/
│       ├── App.tsx
│       ├── api/                 # fetch wrapper + typed endpoint calls
│       ├── components/
│       │   ├── layout/          # Header, ThemeToggle, page shell
│       │   ├── form/            # reusable controlled input primitives
│       │   ├── preferences/     # PreferenceForm composition + validation
│       │   └── results/         # RecommendationCard + result-state UI
│       ├── hooks/                # useRecommendations, useTheme
│       ├── types/                # API contract types (mirrors server types)
│       └── utils/
│
└── server/                      # Express + TypeScript
    ├── .env.example
    ├── src/
    │   ├── index.ts             # app bootstrap, CORS, error handling
    │   ├── routes/               # POST /api/recommendations
    │   ├── schemas/              # Zod request validation
    │   ├── services/             # scoring engine + Gemini enrichment
    │   ├── data/                 # static car dataset (28 vehicles)
    │   └── types/
    └── tests/                    # Vitest suite for the scoring engine
```

---

## Recommendation Engine

A deterministic pipeline, in order:

1. **Hard filters** (`filterEngine.ts`) — eliminate cars outside budget, wrong body type, or missing a required must-have. These are elimination rules, not preferences.
2. **Normalization** (`scoringEngine.ts`) — every remaining candidate's attributes (price distance from budget midpoint, reliability, fuel economy, performance, space, safety) are min-max normalized *relative to the filtered candidate set*, not the whole dataset.
3. **Weighted scoring** — the buyer's six priority weights are applied as a normalized weighted average, producing a single 0–100 match score per car.
4. **Ranking + Top N** — sorted descending, top 3 selected.
5. **Match reasons** (`matchReasons.ts`) — short, deterministic, data-backed bullet points (e.g. "Excellent fuel economy for its class"), ordered by what the buyer said mattered most.
6. **AI enrichment** (`geminiService.ts`, optional) — Gemini receives the already-ranked shortlist and buyer preferences, and returns one short paragraph per car. Structured JSON output is requested and re-validated with Zod before use; any failure here degrades to `aiExplanation: null` without affecting the rest of the response.

Full unit/integration coverage lives in `server/tests/` (filter logic, scoring edge cases, match-reason ordering, end-to-end recommendation generation against the real dataset).

---

## API Overview

### `GET /health`

Liveness check used by Render's health monitoring.

```json
{ "status": "ok" }
```

### `POST /api/recommendations`

**Request body:**

```json
{
  "budget": { "min": 20000, "max": 35000 },
  "primaryUse": "family",
  "bodyTypes": ["suv"],
  "mustHaves": ["awd"],
  "priorities": {
    "price": 3,
    "reliability": 4,
    "fuelEconomy": 3,
    "performance": 2,
    "space": 4,
    "safety": 4
  }
}
```

`primaryUse`, `bodyTypes`, and `mustHaves` are optional. `budget` and `priorities` are required.

**Response (200):**

```json
{
  "results": [
    {
      "car": { "id": "toyota-rav4-2024", "make": "Toyota", "model": "RAV4 XLE", "...": "..." },
      "score": 79,
      "breakdown": { "price": 82, "reliability": 90, "fuelEconomy": 70, "performance": 60, "space": 88, "safety": 100 },
      "matchReasons": ["Generous cargo and seating space", "Top-tier safety rating"],
      "aiExplanation": "The RAV4 XLE pairs excellent cargo room with class-leading safety scores..."
    }
  ],
  "meta": { "totalCandidates": 28, "filteredOutCount": 25 }
}
```

An empty `results` array with a populated `meta` is a valid, successful response — it means no car matched the stated filters, not an error.

**Error responses:**

| Status | Meaning |
|---|---|
| `400` | Request failed validation (Zod field errors included in `details`) |
| `404` | Unknown route |
| `500` | Unhandled server error |

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port to listen on. Render/Railway set this automatically; defaults to `3001` locally. |
| `GEMINI_API_KEY` | No | Enables AI-generated explanations. Without it, `aiExplanation` is `null` on every result — the rest of the API is unaffected. |
| `GEMINI_MODEL` | No | Overrides the default Gemini model (`gemini-2.5-flash`). |
| `CORS_ORIGIN` | No (recommended in prod) | Comma-separated list of allowed frontend origins, e.g. `https://car-ai-advisor.vercel.app`. Unset = any origin allowed (fine for local dev). |

### Frontend (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes, in production** | Full URL of the deployed backend, including the `/api` prefix, e.g. `https://car-ai-advisor-api.onrender.com/api`. Unset locally — Vite's dev proxy handles `/api/*` automatically. |

Both directories include a committed `.env.example` — copy to `.env` and fill in.

---

## Local Setup

**Prerequisites:** Node.js ≥ 20.11

```bash
git clone <repo-url>
cd car-ai-advisor
npm install

cp server/.env.example server/.env
# edit server/.env and add GEMINI_API_KEY if you want AI explanations

npm run dev
```

This starts both apps concurrently:
- Client: http://localhost:5173
- Server: http://localhost:3001 (proxied automatically — no client `.env` needed locally)

Run the backend test suite:

```bash
npm run test:server
```

---

## Production Deployment

### Frontend → Vercel

1. Import the repository into Vercel.
2. Leave the **Root Directory** as the repo root (a committed `vercel.json` at the root already defines the build):
   ```json
   {
     "framework": "vite",
     "installCommand": "npm install",
     "buildCommand": "npm run build:client",
     "outputDirectory": "client/dist"
   }
   ```
3. Add an environment variable in the Vercel project settings:
   ```
   VITE_API_BASE_URL=https://<your-backend>.onrender.com/api
   ```
4. Deploy. Vite bakes `VITE_API_BASE_URL` into the static build at build time — set it *before* triggering a production build, and re-deploy if it ever changes.

### Backend → Render

**Option A — Blueprint (recommended):** the repo includes a `render.yaml` at the root. In Render, choose **New → Blueprint**, point it at this repo, and Render will provision the service using:
```yaml
buildCommand: npm install && npm run build:server
startCommand: npm run start:server
healthCheckPath: /health
```
You'll be prompted for `GEMINI_API_KEY` and `CORS_ORIGIN` (marked `sync: false` in the blueprint, i.e. not stored in source control).

**Option B — Manual Web Service:**
1. New Web Service → connect this repo.
2. Root Directory: leave blank (repo root — required for the npm workspace to resolve).
3. Build Command: `npm install && npm run build:server`
4. Start Command: `npm run start:server`
5. Health Check Path: `/health`
6. Add environment variables: `GEMINI_API_KEY`, `CORS_ORIGIN` (set to your Vercel URL once known).

Railway works the same way — same build/start commands, same environment variables; Railway assigns `PORT` automatically just like Render.

### Production environment configuration checklist

- [ ] Backend deployed first, so its URL is known.
- [ ] `VITE_API_BASE_URL` set on Vercel to `https://<backend-url>/api`, frontend (re)deployed after setting it.
- [ ] `CORS_ORIGIN` set on the backend to the Vercel production URL (and any preview domains you want to allow), so the API isn't left open to arbitrary origins.
- [ ] `GEMINI_API_KEY` set on the backend if AI explanations are wanted.

---

## Build Commands Reference

Run from the repository root (npm workspaces):

| Command | Effect |
|---|---|
| `npm run dev` | Runs client + server concurrently for local development |
| `npm run build:client` | Production build of the frontend → `client/dist` |
| `npm run build:server` | Compiles the backend TypeScript → `server/dist` |
| `npm run start:server` | Runs the compiled backend (`node server/dist/index.js`) |
| `npm run test:server` | Runs the backend Vitest suite |
| `npm run lint:client` / `npm run lint:server` | ESLint for each workspace |

---

## Troubleshooting

**Frontend loads but every search fails / results never load in production.**
`VITE_API_BASE_URL` almost certainly isn't set (or is stale). It's a build-time variable — check the browser console for a warning logged from `api/client.ts`, set the variable in Vercel, and trigger a new deployment (redeploying without a fresh build won't pick up the change).

**Requests fail with a CORS error in the browser console.**
Set `CORS_ORIGIN` on the backend to your exact frontend origin (including `https://`, no trailing slash). If you're testing a Vercel preview deployment, its URL differs from production — add it to the comma-separated list.

**`aiExplanation` is always `null`.**
Expected if `GEMINI_API_KEY` isn't set, or if Gemini enrichment failed for any reason — this is a deliberate degrade-gracefully design, not a bug. Check the backend logs for `Gemini explanation generation failed; returning recommendations without it: ...` to see the underlying cause.

**Backend takes 30–50 seconds to respond after being idle.**
Expected on Render's free tier, which spins services down after inactivity. Upgrade the plan or accept the cold-start delay for a portfolio deployment.

**Local dev: "Cannot connect to server" even though `npm run dev` is running.**
Confirm nothing else is bound to ports `3001` or `5173`, and that you're hitting `http://localhost:5173` (the Vite dev server, which proxies `/api`) — not `3001` directly for the UI.

---

## Future Improvements

- Real car images (the current placeholder is intentional — the dataset has no photo URLs yet; `CarImage` already supports an `imageUrl` prop for when it does).
- Side-by-side comparison view for 2–3 shortlisted cars.
- Saved searches / shareable shortlist links.
- Pagination or "show more" beyond the top 3 results.
- Expand the static dataset or connect a real inventory/pricing API.
- E2E test suite (Playwright) covering the full form → results flow, complementing the existing backend unit tests.
- Rate limiting on the Gemini-enrichment path to control cost under real traffic.

---

## License

MIT — free to use, modify, and learn from.
