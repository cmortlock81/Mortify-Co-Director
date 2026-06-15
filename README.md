# Mortify Co-Director

Mortify Co-Director is a production-ready AI business co-director for executive operations, daily CEO briefings, project prioritisation, revenue visibility, and infrastructure monitoring.

## Stack

- Node.js 22, Express, React/Vite
- PostgreSQL schema and seed data
- Redis-ready deployment
- OpenAI API integration with deterministic fallback
- JWT authentication
- Docker and docker-compose

## Features

- Executive dashboard: revenue, outstanding invoices, active projects, server health, daily briefing.
- AI Director: analyses business data, prioritises projects, suggests next actions, generates management reports, and produces daily CEO briefings.
- Integrations registry for Gmail, GitHub, WordPress REST API, Plesk API, and Stripe API.
- Monitoring checks for SSL expiry, disk usage, Docker container status, and website uptime.
- AI memory for context, decisions, and project history.

## Quick start

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec app node server/src/db/seed.js
```

Open <http://localhost:8080> and sign in with the seeded credentials in `.env`.

## Local development

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

## REST API

- `POST /api/auth/login` returns a JWT.
- `GET /api/dashboard` returns dashboard metrics.
- `POST /api/ai/report` creates a management report or daily briefing.
- `POST /api/ai/memory` stores business context or decisions.
- `GET /api/projects`, `GET /api/invoices`, `GET /api/reports` expose business records.
- `POST /api/monitoring/run` runs disk, Docker, uptime, and SSL checks.
- `GET /api/integrations` reports integration configuration status.

## Production configuration

1. Set a long random `JWT_SECRET`.
2. Set `OPENAI_API_KEY` and select `OPENAI_MODEL`.
3. Replace default PostgreSQL credentials and use managed backups.
4. Configure `CORS_ORIGIN` to your HTTPS dashboard origin.
5. Supply integration secrets only through environment variables or a secrets manager.
6. Run behind a TLS reverse proxy such as Nginx, Caddy, or a cloud load balancer.
7. Monitor `/health` and scrape `/metrics` with Prometheus.

## Daily report

A scheduled job runs every morning at 07:00 UTC and stores a `daily_briefing` report covering outstanding invoices, server issues, client actions, project progress, and recommended priorities.
