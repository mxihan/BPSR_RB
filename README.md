# BPSR Recruitment Board

A full-stack recruitment board for **Blue Protocol: Star Resonance** — find and organize dungeon, raid, and party teams.

Built with the **T3 Stack**: Next.js 15, tRPC 11, Prisma 6, Tailwind CSS 4, NextAuth v5.

## Features

### For Players
- **Browse Teams** — filter by content type, difficulty, role needed, schedule
- **Player Profiles** — create multiple profiles with class, spec, ability score, dream level, and more
- **Apply to Teams** — submit applications to open role slots with an optional message
- **Track Applications** — view and withdraw pending applications

### For Team Leaders
- **Create Teams** — set up recruitment posts with role slots, preferred classes, and minimum requirements
- **Manage Applications** — approve/reject applicants, slots auto-fill on approval
- **Team Status** — track OPEN → IN_PROGRESS → COMPLETED lifecycle

### For Admins
- **Dashboard** — user, team, and application statistics
- **Dictionary Management** — CRUD for game data (classes, specs, dungeons, raids, difficulties, servers)
- **User Management** — change roles, ban/unban users
- **Team Moderation** — search, filter, and delete teams

## Game Data (BPSR)

| Classes | Specs | Content |
|---------|-------|---------|
| Heavy Guardian | Fortress Guardian, Titan | 12 Dungeons (S1 + S2) |
| Shield Knight | Holy Knight, Crusader | 6 Raids |
| Stormblade | Blade Dancer, Shadow Blade | World Boss, Rush Battle |
| Wind Knight | Sky Lancer, Gale Striker | Training Ruins, Stimen Vault |
| Marksman | Sniper, Hawkeye | |
| Frost Mage | Cryomancer, Elemental Lord | |
| Verdant Oracle | Life Weaver, Nature Guardian | |
| Beat Performer | Melody Master, Rhythm Fighter | |

**Metrics**: Ability Score, Dream Level (1-90), Illusion Strength, Adventurer Level (cap 60)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **API**: tRPC 11 with typed routers
- **Database**: SQLite via Prisma 6
- **Auth**: NextAuth v5 (Discord OAuth, JWT sessions)
- **Styling**: Tailwind CSS 4 with custom BPSR theme
- **Role-based access**: USER, LEADER, ADMIN procedures

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Discord OAuth credentials:
# AUTH_DISCORD_ID=your-discord-client-id
# AUTH_DISCORD_SECRET=your-discord-client-secret

# Set up database and seed game data
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to OAuth2 → General
4. Add redirect: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to `.env`

### First Admin

After signing in for the first time, promote your user to admin:

```bash
npx prisma db execute --schema prisma/schema.prisma --stdin <<< "UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';"
```

Then sign out and sign back in to get the updated JWT.

## Project Structure

```
src/
├── app/
│   ├── admin/            # Admin dashboard, users, teams, dictionaries
│   ├── my-applications/  # Track submitted applications
│   ├── my-teams/         # Teams I lead and joined
│   ├── players/          # Public player browser and profiles
│   ├── profile/          # Create/edit player profiles
│   └── teams/            # Browse, create, and view teams
├── components/layout/    # Navbar
├── server/
│   ├── api/routers/      # tRPC routers (7 total)
│   └── auth/             # NextAuth config
└── styles/               # BPSR theme globals

prisma/
├── schema.prisma         # 15 models
├── seed.ts               # BPSR game data
└── migrations/           # Database migrations
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database browser |
| `npx prisma db seed` | Seed BPSR game data |

## License

MIT
