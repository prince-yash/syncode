# Syncode

Syncode is a collaborative programming platform. Its npm-workspaces monorepo
contains a React/Vite frontend, an Express API, and a reusable Prisma database
package.

## Development setup

Use Node.js 20.19 or newer and npm.

```sh
npm install
```

Create `packages/database/.env` with `DATABASE_URL` and `DIRECT_URL`, and
`backend/.env` with `NODE_ENV`, `PORT`, `FRONTEND_ORIGIN`, `SESSION_TTL_DAYS`,
`RESET_TOKEN_TTL_MINUTES`, and SMTP settings (`SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`). Environment files
are ignored by Git.

When SMTP is not configured in development, reset links are written to the
development API log. SMTP host and sender are required in production.

```sh
npm run dev
npm run test
npm run typecheck
npm run build
```

`npm run dev` starts the frontend and API. Vite proxies `/api` requests to the
API server.

## Production setup

Configure these values in the hosting provider's secret/environment settings:

- Database package: pooled Neon `DATABASE_URL`; direct, unpooled `DIRECT_URL`
  for Prisma migrations. Both require SSL.
- Backend: `NODE_ENV=production`, the provider's `PORT`, exact HTTPS
  `FRONTEND_ORIGIN`, and SMTP host/from credentials for password-reset email.

The browser calls `/api` on the frontend origin and the session cookie is
`SameSite=Lax`. Route `/api` through the same-origin reverse proxy to the API;
do not expose the database URL to the frontend. The API binds to all interfaces
in production and loopback in development.

After confirming the intended Neon project and branch, apply the initial
migration once with `npm run db:deploy` using `DIRECT_URL`, then deploy the
backend and frontend behind that origin. Verify `/api/health`, registration,
login, logout, reset-email delivery, password reset, and password change with
production-like HTTPS and SMTP settings.

## Database

Prisma 7 uses the schema in `packages/database/prisma/schema.prisma`. Normal
application queries use the pooled `DATABASE_URL`; migration commands use
`DIRECT_URL`.

The initial PostgreSQL migration is generated at
`packages/database/prisma/migrations/20260603000000_initial_syncode_schema/`.
It includes PostgreSQL-specific invitation and membership constraints.
Generation and schema validation do not apply it. For local development, check
the target first and use:

```sh
npm run db:status
npm run db:migrate
```

For production, verify the Neon project and branch before using
`npm run db:deploy` with the production `DIRECT_URL`.

## Frontend routes

- `/` — product landing page
- `/login`, `/register` — account sign-in and registration
- `/forgot-password`, `/reset-password` — password recovery
- `/dashboard` — authenticated dashboard
- `/settings` — profile, password, session, editor, appearance, and notification settings

Authentication uses an HttpOnly, SameSite=Lax cookie. Session and reset
credentials are stored server-side only as SHA-256 digests; passwords are
hashed with Argon2id. Email changes remain unavailable until an email
verification flow is implemented.
