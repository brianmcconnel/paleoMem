# paleoMem

Side-by-side English (WEB) + Hebrew scripture reader with **programmatic Paleo-Hebrew pictographic letter-by-letter translations**, toggleable emojis, and AI-powered insights.

Built with a clean Next.js + TypeScript structure, Tailwind, and a reverent dark theme focused on Hebrew scripture study.

## Prerequisites

```bash
# Activate your development environment (example uses conda)
source ~/miniconda3/etc/profile.d/conda.sh && conda activate your-env
npm install
```

## Development

```bash
npm run dev          # http://localhost:3000
npm run validate     # typecheck + lint + format:check
npm run format       # write prettier
```

## Roadmap (see docs/ROADMAP.md)

1. Pictograph mapping engine (done)
2. Data pipeline + sample verses
3. Core reader UI (side-by-side + pictographic insights)
4. Letter parser + toggle + emoji support
5. AI summary route (stub + later xAI/OpenAI)
6. Navigation, verse picker, persistence prefs
7. PWA / mobile follow-up

## Key folders

- `app/` — pages (reader) + API routes (`/api/summary`)
- `components/` — VerseDisplay, PictographBreakdown, LetterGrid, AISummary, etc.
- `data/` — clean scripture JSON (Hebrew + WEB + structure)
- `lib/` — `pictograph.ts` (core), verse utils, parsers (pure + tested where possible)

Strong’s numbers link to Blue Letter Bible (https://www.blueletterbible.org) for full concordance, definitions, and cross-references.

## Old Testament Navigation

The app now supports full Old Testament navigation:

- Use the **Old Testament Navigator** to select any book, chapter, and verse.
- Direct reference input (e.g. `Isaiah 53:5`)
- Previous / Next verse buttons
- When detailed interlinear + pictograph data is available, it loads automatically.

To extend with more verses, add entries to `data/verses.ts` following the existing `ScriptureVerse` shape (KJV + Hebrew + interlinear words with Strong’s).

## Retrieving Scripture Data from Open Source

**Run this to get the full Old Testament:**

```bash
npm run data:fetch
```

This does:
- KJV from https://github.com/bibleapi/bibleapi-bibles-json (public domain JSON)
- Full Hebrew OT + Strong's numbers from **Open Scriptures Hebrew Bible (OSHB / morphhb)** — https://github.com/openscriptures/morphhb

Data files:
- `data/kjv.json`
- `data/ot-hebrew.json` (23k+ verses with Hebrew text and per-word Strong's)

The app now loads the **full Old Testament Hebrew** for any verse you select in the navigator. KJV text is also from the open source for every reference.

Note: Per-word English glosses are minimal (fallback to Strong's number) because the source focuses on text + Strong's. Transliteration and richer glosses can be added later from the strongs dictionary.

The pictographic letter breakdown works on every verse using the Hebrew consonants.

## Local run

```bash
npm run dev
```

Open http://localhost:3000 — start with Genesis 1:1 and toggle the pictographs.

## Deploy to GitHub Pages

This app is configured for static export (`output: 'export'` in `next.config.ts`) with `basePath: '/paleoMem'`.

1. Push your changes to the `main` branch.
2. In your GitHub repo, go to **Settings > Pages**.
3. Under "Build and deployment", set **Source** to **GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) will automatically build and deploy on push.

Your site will be live at:  
**https://brianmcconnel.github.io/paleoMem/**

**Note on bundle size:** The full Hebrew dataset makes the initial JavaScript bundle quite large (~33 MB chunk). First load can be slow. For better performance, data could be split by book and loaded on demand in a future update.

© 2026 Brian McConnel
