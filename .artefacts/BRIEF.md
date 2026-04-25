# Improvement Board — Brief

## Overview

Team improvement tracking aligned with Management 3.0 Improvement Dialogues / Copilot Programs: capture problems, dialogues, coaches, progress. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Board views — add/edit items, categories via `` t(`add_form.categories.${id}`) ``, timers where implemented
- [x] EN + RU parity for wired keys
- [x] `npm run build` green; no confirmed orphan **literal** i18n keys from NO-BRIEF pass (dynamic category keys used)

## Backlog

<!-- Research issues (`needs-review`) — agent appends after stable research runs -->
- [ ] [#2] Feature: Add ES and BE locales (suite alignment)
- [ ] [#3] Feature: Export board snapshot as PNG for stakeholder reporting
- [ ] [#4] Integration: Sprint Metrics → Improvement Board deep-link

## Tech notes

- Re-run literal-key audit after large copy changes; keep `ru.json` in sync with `en.json`.

## Agent Log

### 2026-04-25 — research: market + integration opportunities
- Done: created issues #2 (ES+BE locales), #3 (board PNG export), #4 (Sprint Metrics deep-link)
- No prior issues existed; required labels created (needs-review, approved, changes-requested, research-more)
- Waiting for human review on all three issues
- Next task: check needs-review issues for human feedback (#2 ES+BE locales, #3 board export, #4 Sprint Metrics integration)

### 2026-04-19 — docs: BRIEF template (AGENT_AUTONOMOUS)

- Done: Migrated to agent BRIEF structure; suite treats this repo as **stable** for agent-state.
- Next task: `check needs-review issues for human feedback` (`gh issue list --repo agile-toolkit/improvement-board --state open --json labels`).
