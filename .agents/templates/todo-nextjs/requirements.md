# Project Requirements

## Goal

A small, reliable todo app where a user can add, view, filter, edit, complete, and delete todos. It is built in **versions**. Each version is a complete, working app. Version 1 keeps data in the browser; Version 2 moves it to real API routes and a database. The app is structured so that moving between versions is a small change.

## Versions

| Version | Storage | What it adds |
| :--- | :--- | :--- |
| 1 | Browser `localStorage` | The complete app, with no backend. |
| 2 | SQLite behind API routes | Data lives on the server. The UI does not change. Optionally imports existing localStorage todos. |

Later versions (for example user accounts) are postponed and not planned yet.

## Core Features (all versions)

- Add a todo with a title (required, trimmed, 1 to 200 characters).
- List todos, newest first, with a clear empty state.
- Filter by All, Active, and Completed.
- Mark a todo complete or active again.
- Edit a todo's title.
- Delete a todo.
- Show how many active todos are left.
- Data persists across reloads (Version 1: same browser and device. Version 2: on the server).
- Clear loading and error states. Keyboard accessible. Usable at mobile width.

## Tech Stack

DEFAULTS. Change any of these before running `/plan`.

- All versions: Next.js (current stable release), App Router, **`src/` directory**, TypeScript strict, Tailwind CSS, Zod, Vitest with React Testing Library, Playwright.
- Version 1 only: `localStorage`. No backend, database, or API routes.
- Version 2 adds: Route Handlers under `src/app/api/todos`, SQLite with `better-sqlite3`, and Drizzle ORM.

## Architecture Principle

The UI talks only to a `TodoService` interface, and every method is async from Version 1 on. Version 1 implements it on `localStorage`; Version 2 adds an HTTP implementation that calls the API, backed by a repository on SQLite. Switching versions adds files and changes one line in `src/services/index.ts`. See `.agents/rules/nextjs-todo.md`.

## Constraints

- All input validated with the shared Zod schemas. In Version 2 the server validates too.
- No new dependencies without approval.
- Every acceptance criterion in `task.md` maps to a test.

## Out of Scope

- Accounts, login, multiple users, and sharing.
- Due dates, priorities, tags, and drag-and-drop ordering.
- Offline/PWA support and real-time sync.

## Open Decisions

- Deployment target: undecided. SQLite on a serverless host does not persist, so Version 2 needs a host with a persistent disk or a hosted database.
