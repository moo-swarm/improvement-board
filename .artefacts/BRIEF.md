# Improvement Board — Brief

## Overview

Team improvement tracking aligned with Management 3.0 Improvement Dialogues / Copilot Programs: capture problems, dialogues, coaches, progress. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Board views — add/edit items, categories via `` t(`add_form.categories.${id}`) ``, timers where implemented
- [x] EN + RU parity for wired keys
- [x] `npm run build` green; no confirmed orphan **literal** i18n keys from NO-BRIEF pass (dynamic category keys used)
- [x] ES + BE locales — full translation of all keys; 4-language selector (EN/ES/BE/RU) in header
- [x] Sprint Metrics deep-link — `?prefill=<title>&utm_source=sprint-metrics` auto-opens Add Item modal with pre-filled title; source banner + footer link back to Sprint Metrics

## Backlog

<!-- Research issues (`needs-review`) — agent appends after stable research runs -->
- [ ] [#3] Feature: Export board snapshot as PNG for stakeholder reporting
- [ ] [#7] Integration: link Improvement Board items to Kanban Designer
- [ ] [#8] Feature: team priority voting on improvement items
- [ ] [#9] Research: keyboard accessibility and ARIA audit for board views
- [ ] [#10] Integration: Dashboard card via improvement-board:lastSession localStorage key
- [ ] [#11] Feature: due dates on improvement items with overdue highlighting
- [ ] [#12] Feature: item aging indicator for stale improvements
- [ ] [#13] Integration: Moving Motivators → Improvement Board (motivation health to action items)
- [ ] [#14] Feature: Sprint cycle reset — archive done items with sprint summary
- [ ] [#15] Feature: item comment thread in Dialogue view (async team notes with timestamps)
- [ ] [#16] Feature: PWA offline mode for in-room facilitation
- [ ] [#17] Integration: Promote improvement item to Change Planner
- [ ] [#18] Feature: bulk status actions (multi-select cards)

## Tech notes

- Re-run literal-key audit after large copy changes; keep `ru.json` in sync with `en.json`.

## Agent Log

### 2026-05-17 — research: PWA offline + Change Planner integration + bulk actions
- Done: created issues #16 (PWA offline mode via vite-plugin-pwa — cache-first strategy, manifest, update banner), #17 (Promote improvement item to Change Planner — deep-link with prefill+utm_source params), #18 (bulk status actions — multi-select cards + sticky action bar in Board view); all added to project #12 as Backlog
- No approved/incomplete/changes-requested issues found — all 15 open issues awaiting human review
- Next task: check issues for human feedback; implement first approved item among #10 (improvement-board:lastSession localStorage key — write in App.tsx updateItems/updateMembers, add readImprovementBoard() to agile-toolkit.github.io), #13 (Moving Motivators integration — same URL param pattern as #4), #14 (Sprint cycle reset — archive done items)

### 2026-05-15 — research: cross-app integrations + sprint workflow + dialogue features
- Done: created issues #13 (Moving Motivators → Improvement Board deep-link + localStorage import), #14 (Sprint cycle reset — archive done items + sprint history), #15 (item comment thread in Dialogue view for async team notes); all added to project #12 as Backlog
- No approved/incomplete/changes-requested issues found — all 10 open issues are awaiting human review
- Next task: check issues for human feedback; implement first approved item among #10 (localStorage session key, highest-value for Dashboard), #13 (Moving Motivators integration, same URL param pattern as #4), or #14 (sprint cycle reset)

### 2026-05-11 — research: Dashboard integration + feature opportunities
- Done: created issues #10 (Dashboard card via improvement-board:lastSession localStorage key), #11 (due dates with overdue highlighting), #12 (item aging indicator for stale improvements); all added to improvement-board project (number 12) as Backlog; existing issues #3, #7, #8, #9 still awaiting human review
- Waiting for human review on #3, #7, #8, #9, #10, #11, #12
- Next task: check issues for human feedback; implement first approved item (#10 localStorage session key is highest-value — write improvement-board:lastSession in App.tsx updateItems/updateMembers; add readImprovementBoard() to agile-toolkit.github.io dashboard readers)

### 2026-05-08 — research: integration + feature + accessibility opportunities
- Done: created issues #7 (Kanban Designer deep-link integration), #8 (team priority voting with localStorage), #9 (keyboard accessibility / ARIA audit); all added to improvement-board project (number 12) with status Backlog; labels created; issue #3 (PNG export) confirmed still needs-review
- Waiting for human review on #3, #7, #8, #9
- Next task: check issues for human feedback; implement whichever issue is approved first (#3 PNG export uses html2canvas precedent from moving-motivators; #7 Kanban integration; #8 voting; #9 a11y)

### 2026-04-28 — feat: Sprint Metrics → Improvement Board deep-link integration
- Done: `?prefill=<title>&utm_source=sprint-metrics` URL params parsed in `App.tsx`; `BoardView` auto-opens `AddItemModal` with title pre-filled when `prefillTitle` is set; source banner shown when `utm_source=sprint-metrics`; footer link to `https://agile-toolkit.github.io/sprint-metrics/` added to all board views; i18n keys added for EN/ES/BE/RU
- Closed issue #4 (approved)
- Remaining backlog: #3 (PNG export)
- Next task: check needs-review issues for human feedback — only #3 (PNG export) remains; consider new research on board improvements

### 2026-04-28 — feat: ES + BE locales and 4-language selector
- Done: added `src/i18n/es.json` (Spanish), `src/i18n/be.json` (Belarusian); registered both in `src/i18n/index.ts`; replaced EN↔RU toggle in `App.tsx` with a 4-button EN/ES/BE/RU selector; issue #2 resolved
- Remaining backlog: #3 (PNG export), #4 (Sprint Metrics deep-link)
- Next task: implement issue #4 (Sprint Metrics deep-link) — approved

### 2026-04-25 — research: market + integration opportunities
- Done: created issues #2 (ES+BE locales), #3 (board PNG export), #4 (Sprint Metrics deep-link)
- No prior issues existed; required labels created (needs-review, approved, changes-requested, research-more)
- Waiting for human review on all three issues
- Next task: check needs-review issues for human feedback (#2 ES+BE locales, #3 board export, #4 Sprint Metrics integration)

### 2026-04-19 — docs: BRIEF template (AGENT_AUTONOMOUS)

- Done: Migrated to agent BRIEF structure; suite treats this repo as **stable** for agent-state.
- Next task: `check needs-review issues for human feedback` (`gh issue list --repo agile-toolkit/improvement-board --state open --json labels`).
