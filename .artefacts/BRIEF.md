# BRIEF — Improvement Board

## What this app does
A team improvement tracking tool based on Management 3.0's "Improvement Dialogues" and "Copilot Programs" practices. Teams identify problems, run structured improvement dialogues, assign copilots (peer coaches), and track progress on improvement items over time.

## Target users
Agile coaches, Scrum Masters, and team leads facilitating continuous improvement. Teams of 3–15 people running regular retrospectives or improvement cycles.

## Core features (MVP)
- Problem capture board: add improvement items with category tags
- "Problem Time" timer: facilitates the structured problem-discussion practice
- Improvement dialogue flow: structured 1:1 or group dialogue with guided questions
- Copilot assignment: pair team members as improvement buddies
- Progress tracker: kanban-style board for improvement items (Identified → In Progress → Done)
- History view: closed items with outcomes

## Educational layer
- "What is an Improvement Dialogue?" explainer panel
- Copilot Program guide: roles, responsibilities, how to run a copilot session
- "Problem Time" practice explainer with M3.0 rationale
- Reference to source materials

## Tech stack
React 18 + TypeScript + Vite + Tailwind CSS. Firebase for persistence (optional team mode). GitHub Pages deployment.

## Source materials in `.artefacts/`
- `improvement dialogues & copilot programs.pdf` — M3.0 improvement dialogue and copilot program methodology
- `problem time.pdf` — Problem Time practice guide

## i18n
English + Russian (react-i18next).

## Agentic pipeline roles
- `/vadavik` — spec & requirements validation
- `/lojma` — UX/UI design (improvement board, dialogue flow, copilot pairing UI)
- `/laznik` — architecture (board state, timer, Firebase optional persistence)
- `@cmok` — implementation
- `@bahnik` — QA (timer accuracy, board state persistence, copilot assignment logic)
- `@piarun` — documentation
- `@zlydni` — git commits & GitHub Pages deploy
