# OuterTiers

## Overview
OuterTiers is a Minecraft PvP ranking website, built as a 1:1 recreation of mctiers.com with the OuterTiers branding. It features player rankings across multiple game modes with a dark UI theme.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite 6
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Package Manager**: pnpm
- **Player Avatars**: mc-heads.net API (Minecraft player heads by username)

## Project Structure
```
src/
├── data/
│   └── players.ts        # Player data, tiers, categories, utility functions
├── components/
│   ├── Navbar.tsx         # Navigation bar with logo, links, search
│   ├── TierBadge.tsx      # Tier badge (HT1, LT1, etc.) component
│   └── PlayerAvatar.tsx   # Minecraft player head component
├── pages/
│   ├── Home.tsx           # Landing page with hero + top 3 players
│   ├── Rankings.tsx       # Rankings page (overall table + per-category tier columns)
│   ├── PlayerProfile.tsx  # Individual player profile page
│   └── ApiDocs.tsx        # API documentation page
├── App.tsx                # Router setup
├── index.css              # Global styles (dark theme matching mctiers)
└── main.tsx               # Entry point
```

## Pages & Routes
- `/` — Home page with hero section and top 3 players
- `/rankings/overall` — Overall leaderboard (rank, player, region, tier badges)
- `/rankings/:category` — Category-specific tier columns (vanilla, uhc, pot, nethop, smp, sword, axe, ltms)
- `/player/:username` — Player profile with all tier rankings
- `/api-docs` — API documentation

## Development
- Run: `pnpm run dev` (starts on port 5000)
- Build: `pnpm run build`
- Performance: animated background now uses a capped-DPR canvas particle layer plus lightweight GPU-transformed glow/grid effects.

## Deployment
- Target: Static site
- Build command: `pnpm run build`
- Public directory: `dist`

## Design
- Dark theme matching mctiers.com (#0d1117 background)
- Tier system: HT1-HT4 (High Tier), LT1-LT5 (Low Tier)
- Player ranks with gold/silver/bronze highlighting for top 3
- Region badges: NA (blue), EU (green), AS (red), OC (purple)
- Player heads fetched from mc-heads.net
- Navbar dropdowns render above the sticky header without clipping and use high-contrast glass styling.

## Secrets
- `GITHUB_TOKEN` — GitHub Personal Access Token (available via env)
