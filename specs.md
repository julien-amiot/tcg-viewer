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

### 1.2 Pre-push lines-of-change gate ✅
- Blocks push if >300 lines changed
- Compares against remote tracking branch
- Runs before SonarQube analysis
- _Status: Implemented — scripts/pre-push.sh installed in .git/hooks, supports Windows and Unix_

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

### 2.1 Card Domain Model ✅
- Typed TypeScript representation of MTGJSON card data
- Value objects: `CardName`, `ManaCost`, `CardType`, `PowerToughness`, `Rarity`, `Color`
- `Card` aggregate with all fields from `data.cards[*]`
- Status: **Implemented** — All value objects + Card aggregate created

### 2.2 Card Data Loader (Primary Port) ✅
- Singleton `CardLoader` reads `CARDS/SOS_prepared.json` via `fetch`
- Maps raw JSON to `Card[]` typed entities via `Card.fromRaw()`
- Graceful skip on malformed cards
- Status: **Implemented**

### 2.3 Card Renderer ✅
- Render a single card with MTG-like layout (name, mana cost, type line, text box, P/T)
- CSS-first animations, honour `prefers-reduced-motion`
- JS only flips classes / `aria-*` state
- Status: **Implemented** — `CardRenderer` creates DOM elements per card

### 2.4 Card List / Grid ✅
- Display scrollable grid of card thumbnails via CSS Grid
- Filtering by name (text search), color (W/U/B/R/G), type, and rarity
- Live card count display
- Status: **Implemented** — Grid with 4 filter controls wired in `main.ts`

### 2.5 Set Selector 🔲
- Toggle between available sets (SOS)
- URL-based state (`?set=sos`) for shareability
- Status: **Planned**

### 2.6 Card Image Display ✅
- Add `imageUrl` property to `Card` domain model
- When `imageUrl` is non-empty, render it as a background image on the card container with `background-size: cover`
- Status: **Implemented**

### 2.7 Card number display ✅
- Display card number in footer to the left of the artist name
- Status: **Implemented**

### 2.8 Line breaks in text and flavorText ✅
- Replace `\n` with `<br>` in both `text` and `flavorText` fields
- Status: **Implemented**

### 2.9 Dark grey card background ✅
- Default card background color changed from blue-tinted to neutral dark grey (`#2a2a2a`)
- Status: **Implemented**

### 2.10 Card visual refinements ✅
- Mana dots in title have 0.1em white border; mana dots in text stay round without border
- Footer uses vertical gradient from card color to black (instead of `getTextAreaBackground`)
- Intermediate cell between title and type line: min 1/3 card height, flex-grow to fill available space
- 0.5em margin on each horizontal element (card-header, card-type-row, card-text, card-flavor-text)
- Status: **Implemented**

### 2.11 Planeswalker Initial Loyalty Display ✅
- Planeswalker cards display initial loyalty value at bottom right of the card
- Uses same position/style as power/toughness (footer area, right-aligned)
- Value rendered from `loyalty` field in raw card data via `InitialLoyalty` value object
- Styled with rounded dark gradient box, distinct from P/T to visually differentiate planeswalker cards
- Only shown when loyalty is present (cards without loyalty show nothing in this position)
- Status: **Implemented**

### 2.12 Card Design System (Atomic CSS) ✅
- **Goal:** All card rendering/layout defined purely through CSS — no inline styles in `CardRenderer.ts`.
- **Architecture:** Atomic Design (Smashing Magazine pattern library):
  - **Atoms:** Design tokens (CSS custom properties), mana dots, rarity indicators, color identity backgrounds, typography.
  - **Molecules:** Card header, mana cost bar, card type row, card text block, card footer.
  - **Organisms:** Card layouts — different visual structures based on card properties.
  - **Templates:** Page-level layouts (card grid, design system showcase).
- **Class composition:** Every card wrapper receives semantic CSS classes derived from its data properties:
  - `layout--normal`, `layout--token`, `layout--emblem`, `layout--prepare`, `layout--double_faced_token`
  - `type--creature`, `type--land`, `type--instant`, `type--sorcery`, `type--artifact`, `type--enchantment`
  - `color-identity--W`, `color-identity--U`, `color-identity--B`, `color-identity--R`, `color-identity--G`
  - `color-identity--WU`, `color-identity--BW`, etc. (multi-color gradients)
  - `color-identity--gold` (4-5 color)
  - `color-identity--none` (colorless)
  - `frame--2015`, `frame--2003`
  - `rarity--common`, `rarity--uncommon`, `rarity--rare`, `rarity--mythic`
  - `supertype--legendary`
- **Design system showcase page:** `/design-system.html` auto-scans card JSON, identifies all unique combinations of exposed CSS properties, and renders one specimen card per combination.
- **File structure:** `src/design-system/{tokens,atoms,molecules,organisms,templates}/*.css` + barrel `index.css`.
- **Domain model extensions:** `Card` now exposes `cssLayout`, `cssTypes`, `cssSupertypes`, `cssFrameVersion`, `cssColorIdentity`, `cssRarity` getters. `layout`, `supertypes`, `types`, `frameVersion` added to `CardOptions`/`RawCardData`.
- **Status:** **Implemented**

---

## 3. Quality Infrastructure

### 3.1 SonarQube Setup ✅
- Create `sonar-project.properties`
- Docker compose for local SonarQube
- CLI quality gate check via `sonarqube-scanner`
- Token stored in `.env` (gitignored)
- _Status: Fully operational — SQ 26.5.0 running, project `sc-tcg-card-view` created, first analysis PASSED_

### 3.2 Pre-push Hook ✅
- Active `pre-push` hook (not .sample)
- Lines-of-change gate (>300 blocks)
- SonarQube quality gate integration with token from `.env`
- Graceful fallback when SonarQube is unreachable
- _Status: Implemented — scripts/pre-push.sh version-controlled, quality gate passed_

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
