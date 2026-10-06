# ClickSPEED.gg

**Free click speed & reflex tests** — precision instruments for gamers. Eight browser-based tools, fully client-side, no accounts, no backend.

[clickspeed.gg](https://clickspeed.gg) · Dark · Static · Cloudflare Pages

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Astro 7 (static output) |
| UI Islands | React 19 (interactive tests only) |
| Styling | Tailwind v4 + CSS variables |
| Fonts | Fontsource (Chakra Petch, JetBrains Mono, IBM Plex Sans) — self-hosted |
| State | React hooks + localStorage |
| Timing | `performance.now()` |
| Deploy | Cloudflare Pages (static) |

---

## Tests

| URL | Test |
|---|---|
| `/cps-test` | Clicks per second (1–60s durations) |
| `/1-second-cps-test` … `/60-second-cps-test` | Pre-selected duration variants |
| `/spacebar-counter` | Spacebar speed (no auto-repeat) |
| `/jitter-click-test` | Jitter clicking CPS |
| `/butterfly-click-test` | Butterfly clicking CPS |
| `/right-click-test` | Right-click CPS (context menu suppressed) |
| `/reaction-time-test` | 5-round reaction time (ms) |
| `/aim-trainer` | 30s aim precision trainer |
| `/mobile-tap-test` | Multi-touch tap counter |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deploy to Cloudflare Pages

1. **Fork / push** this repo to GitHub or GitLab.

2. In the [Cloudflare Pages dashboard](https://pages.cloudflare.com/):
   - Click **Create a project** → **Connect to Git**
   - Select your repo
   - **Build settings**:
     - Framework preset: `Astro`
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Click **Save and Deploy**

3. **Custom domain**: In Pages → Custom Domains, add `clickspeed.gg`.

4. **Environment variables**: None required for MVP. All config is in `src/config/`.

---

## Project Structure

```
src/
├── config/
│   ├── site.ts          # Site name, domain, nav list, ad flag
│   ├── tests.ts         # All test configs (slug, title, inputType, durations…)
│   └── tiers.ts         # Tier thresholds for CPS, reaction, aim
│
├── styles/
│   ├── tokens.css       # ALL CSS variables (edit here to retheme)
│   └── global.css       # Reset, font imports, primitives (.panel, .btn)
│
├── layouts/
│   ├── Base.astro       # HTML shell: SEO, fonts, JSON-LD
│   └── TestLayout.astro # 3-zone console: rail + arena + telemetry
│
├── components/          # Astro (static) components
│   ├── LeftRail.astro
│   ├── OtherTests.astro
│   └── SiteFooter.astro
│
├── islands/             # React interactive islands
│   ├── engine/
│   │   ├── useClickTest.ts     # Shared CPS engine hook
│   │   ├── useReactionTest.ts  # Reaction time state machine
│   │   └── useAimTrainer.ts    # Aim trainer engine
│   ├── CpsTest.tsx             # Used by 6 test pages
│   ├── ReactionTest.tsx
│   ├── AimTrainer.tsx
│   └── Telemetry.tsx           # Live stats + canvas graph
│
└── pages/               # One file = one URL
    ├── index.astro
    ├── cps-test.astro
    ├── [duration].astro  # /1-second-cps-test … /60-second-cps-test
    ├── spacebar-counter.astro
    ├── jitter-click-test.astro
    ├── butterfly-click-test.astro
    ├── right-click-test.astro
    ├── reaction-time-test.astro
    ├── aim-trainer.astro
    ├── mobile-tap-test.astro
    ├── sitemap.xml.ts
    ├── about.astro
    ├── privacy.astro
    ├── contact.astro
    └── terms.astro
```

---

## How to Add a New Test Variant

**One config entry = one new page.** Follow these steps:

### 1. Add to `src/config/tests.ts`

```ts
'my-new-test': {
  slug: 'my-new-test',
  title: 'My New Test — Description',
  h1: 'My New Test — H1 Copy',
  metaDescription: 'Meta description for SEO, 150 chars max.',
  inputType: 'click',           // 'click' | 'spacebar' | 'rightclick' | 'touch'
  testType: 'cps',              // 'cps' | 'reaction' | 'aim'
  defaultDuration: 5,
  durations: [1, 5, 10, 30],
  ctaLabel: 'CLICK TO START',
  copyHeadline: 'What Is My New Test?',
},
```

### 2. Add to `src/config/site.ts`

```ts
{ slug: 'my-new-test', label: 'My New Test', shortLabel: 'MYTEST', keyHint: '[9]', icon: '◆' },
```

### 3. Create `src/pages/my-new-test.astro`

Copy any existing CPS test page (e.g. `jitter-click-test.astro`) and update:
- `cfg = TEST_CONFIGS['my-new-test']`
- `currentSlug="my-new-test"`
- SEO copy in the `<div slot="seo">` section

That's it. The nav rail, sitemap, and other-tests grid all update automatically.

---

## Design System

All tokens live in `src/styles/tokens.css`. To retheme:

```css
:root {
  --accent: #FFB000;  /* Change this to change all accent color */
  --bg: #0A0A0B;
  /* … */
}
```

Shape language: **chamfered corners** (not rounded). The `.panel` + `.chamfer-clip-*` CSS classes provide the clipped-corner look. Never use `border-radius`.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `R` | Retry / restart current test |
| `Esc` | Cancel / reset |
| `[` / `]` | Previous / next test |
| `1–8` | Duration selector (CPS-family tests) |
| Any key | Input for Reaction Time test |

---

## Cloudflare Pages Headers (recommended)

Add a `public/_headers` file for security and performance:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```
