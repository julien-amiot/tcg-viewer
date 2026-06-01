# SC-TCG — Feature Specification Tree

> Each header represents a feature bounded to **≤300 lines** of code.
> Status: ✅ Implemented | 🔲 Planned | 🚫 Out of scope

---

## 1. Development & Quality

### 1.1 SonarQube quality gate ✅
- Local Docker-based SonarQube instance (SQ 26.5.0, Community Edition)
- Quality gate check before push
- TypeScript, CSS, HTML, JSON analysis
- _Status: Running on localhost:9000, first analysis PASSED, Quality Gate "SC-TCG Quality Gate" configured_

### 1.2 Pre-push lines-of-change gate 🔲
- Blocks push if >300 lines changed
- Compares against remote tracking branch
- Runs before SonarQube analysis
- _Status: Only .sample hooks exist, no active pre-push hook_

### 1.3 TypeScript strict mode ✅
- Enable `strict: true` in tsconfig.json
- Fix all resulting type errors
- Add proper null checks
- _Status: strict enabled, build passes cleanly after deps fix_

### 1.4 Engineering principles (binding)

- **TDD**: every domain rule starts as a failing Vitest unit test (pure TS, no DOM).
- **BDD with Gherkin**: user-observable behaviours live in `.feature` files run by `playwright-bdd` against a real headless Chromium. Step fixtures drive the view layer through the URL and a single opt-in test bridge — never by importing `src/`.
- **Heaxgonal architecture**
- **SOLID** (especially OCP for node kinds via capability interfaces).
- **Object calisthenics**: small classes, value objects everywhere (no primitive obsession), shallow inheritance, polymorphism over flag-driven conditionals, no `null` as control flow.
- **Minimal external libraries**.
- **Full TypeScript**.
- **CSS-first animations**: when in tradeoff, prefer CSS transitions/animations over JS-driven motion. JS only flips classes / `aria-*` state. Honour `prefers-reduced-motion`.

---

## 2. Features

### 2.1 Card Domain Model 🔲
- Typed TypeScript representation of MTGJSON card data
- Value objects: `CardName`, `ManaCost`, `CardType`, `PowerToughness`, `Rarity`
- `Card` aggregate with all fields from `data.cards[*]`
- Status: **Planned** — `Color` value object exists; rest to be created

### 2.2 Card Data Loader (Primary Port) 🔲
- Hexagonal primary port: `CardRepository` interface
- Implementation reads `CARDS/SOS_prepared.json` via `fetch`
- Returns `Card[]` typed entities
- Status: **Planned**

### 2.3 Card Renderer 🔲
- Render a single card with MTG-like layout (name, mana cost, type line, text box, P/T)
- CSS-first animations, honour `prefers-reduced-motion`
- JS only flips classes / `aria-*` state
- Status: **Planned**

### 2.4 Card List / Grid 🔲
- Display scrollable grid of card thumbnails
- Basic filtering by color (W/U/B/R/G)
- Pagination or virtual scrolling for large sets (~368 cards)
- Status: **Planned**

### 2.5 Set Selector 🔲
- Toggle between available sets (SC, TDM)
- URL-based state (`?set=sc`) for shareability
- Status: **Planned**

---

## 3. Quality Infrastructure

### 3.1 SonarQube Setup ✅
- Create `sonar-project.properties`
- Docker compose for local SonarQube
- CLI quality gate check via `sonarqube-scanner`
- Token stored in `.env` (gitignored)
- _Status: Fully operational — SQ 26.5.0 running, project `sc-tcg-card-view` created, first analysis PASSED_

### 3.2 Pre-push Hook 🔲
- Active `pre-push` hook (not .sample)
- Lines-of-change gate (>300 blocks)
- SonarQube quality gate integration
- Status: **Planned**

### 3.3 Unit Test Bootstrap 🔲
- First Vitest test for `Color` domain class
- Confirm test pipeline runs green
- Status: **Planned**

### 3.4 E2E Test Bootstrap 🔲
- First Playwright BDD `.feature` file
- Confirm headless Chromium runs against built app
- Status: **Planned**

### 3.5 Git & GitHub Setup ✅
- Repository initialized on `trunk` branch
- Remote origin: `https://github.com/julien-amiot/tcg-viewer.git` (private)
- `.env` with `GITHUB_PAT` (gitignored)
- `.gitignore` covers `node_modules/`, `dist/`, `coverage/`, `.env`, `.scannerwork/`, `.sonar/`
- _Status: Initial commit `fd74721` pushed to GitHub_
