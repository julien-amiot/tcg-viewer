# SC-TCG Card Viewer

A web-based Magic: The Gathering card viewer / tabletop companion. Loads card data from MTGJSON-derived JSON files and renders them in the browser.

**Current scope:** Scars of Miracula (SC) and The Duels of Magic (TDM) sets.

## Architecture

```
┌─────────────────────────────────────────────┐
│              Browser (index.html)            │
│                                             │
│  ┌──────────┐    ┌──────────┐               │
│  │ CardList │    │ CardView │               │
│  │  (grid)  │    │ (render) │               │
│  └────┬─────┘    └────┬─────┘               │
│       │               │                     │
│       v               v                     │
│  ┌──────────────────────────┐               │
│  │   main.ts (entry point)  │               │
│  └──────────┬───────────────┘               │
│             │                               │
│  ┌──────────v───────────────┐               │
│  │  src/domain/ (hex layer) │               │
│  │  Color, Card, CardName   │               │
│  │  ManaCost, CardType ...  │               │
│  │  Loyalty, PowerToughness │               │
│  └──────────┬───────────────┘               │
│             │                               │
│  ┌──────────v───────────────┐               │
│  │  CardLoader (adapter)    │               │
│  └──────────────────────────┘               │
└─────────────────────────────────────────────┘
                    ▲
                    │ fetch
              CARDS/SOS_prepared.json
```

## Setup

```bash
npm install
npm run build        # tsc --noEmit + esbuild bundle → dist/
npm test             # vitest (unit)
npm run test:e2e     # playwright BDD
```

## SonarQube

```bash
npm run sonar:start   # Start SonarQube + Postgres (Docker)
npm run sonar:scan    # Run analysis (uses token from .env)
npm run sonar:stop    # Stop containers
```

- SonarQube UI: http://localhost:9000
- Config: `sonar-project.properties`
- Docker compose: `docker-compose.sonar.yml`
- Authentication: Token stored in `.env` (never committed to git)
- Project key: `sc-tcg-card-view`
- Quality Gate: `SC-TCG Quality Gate` (coverage ≥80%, 0 violations, 100% security hotspots, ≤3% duplication)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Full TypeScript (strict) |
| Build | `tsc --noEmit` (type check) |
| Bundler | esbuild (single bundled output) |
| Unit Tests | Vitest (`test/unit/`) |
| E2E / BDD Tests | Playwright + playwright-bdd (`test/e2e/`) |
| Quality Gate | SonarQube (local Docker) |
| Push Guard | Pre-push hook (≤300 lines + quality gate) |
| Frontend | Vanilla TS + HTML + CSS (no framework) |
| Data | MTGJSON JSON (`CARDS/`) |

## Current Features

### Domain Model & Rendering
- **Value objects:** `Color`, `CardName`, `ManaCost`, `CardType`, `PowerToughness`, `Rarity`, `InitialLoyalty`
- **Planeswalker cards** display initial loyalty at bottom right (footer), styled with rounded dark gradient box — same position as P/T, but visually distinct.

### Card Viewer Features
| Feature | Status |
|---------|--------|
| TypeScript strict mode | ✅ Build passes |
| Domain model (Card, Value Objects) | ✅ Fully implemented |
| Card data loader | ✅ Fetch + type mapping |
| Card renderer | ✅ DOM-based MTG layout |
| Card list / grid | ✅ Grid + 4 filters (name, color, type, rarity) |
| SonarQube setup | ✅ Running (SQ 26.5.0, first analysis PASSED) |
| Pre-push hook | ✅ Implemented — scripts/pre-push.sh with SonarQube integration |
| Set selector | 🔲 Planned (2.5) |
| Card image display | ✅ `imageUrl` property + CSS `cover` background (2.6) |
| Planeswalker loyalty display | ✅ `InitialLoyalty` value object + footer rendering (2.11) |

## Dependency Fixes (2026-06-01)

- Added `typescript@^5.4.0` to `devDependencies` (was missing, `tsc` not found)
- Updated `playwright-bdd` from `^0.5.0` (non-existent) to `^8.5.1`
- Updated `@types/node` from `18.15.x` to `^22.0.0` (TS 5.4 compatibility)
- Added `esbuild@^0.28.0` for bundling (replaces raw `tsc` emit)

## CI/CD Pipeline

GitHub Actions workflows are defined in `.github/workflows/`:

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Unit Tests | `unit-tests.yml` | PR + push to trunk | Runs Vitest with coverage |
| E2E Tests | `e2e-tests.yml` | PR + push to trunk | Runs Playwright BDD tests (Chromium) |
| Deploy | `deploy-gh-pages.yml` | Push to trunk | Builds app and deploys to GitHub Pages |

**PR requirements:** Unit tests pass, E2E tests pass.
**Deployment flow:** Merge → trunk → auto-deploy to GitHub Pages.

## Working Rules 

See [.clinerules](.clinerules) for binding rules (TDD, BDD, hexagonal architecture, ≤300 lines per feature, SonarQube gate enforcement).
