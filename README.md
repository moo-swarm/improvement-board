# Improvement Board

A team improvement tracking tool based on Management 3.0's Improvement Dialogues and Copilot Programs — capture problems, run structured dialogues, assign peer coaches, and track progress. Items move through Identified → In Progress → Done in both a Board (list) and a Kanban view, with due dates, aging indicators, voting, and an async comment thread per item. All state lives in the browser (no backend); the app deep-links into the wider agile-toolkit suite (Sprint Metrics, Moving Motivators, Kanban Designer, Change Planner, Planning Poker).

Part of the [Agile Tools](https://github.com/bthos) suite built on Management 3.0 and ICAgile source materials.

See `GOAL.md` for why this app exists and `ROADMAP.md` for what's shipped and queued next.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · react-i18next (EN/ES/BE/RU)

## Dev commands
```bash
npm install       # install dependencies
npm run dev       # start Vite dev server
npm run build     # tsc typecheck + production build
npm test          # vitest unit tests
npm run preview   # preview the production build locally
```

## Deploy
GitHub Pages via GitHub Actions on push to `main`.

## Decision latency tracking

Improvement items stall when nobody owns the decision they depend on. Any item can be flagged **Decision required** from its board card, with a decision owner (free text) and a decision model — DACI, Consent, Manager decides, Other. Flagging records when the need for the decision was opened, and cards in both the list board and the Kanban view grow a dot badge that ages green → amber → red through fresh / aging (>7 days) / stale (>21 days), mirroring the existing due-date indicators, with a days-since-opened tooltip. A **By decision** sort mode lifts decision-required items to the top of each column, oldest open decision first.

When a flagged item reaches Done, its latency is stamped automatically — once, at the single `updateItems` choke point every mutation flows through, so re-opening an item later keeps its first resolution stamp. The collapsible **Sprint archive & decisions** panel at the bottom of the board reports median decision latency grouped by owner across archived items, busiest owners first, with unowned decisions bucketed separately under Unassigned.

Decision tracking adds five optional fields to stored items; nothing else about storage changes — older exports, cross-app deep links, and other suite readers ignore the new fields unchanged.

See [Estimate vs forecast](https://github.com/moo-swarm/agile-toolkit.github.io/blob/main/docs/estimate-vs-forecast.md) for the sibling idea in Sprint Metrics: measuring systems instead of asking people for promises.

## localStorage keys

| Key | Shape | Purpose |
|-----|-------|---------|
| `improvement-board-items` | `ImprovementItem[]` | The board's items — written by `saveItems()` in `App.tsx` on every mutation. |
| `improvement-board-members` | `TeamMember[]` | Team roster used for owner/copilot/comment-author selection — written by `saveMembers()` in `App.tsx`. |
| `improvement-board:lastSession` | `{ identified, inProgress, done, total, memberCount, lastUpdated }` | Compact summary written on every item/member update; read by the suite Dashboard (`agile-toolkit.github.io`) to render a live preview card. |
| `improvement-board:sprintHistory` | `SprintArchive[]` — `{ sprintNumber, archivedAt, items[] }[]` | Archive of items snapshotted by "End Sprint"; written by `handleEndSprint()` in `App.tsx`. |
| `theme` | `'light' \| 'dark'` | User's theme preference, written by `ThemeToggle.tsx`. |

## Tech notes
- **State management:** plain React state in `App.tsx` (no store library); all mutations flow through a small set of handlers (`updateItems`, `updateMembers`, `handleEndSprint`, `handleBulkStatus`/`handleBulkDelete`, `handleVote`) that also persist to localStorage, so the two are always kept in sync.
- **i18n:** `react-i18next`, 4 locales (`en`, `es`, `be`, `ru`) under `src/i18n/`; category labels use dynamic keys (`` t(`add_form.categories.${id}`) ``) so they aren't picked up by literal-key audits — re-run a manual audit after large copy changes and keep all four locale files in sync.
- **Theming:** `ThemeToggle.tsx` toggles a `data-theme` attribute on `<html>`, matched by Tailwind's `dark:` variants (configured via the `[data-theme="dark"]` selector strategy in `tailwind.config.js`); an anti-flash script in `index.html` applies the stored/preferred theme before first paint.
- **PWA:** `vite-plugin-pwa` with `registerType: 'autoUpdate'` — precaches JS/CSS/HTML/icons for offline in-room facilitation; `UpdateToast.tsx` surfaces a reload prompt via `useRegisterSW` when a new version is cached.
- **Cross-app integrations (read/deep-link, not owned by this app):** `src/utils/movingMotivatorsImport.ts` reads `moving-motivators:lastSession` to suggest the bottom-ranked motivators as one-click item pre-fills; `src/utils/kanbanLink.ts` and `src/utils/changePlannerLink.ts` build outbound deep-link URLs (`?prefill=...&utm_source=improvement-board`) to Kanban Designer and Change Planner; the app also accepts inbound `?prefill=<title>&utm_source=...` from Sprint Metrics and Moving Motivators to auto-open the Add Item modal.
- **Board export:** "Export PNG" uses `html2canvas` to capture the columns grid, clipboard-first with a file-download fallback.

## Source materials
See `.artefacts/BRIEF.md` for the full agent-maintained feature checklist and run-by-run narrative log (issue research, implementation decisions).
