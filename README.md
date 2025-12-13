# MOPS – Incident Reporting Platform

## 1. Requirements

- Node.js
- npm
- Docker + Docker Compose (for Postgres)

---

## 2. Environment Setup

Create a `.env` file in the project root (`mops/.env`) with at least:

```env
DATABASE_URL="postgresql://mops:mops@localhost:5432/mops?schema=public"
SESSION_SECRET="replace_with_a_long_random_string"
ADMIN_EMAIL=admin@mops.ro
ADMIN_PASSWORD=secure_admin_password_123
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are used to seed a default **ADMIN** user.

---

## 3. Start PostgreSQL with Docker

From the `mops` folder run:

```bash
docker compose -f docker/postgres.yml up -d
```

This will start Postgres on `localhost:5432` with the credentials matching `DATABASE_URL`.

To stop the database:

```bash
docker compose -f docker/postgres.yml down
```

---

## 4. Install Dependencies

From the `mops` directory:

```bash
npm install
```

---

## 5. Prisma: Migrations & Client

### 5.1 Run database migrations

Apply all Prisma migrations to your local database:

```bash
npx prisma migrate dev
```

This will create the schema defined in `prisma/schema.prisma`, including:

- `Users` (with roles: `USER`, `OPERATOR`, `ADMIN`)
- `Incident`
- `IncidentHistory`

### 5.2 Generate Prisma Client

```bash
npx prisma generate
```

This regenerates the TypeScript client into `app/generated/prisma`.

---

## 6. Seed Admin User

The project includes a Prisma seed script to ensure a default **ADMIN** account exists.

```bash
npx prisma db seed
```

This will:

- Read `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`
- Hash the password
- Upsert a user with role `ADMIN`

You can then log in with those credentials.

---

## 7. Run the App (Development)

From the `mops` directory:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 8. Roles & Permissions

The app uses three roles:

- `USER`
  - Can create incidents.
  - Can view list & details.
  - Can comment.

- `OPERATOR`
  - Can be assigned incidents.
  - Can update status of incidents **assigned** to them.
  - Status updates are logged in `IncidentHistory`.

- `ADMIN`
  - Full management rights.
  - Can update status of any incident.
  - Can assign operators to incidents.
  - Has access to the initial seeded admin account from `.env`.

Status lifecycle:

- `PENDING`
- `IN_PROGRESS`
- `RESOLVED`
- `REJECTED`

Each status change creates an `IncidentHistory` entry with:

- Old status
- New status
- User who changed it
- Timestamp

---

## 9. Development Notes

- **Prisma schema**: `prisma/schema.prisma`
- **Seed script**: `prisma/seed.ts`
- **Prisma client**: imported from `@/app/generated/prisma`

If you change the Prisma schema:

```bash
npx prisma migrate dev --name some_change
npx prisma generate
```