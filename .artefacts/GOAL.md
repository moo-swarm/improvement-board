# Improvement Board — Goal

## Problem
Teams running Management 3.0 Improvement Dialogues and Copilot Programs need a lightweight, persistent place to capture improvement items (problems, actions, owners, coaches), work them through a simple status flow, and keep a structured async dialogue about each one — without standing up a backend or a heavyweight project tracker.

## Audience
Scrum teams and their facilitators/Scrum Masters running recurring improvement dialogues (retro follow-through, Copilot Program pairing), in-session on a shared screen or individually between sessions, typically as one board per team per browser (localStorage-only, no accounts).

## Success criteria
1. A facilitator can capture a new improvement item (title, category, owner, copilot) in under 10 seconds during a live session.
2. Items visibly move through Identified → In Progress → Done in both Board (list) and Kanban views, with sorting/filtering (due date, votes, staleness) to surface what needs attention.
3. Teams can hold an async dialogue on any item (timestamped comment thread) between sessions without losing prior context.
4. A sprint's worth of work can be closed out ("End Sprint") and archived without manual bookkeeping, and the board resets cleanly for the next cycle.
5. The board integrates into the wider agile-toolkit suite (Sprint Metrics, Moving Motivators, Kanban Designer, Change Planner) via deep-links and shared localStorage conventions, so items don't have to be re-typed across apps.

## Non-goals
- No backend, accounts, or multi-device sync — state lives in the browser's localStorage.
- Not a general-purpose task/project manager — scope is strictly improvement items tied to Management 3.0 dialogues, not arbitrary work tracking.
- No real-time multi-user collaboration (e.g. simultaneous live cursors) — the shared-screen-in-a-meeting model is sufficient.
- No enforced identity/auth for who voted, commented, or acted — attribution fields (author, owner) are free text/selection, not verified accounts.
