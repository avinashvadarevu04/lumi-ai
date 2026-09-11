# Lupus AI Labs — Full-Stack Platform

Monochrome marketing site, a hardened REST API, and a hidden operations
dashboard for managing inbound leads and case-study content.

```
lumi-ai/
├── frontend/                 React 19 + Vite + Tailwind
│   ├── src/components/       Public site (hero, 3D intro, sections)
│   ├── src/admin/            Operations gateway (separate lazy chunk)
│   ├── src/lib/telemetry.js  Cookieless analytics beacon
│   └── vite.config.js        API proxy + build-time admin path hashing
│
├── backend/                  Express + Prisma + SQLite
│   ├── prisma/schema.prisma  AdminUser · AdminSession · Lead · Project · Telemetry · AuditLog
│   ├── src/routes/           auth · leads · projects · telemetry · audit · dashboard
│   ├── src/middleware/       auth guard · rate limits · origin guard · error handler
│   └── src/lib/              auth · validation · crypto · csv · audit
│
└── dev.sh                    Runs both services together
```

## First run

```bash
npm install

cd backend
cp .env.example .env          # fill in JWT_SECRET and IP_HASH_SALT
npm run db:migrate            # create the database
npm run db:seed               # create the first admin; prints its password ONCE
cd ..

./dev.sh                      # or: npm run dev:all
```

- Public site: <http://localhost:5173>
- API: <http://localhost:5001>
- Operations gateway: <http://localhost:5173/ops-gateway>

The seed prints a generated administrator password a single time. Save it, then
change it from **Settings** after signing in.

## Operations gateway

A hidden dashboard at `/ops-gateway`, reachable only by typing the URL.

- **Not linked** from any navigation, footer or sitemap, and disallowed in `robots.txt`.
- **Not in the public bundle.** The path is compiled in only as a SHA-256 digest; the dashboard is a separate chunk that is fetched only once the digest matches, so reading the shipped JavaScript does not reveal the URL. This is obfuscation, not access control — authentication is the real boundary.
- **Nothing renders** until `/api/auth/me` confirms a valid, unrevoked session, so guessing the URL yields only a login form.

Change the path by setting `VITE_ADMIN_BASE_PATH` (frontend) and
`ADMIN_BASE_PATH` (backend) to the same value, then rebuilding.

> The gateway needs a secure context for Web Crypto: `https://`, or `localhost`
> during development. On a plain-http LAN address the check fails closed and the
> public site is served instead.

### Screens

| Screen | What it does |
| --- | --- |
| **Overview** | Total inquiries, active case studies, conversion rate, 30-day trend, a 14-day volume chart, pipeline breakdown, recent submissions and the live activity log. |
| **Inquiries** | Searchable, filterable, paginated table. Detail view to read a submission, move it `NEW → IN_REVIEW → CONTACTED → ARCHIVED`, keep internal notes, delete, or export the current filter to CSV. |
| **Case Studies** | Full CRUD over the work shown on the homepage, with reordering, featured and publish toggles. Changes go live with no deploy. |
| **Settings** | Change password or sign-in email, review and revoke active sessions, read the access and audit log. |

Every screen is strict black and white. Status is carried by weight and form
rather than colour: solid white for `NEW`, outlined for `IN_REVIEW`, dimmed
outline for `CONTACTED`, struck through for `ARCHIVED`.

## Hero robot

The hero renders the **Lumi robot**, a Spline scene that turns its head and
body to follow the pointer. It ships in [`lumi-robot-3d/`](lumi-robot-3d/)
and is hosted by Spline at
`https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode`.

[`RobotStage.jsx`](frontend/src/components/RobotStage.jsx) loads it with
`@splinetool/runtime`, pinned to **1.12.95**, the version the scene was built
and tested against. Behaviour:

- **Starts after the intro**, so parsing the 1.3 MB scene never competes with
  the intro animation, and survives "Replay intro" without reloading.
- **Glowing orb** as the loading placeholder, and as the permanent fallback if
  the scene fails or takes longer than 25 seconds.
- **Skipped entirely**, orb only, for visitors with reduced motion, Save-Data,
  fewer than 4 CPU cores, or no connection, matching the scene's original
  `SplineScene` component.

The scene needs an internet connection. To swap in a different Spline export,
set `VITE_SPLINE_SCENE_URL` in `frontend/.env`.

## Motion system

The landing page's scroll choreography runs on one shared motion layer in
[`frontend/src/lib/motion/`](frontend/src/lib/motion):

- **Lenis smooth scroll, synced to GSAP.** `SmoothScroll.jsx` drives Lenis from
  `gsap.ticker` and calls `ScrollTrigger.update` on every Lenis scroll, so
  scrolling, pinning and tweens advance on the same frame. It pauses during the
  intro and while the contact modal is open, and publishes a shared scroll
  velocity for speed-reactive effects.
- **One GSAP registry.** `gsap.js` registers ScrollTrigger, Flip, Observer,
  SplitText, ScrambleTextPlugin and CustomEase once. Import GSAP from there.
- **Spring physics.** `spring.js` runs fixed-step springs on the GSAP ticker
  for magnetism, tilt and cursor drag. Idle springs cost nothing.
- **Pointer effects.** `useMagnetic` and `useTilt` run only for mouse users
  with motion allowed. The site keeps the normal system cursor.
- **Three motion tiers.** Every section uses `gsap.matchMedia` with the shared
  `MOTION` queries: the full pinned experience on desktop, simplified touch
  layouts under 1024px, and a static, fully readable page for reduced motion.

## How the site uses the API

- The contact modal posts to `POST /api/leads` and reports real validation errors instead of always claiming success.
- **Selected Work** renders a baked-in copy of the case studies on first paint, then replaces it with live API content. If the API is unreachable the static copy stays, so the section is never empty.
- A cookieless beacon records page views, CTA clicks and lead submissions. The session id lives in `sessionStorage`, and the server stores only a salted hash of the IP.

## Scripts

| Command | Effect |
| --- | --- |
| `./dev.sh` / `npm run dev:all` | Both services together |
| `npm run dev` | Frontend only |
| `npm run dev:backend` | API only |
| `npm run build` | Production frontend build |
| `npm run db:migrate --workspace=backend` | Apply migrations |
| `npm run db:seed --workspace=backend` | Seed admin and case studies |
| `npm run db:studio --workspace=backend` | Browse the database |

## Production

```bash
npm run build
cd backend
NODE_ENV=production npm run db:deploy
SERVE_FRONTEND=true NODE_ENV=production npm start
```

`SERVE_FRONTEND=true` serves the built frontend from the API process, putting the
site and API on one origin. That is the simplest correct setup for
`SameSite=strict` session cookies and removes the need for CORS.

Deploying them separately instead? Set `ALLOWED_ORIGINS` to the site's origin,
serve the frontend behind a server that falls back to `index.html` (so
`/ops-gateway` resolves), and terminate TLS.

See [backend/README.md](backend/README.md) for the API reference and the full
security model.
