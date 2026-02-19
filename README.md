# Nest Starter Kit

Production-ready NestJS starter template focused on clean architecture, strong config validation, observability, and infrastructure-ready local development.

## Highlights

- NestJS 11 + TypeScript 5 setup
- Prisma 7 with PostgreSQL adapter (`@prisma/adapter-pg`)
- Redis-backed cache via `cache-manager` + `@keyv/redis`
- Health checks with `@nestjs/terminus` (HTTP, DB, Redis)
- Structured logging with `nestjs-pino` (`pino-pretty` + file rolling in production)
- Mail service with Nodemailer + Handlebars templates
- Response envelope interceptor for consistent API responses
- Docker + Docker Compose for app, PostgreSQL, and Redis
- ESLint + Prettier + Husky + lint-staged

## Tech Stack

- **Runtime:** Node.js, NestJS
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **Mail:** Nodemailer + Handlebars
- **Logging:** Pino / nestjs-pino
- **Dev Tooling:** ESLint, Prettier, Jest, Husky

## Prerequisites

- Node.js 20+ (project Docker image uses Node 24)
- Docker + Docker Compose (optional, recommended for local infra)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

Minimum values to run locally:

```dotenv
PORT=8000
APP_NAME="NestApp"
APP_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestapp?schema=public

MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_ENCRYPTION=tls
MAIL_USERNAME=user
MAIL_PASSWORD=pass
MAIL_FROM_NAME="NestApp"
MAIL_FROM_ADDRESS=no-reply@example.com

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
```

### 3) Start infrastructure (Postgres + Redis)

```bash
docker compose up -d pg redis
```

### 4) Generate Prisma client and run migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5) Start the app in development

```bash
npm run dev
```

App will run at `http://localhost:8000`.

## Run with Docker Compose

To run full stack (app + Postgres + Redis):

```bash
docker compose up --build
```

Services:

- App: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Available Scripts

- `npm run dev` — Start in watch mode (development)
- `npm run debug` — Start in debug + watch mode
- `npm run build` — Build to `dist/`
- `npm run start` — Run built app in production mode
- `npm run lint` — Lint and auto-fix
- `npm run format` — Format source/test files
- `npm run typecheck` — TypeScript type checking
- `npm run test` — Unit tests
- `npm run test:e2e` — E2E tests
- `npm run test:cov` — Coverage report
- `npm run db:generate` — Generate Prisma client
- `npm run db:migrate` — Create/apply development migration
- `npm run db:push` — Push Prisma schema to DB
- `npm run db:studio` — Open Prisma Studio

## Environment Variables

From `.env.example`:

### App

- `NODE_ENV` (`development`, `production`, `test`)
- `PORT`
- `APP_NAME`
- `APP_URL`
- `CORS_ALLOWED_ORIGINS` (comma-separated)

### Database

- `DATABASE_URL`

### Mail

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_ENCRYPTION` (`ssl` or `tls`)
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM_NAME`
- `MAIL_FROM_ADDRESS`
- `MAIL_MAX_CONNECTIONS` (optional)
- `MAIL_MAX_MESSAGES` (optional)

### Redis

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_USERNAME` (optional)
- `REDIS_PASSWORD` (optional)

## API Endpoints

- `GET /` — Starter metadata (`name`, `version`, `description`, `status`)
- `GET /health` — Health check status (HTTP target, database, cache)

## Response Shape

Most API routes are wrapped by a global response interceptor:

```json
{
  "success": true,
  "statusCode": 200,
  "path": "/your-route",
  "data": {},
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Routes can opt out of this wrapper (for example, health checks).

## Logging

- Uses `nestjs-pino` for HTTP/application logging
- Development: pretty console output
- Production: pretty console + daily rolling log files in `logs/`
- Sensitive fields are redacted automatically (tokens, passwords, secrets)

## Mail Templates

Handlebars templates are located in `src/mail/templates`.

Included templates:

- `default`

## Prisma Notes

- Prisma client output is generated into `src/generated/prisma`
- Prisma schema lives at `prisma/schema.prisma`
- Migrations are stored in `prisma/migrations`

## Project Structure

```text
src/
	api/           # API modules/controllers
	cache/         # Redis cache config + health indicator
	logger/        # pino logger configuration
	mail/          # mail service + templates
	prisma/        # Prisma module/service/config
	lib/           # shared utilities, decorators, interceptors
```

## Git Hooks

Pre-commit hook runs:

- `lint-staged`
- `npm run typecheck`
- `npm run build`

## License

MIT
