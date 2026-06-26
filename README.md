# Mortify CRM Suite

A modular MVP business CRM platform for the full customer journey:

**Lead → Opportunity → Quote → Customer → Project → Helpdesk Ticket → Invoice → Payment**

The application uses one shared PostgreSQL database and separate operational modules for CRM, sales, projects, helpdesk, finance, dashboard reporting, AI briefings, and future accounting integrations.

## Stack

- React + Vite frontend with a responsive SaaS layout
- Node.js + Express REST API
- PostgreSQL database
- SQL migrations plus a Prisma schema reference in `prisma/schema.prisma`
- JWT authentication with seeded admin user
- Role model: `admin`, `sales`, `project_manager`, `support`, `finance`, `read_only`

## What is built

### CRM
- Companies and contacts
- Activity timeline and notes
- Search on primary records
- Document storage placeholder through activity/document extension points

### Sales
- Leads, opportunities, pipeline stages, deal value, probability, expected close date
- Quotes and quote lines in the data model
- Convert opportunity to project endpoint

### Projects
- Customer/opportunity-linked projects
- Tasks and milestones
- Budget, estimated cost, actual cost, progress, and margin tracking
- Time entry placeholder for future extension

### Helpdesk
- Tickets linked to companies and projects
- Priority, status, assignee, internal notes, SLA due date
- Ticket comments model with `customer_visible` placeholder

### Finance
- Invoices linked to company and project
- Invoice lines, tax/VAT fields, payments, payment status, outstanding balances
- Profitability report by project
- Comments in environment/configuration identify where Xero, QuickBooks, Sage, and Stripe integrations can be added later

### Dashboard
- Total pipeline value
- Won revenue
- Open projects
- Overdue tickets
- Outstanding invoices
- Project margin summary

## Quick start with Docker

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec app npm run db:migrate
docker compose exec app npm run db:seed
```

Open <http://localhost:8080> and sign in with:

- Email: `admin@mortify.local`
- Password: `ChangeMe123!`

## Local development

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

## Useful scripts

- `npm run dev` starts API and frontend dev server.
- `npm run db:migrate` applies `sql/schema.sql`.
- `npm run db:seed` loads sample CRM data and the admin user.
- `npm test` runs Node tests.
- `npm run lint` runs ESLint.

## API overview

- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/meta`
- `GET /api/resources/:resource`
- `POST /api/resources/:resource`
- `PUT /api/resources/:resource/:id`
- `DELETE /api/resources/:resource/:id`
- `POST /api/opportunities/:id/convert-to-project`
- `POST /api/ai/report`
- `POST /api/monitoring/run`

Supported resource names include `companies`, `contacts`, `leads`, `opportunities`, `quotes`, `projects`, `tasks`, `milestones`, `tickets`, `invoices`, `payments`, and `activities`.

## Recommended next improvements

1. Add row-level permission enforcement per role.
2. Add richer detail pages with inline child records for quote lines, invoice lines, and ticket comments.
3. Add file uploads for documents using S3-compatible storage.
4. Add audit log middleware for before/after changes.
5. Add payment gateway reconciliation and accounting exports for Xero, QuickBooks, and Sage.
6. Add saved filters, kanban pipeline views, and CSV import/export.
7. Add Playwright end-to-end tests for the customer journey.
