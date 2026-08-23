# Project Configuration

> This file is read by Claude Code agents and pipeline scripts.
> Fill in the values below before running the pipeline.

## Project-Specific Configuration

- **Test command:** `npm test`
- **Build command:** `npm run build`
- **Version files:** `package.json`
- **Artifacts directory:** `.artefacts/`

## Project Context

> Optional. Describe the project so agents have background without reading the whole codebase.

- **What it is:** Improvement board for agile teams — items flow identified → in progress → done, with copilot dialogues, kanban view, and sprint archiving.
- **Tech stack:** TypeScript, React, Vite, Tailwind CSS, i18next (en/es/be/ru)
- **Key conventions:** functional components, no classes; pure logic in `src/utils/` with co-located `*.test.ts` (vitest, node env); localStorage persistence under `improvement-board*` keys; all item writes flow through App `updateItems`.
