# paleoMem — Roadmap & Project Plan

**Web app first (Next.js)** → rapid side-by-side English (WEB) + Hebrew scripture, programmatic letter-by-letter pictographic translation with toggleable emojis, AI summary, then mobile follow-up.

We'll drive development in this workspace using code, scripts, and iteration. Start with **setup + foundation** so you can run and see progress immediately.

## Step 1: Project Initialization (Done)

Created a Next.js 16 project with TypeScript, Tailwind, shadcn/ui-ready structure, and dark mode foundation.

Key files/folders ready:

- `app/` for pages and API routes
- `components/` for reusable UI (VerseDisplay, PictographBreakdown, AISummary, etc.)
- `data/` for scripture JSON (we'll populate next)
- `lib/` for utilities (pictograph parser, verse utils)
- Tailwind configured with nice dark theme and Hebrew-friendly fonts
- Basic layout with reverent styling

## Next Immediate Actions (Priorities)

1. **Add the Pictograph Mapping** (core engine) — full 22+ letters with Paleo meanings + emoji assignments.
2. **Data Pipeline** — scripts to pull/convert OSHB Hebrew + WEB English into clean JSON. (start with hand-curated samples)
3. **Core Reader UI** — side-by-side verse display + expandable pictographic insights section.
4. **Letter Parser + Toggle** — programmatic letter-by-letter breakdown with emoji toggle.
5. **AI Integration** — secure API route for summaries/insights (add your xAI/OpenAI key later).
6. **Navigation + Verse Picker** — books/chapters/verses.

We iterate quickly — generate components, test with real verses (e.g., Genesis 1:1), refine the UI to match the vision, and make it rapid and beautiful. Once the web MVP is solid, we'll move to PWA/mobile.

## Current Phase Targets

- [x] Project scaffold + theme foundation
- [ ] Full pictograph map + parser (lib/pictograph.ts)
- [ ] 2–3 sample verses in data/
- [ ] Beautiful, reverent side-by-side reader + breakdown UI (Gen 1:1 demo)
- [ ] Emoji toggle + letter position stats
- [ ] Stub AI insights panel + /api/summary
- [ ] Basic book/chapter/verse nav (static for MVP)

## Non-Goals (initial)

- Full OSHB pipeline + thousands of verses (post-MVP)
- Account / cloud sync (local-first first)
- Complex morphology or full cantillation initially

## Tech Notes

- Follow clean modular patterns: strong `lib/` pure functions, small focused components, clear types, excellent dark UX.
- Minus deck.gl of course.
- RTL for Hebrew, careful with letter order (always show original + left-to-right analysis if needed).
- Font stack: excellent Hebrew support + elegant English for scripture.
