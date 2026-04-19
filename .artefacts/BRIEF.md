# BRIEF

Derived per [`agent-state.NO-BRIEF.md`](https://github.com/agile-toolkit/.github/blob/main/agent-state.NO-BRIEF.md). There was **no prior** `BRIEF.md`. Sources: `README.md`, `src/i18n/en.json` / `ru.json`, `src/`. Generated **2026-04-19**.

## Product scope (from `README.md`)

- **Improvement Dialogues / Copilot Programs** style tracking: capture problems, structured dialogues, peer coaches, progress.
- Stack: React 18, TypeScript, Vite, Tailwind, react-i18next (EN/RU).
- Deploy: GitHub Pages via Actions on `main`.

## Build

- `npm run build` — **passes** (verified **2026-04-19**).

## TODO / FIXME in `src/`

- None.

## i18n — dynamic keys

- `add_form.categories.*` are referenced via `` t(`add_form.categories.${c}`) `` in `ImprovementBoard.tsx`, `ImprovementCard.tsx`, `AddItemModal.tsx` — **not** orphaned; literal-path scanners will false-positive.

## i18n — follow-up

- Run a literal-key audit after any copy change; ensure `ru.json` mirrors `en.json` for every `add_form` / board string.

## Hardcoded user-visible strings

- No systematic scan in this pass; spot-check new UI in PRs.

## Classification (NO-BRIEF)

- **Status:** `stable` — components present, build passes, README scope reflected in app; no confirmed orphaned keys from literal scan beyond false positives.
- **First next task:** `null` (optional: add automated i18n key coverage check).
