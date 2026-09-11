# Lupus AI Labs — Backend & Operations Gateway

Express + Prisma REST API backing the public site and the hidden admin dashboard.

## Quick start

```bash
cp .env.example .env          # then fill in JWT_SECRET and IP_HASH_SALT
npm install
npm run db:migrate            # create the SQLite database
npm run db:seed               # create the first admin, print its password once
npm run dev                   # http://localhost:5001
```

The seed prints a generated administrator password **once**. Store it in a
password manager and change it from Settings after the first sign-in. To choose
your own, set `SEED_ADMIN_PASSWORD` before seeding.

## Environment

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Signs session tokens. **Required in production**, minimum 32 chars. |
| `IP_HASH_SALT` | Salts the one-way IP hashes stored for abuse investigation. **Required in production.** |
| `DATABASE_URL` | SQLite path, or a PostgreSQL URL after switching the provider in `prisma/schema.prisma`. |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API with credentials. |
| `TRUST_PROXY` | Must match your topology. Too permissive lets clients spoof IPs and bypass rate limits. |
| `SESSION_TTL_HOURS` | Session lifetime, default 12. |
| `ADMIN_BASE_PATH` | Hidden dashboard path, mirrored by the frontend's `VITE_ADMIN_BASE_PATH`. |
| `SERVE_FRONTEND` | `true` serves `frontend/dist` from this process, so site and API share one origin. |

Without `JWT_SECRET` the server generates a throwaway value in development and
logs a warning; every restart then invalidates existing logins. In production it
refuses to start.

## Data model

| Model | Purpose |
| --- | --- |
| `AdminUser` | Dashboard operator. bcrypt hash, role, lockout counters. |
| `AdminSession` | Server-side session row. A JWT is only honoured while its row exists and is unrevoked, which is what makes remote revocation work. |
| `Lead` | Consultation request: name, email, company, `selectedSystem`, message, `status`. |
| `Project` | Case study rendered on the homepage. Full CRUD, ordering, publish flag. |
| `Telemetry` | Page views, CTA clicks, lead submissions. |
| `AuditLog` | Append-only record of sign-ins, failures and privileged changes. |

SQLite has no enum type, so status-style columns are strings validated against
the constants in `src/lib/constants.js`.

## API

### Public
| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness plus a real database round trip. |
| `POST` | `/api/leads` | Contact form. Rate limited, honeypot-protected. |
| `GET` | `/api/projects` | Published case studies only. |
| `GET` | `/api/projects/:idOrSlug` | Single published case study. |
| `POST` | `/api/telemetry` | Fire-and-forget beacon, always answers 202. |
| `POST` | `/api/contact` | Legacy alias for `POST /api/leads`. |

### Authenticated
| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/auth/login` | 10/15min per IP, account locks for 15min after 5 failures. |
| `POST` | `/api/auth/logout` | Revokes the session server-side. |
| `GET` | `/api/auth/me` | Identity probe used on dashboard boot. |
| `GET`/`DELETE` | `/api/auth/sessions[/:id]` | List and revoke devices. |
| `POST` | `/api/auth/sessions/revoke-others` | Sign out everywhere else. |
| `POST` | `/api/auth/change-password` | Re-authenticates, then invalidates every session. |
| `POST` | `/api/auth/change-email` | Re-authenticates before moving the login identity. |
| `GET`/`PATCH`/`DELETE` | `/api/leads[/:id]` | Filter, paginate, update status and notes. |
| `GET` | `/api/leads/export.csv` | Current filter set as a spreadsheet. |
| `POST`/`PATCH`/`DELETE` | `/api/projects[/:id]` | Case study CRUD. |
| `POST` | `/api/projects/reorder` | Accepts an array of ids in display order. |
| `GET` | `/api/dashboard/overview` | Every figure the Overview screen needs, in one call. |
| `GET` | `/api/audit` | Access and change history. |
| `GET` | `/api/telemetry` | Raw event feed. |

`GET /api/contact` returns **410 Gone**. The prototype version of that endpoint
returned every submitted lead to anyone who asked.

## Security

- **Passwords** bcrypt, cost 12. Never logged, never returned.
- **Sessions** JWT (HS256, pinned algorithm, issuer and audience checked) inside an `httpOnly`, `SameSite=strict` cookie, `Secure` in production. Each token is bound to a database row, so revocation is immediate and a password change invalidates every older session.
- **Brute force** Per-IP rate limit plus a per-account 15-minute lockout after 5 failures. Unknown emails run a dummy bcrypt comparison so response timing cannot be used to enumerate accounts, and every failure returns one identical message.
- **CSRF** `SameSite=strict` cookies plus an Origin/Referer allow-list on every state-changing request.
- **CORS** Strict allow-list. An unknown origin receives no `Access-Control-Allow-Origin` header rather than an error.
- **Input** Every payload is parsed by a Zod schema with length caps; control characters are stripped. Prisma parameterises all queries. Bodies are capped at 256 kB.
- **Output** Client-safe errors only. Stack traces and driver internals are logged server-side and replaced with a generic message.
- **CSV** Cells starting with `=`, `+`, `-` or `@` are prefixed with an apostrophe to defuse spreadsheet formula injection.
- **Privacy** IP addresses are stored only as salted hashes; User-Agents are truncated.

## Production

```bash
NODE_ENV=production npm run db:deploy
NODE_ENV=production npm start
```

Set `SERVE_FRONTEND=true` to serve `frontend/dist` from this process. That puts
the site and the API on one origin, which is the simplest correct setup for
`SameSite=strict` cookies and removes the need for CORS entirely.
