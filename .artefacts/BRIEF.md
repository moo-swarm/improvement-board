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

## Tech notes

- Re-run literal-key audit after large copy changes; keep `ru.json` in sync with `en.json`.

## Agent Log

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
