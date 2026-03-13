# Gathered

> **Your Christian Community, Close to Home**

Gathered is a full-stack Christian community platform for the Minneapolis/Twin Cities Metro area — think Christian Nextdoor. Built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

---

## Features

- **Community Feed** — Share updates, prayer requests, recommendations, and resources. React with "Amen 🙏" and comment.
- **Prayer Requests** — Submit public or anonymous prayer requests. Track "Praying for this" counts. Mark prayers as answered.
- **Recommendations** — Recommend trusted local businesses and service providers. Endorse others' recommendations.
- **Groups** — Create and join Bible studies, moms groups, men's groups, young families groups, and more.
- **Christian Business Directory** — Search and discover Christian-owned businesses across the Twin Cities.
- **Jobs Board** — Post babysitting, lawn care, tutoring, and other neighborhood jobs for teens and young adults.
- **Resource Sharing** — Give away, lend, or share items freely within the community.
- **Find a Church** — Browse curated Twin Cities churches with service times, denominations, and member indicators.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Database ORM:** Prisma
- **Database:** PostgreSQL (via Supabase)
- **Auth:** NextAuth.js (credentials provider)
- **Fonts:** Playfair Display + Inter (Google Fonts)

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd gathered
npm install
```

### 2. Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Supabase PostgreSQL connection string (from Supabase project settings)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth - generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# OR run migrations
npm run db:migrate

# Seed with sample data (11 churches, 5 users, 10 posts, 5 prayers, 3 groups, 8 businesses, 4 jobs, 5 resources)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test Credentials (after seeding)

| Email | Password | Neighborhood |
|-------|----------|-------------|
| sarah.johnson@example.com | password123 | Edina |
| mike.anderson@example.com | password123 | Minnetonka |
| lisa.chen@example.com | password123 | Eagan |
| david.walker@example.com | password123 | Maple Grove |
| rachel.thompson@example.com | password123 | St. Paul |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | Full URL of your app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing |

---

## Database Commands

```bash
npm run db:generate   # Regenerate Prisma client
npm run db:push       # Push schema changes (no migration history)
npm run db:migrate    # Create and run migrations
npm run db:seed       # Seed with sample data
npm run db:studio     # Open Prisma Studio GUI
```

---

## Deployment (Railway / Vercel)

1. Connect your GitHub repo
2. Set environment variables in the dashboard
3. Build command: `npm run build`
4. Start command: `npm start`
5. Run `npm run db:migrate` after first deploy
6. Run `npm run db:seed` to populate initial data

---

## Project Structure

```
src/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth
│   │   ├── posts/         # Feed posts + reactions + comments
│   │   ├── prayer/        # Prayer requests + pray action
│   │   ├── groups/        # Groups + join/leave
│   │   ├── recommendations/ # Recommendations + endorsements
│   │   ├── directory/     # Business directory
│   │   ├── jobs/          # Jobs board
│   │   ├── resources/     # Resource sharing
│   │   ├── churches/      # Church directory + attend
│   │   ├── profile/       # User profiles
│   │   └── register/      # Registration
│   ├── page.tsx           # Home feed
│   ├── prayer/
│   ├── recommendations/
│   ├── groups/
│   ├── directory/
│   ├── jobs/
│   ├── resources/
│   ├── find-a-church/
│   ├── sign-in/
│   ├── sign-up/
│   └── profile/[id]/
├── components/
│   ├── feed/              # PostCard, NewPostForm
│   ├── layout/            # Navbar, Footer
│   └── ui/                # Shadcn components
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client singleton
│   └── utils.ts           # cn() utility
└── types/
    └── next-auth.d.ts     # Session type augmentation

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed script
```

---

## Brand

- **Primary:** Deep Navy `#1B2B4B`
- **Accent:** Warm Gold `#C9A84C`
- **Background:** Cream White `#FAF7F2`
- **Secondary:** Soft Sage `#7A9E7E`
- **Headings:** Playfair Display
- **Body:** Inter
