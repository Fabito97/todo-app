# Next.js Todo App (Version 1)

A fast, resilient, and accessible Todo application built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Zod.

## Version 1 Architecture & Storage

In **Version 1**, all todos are stored client-side in the browser's `localStorage` under the key `todos:v1`. The UI components interact exclusively through an asynchronous `TodoService` abstraction (`src/services/todo-service.ts` implemented by `LocalTodoService`), ensuring strict separation of concerns and a seamless upgrade path for Version 2 (API routes + database).

## Features

- **Add Todos**: Add new tasks with validation (non-empty, trimmed, maximum 200 characters).
- **List & Filter**: View all todos, or filter by **Active** or **Completed** states. Contextual empty messages appear when lists have no items.
- **Active Counter**: Real-time counter displaying remaining active items.
- **Toggle Completion**: Mark items as complete or active with immediate persistence across page reloads.
- **Inline Editing**: Double-click or click Edit to modify todo titles inline. Press <kbd>Enter</kbd> to save or <kbd>Escape</kbd> to cancel.
- **Delete Items**: Delete todos permanently.
- **Storage Resilience**:
  - Automatically recovers from corrupt `localStorage` data by initializing a fresh list and displaying a status banner.
  - If storage writes fail (e.g., storage quota exceeded or private browsing restrictions), the app continues operating smoothly in memory and alerts the user with a non-dismissible status notice.
- **Accessibility & Keyboard Navigation**:
  - Full keyboard support: navigate with <kbd>Tab</kbd>, activate with <kbd>Enter</kbd> / <kbd>Space</kbd>, cancel edit with <kbd>Escape</kbd>.
  - Accessible names and roles (`aria-label`, `aria-current`, `role="status"`).
- **Mobile Responsive**: Fully responsive layout optimized for screens down to 375px width without horizontal overflow.

## Tech Stack

- **Framework**: Next.js 16 (App Router with `src/` directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Unit & Component Testing**: Vitest & React Testing Library (jsdom)
- **End-to-End Testing**: Playwright (Chromium)

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v24)
- npm

### Installation

```bash
npm install
```

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification & Testing

Run individual test suites or the complete verification pipeline:

```bash
# Typecheck TypeScript files
npm run typecheck

# Lint with ESLint
npm run lint

# Run unit and component test suites (Vitest)
npm run test

# Run the fast quality gate (lint + typecheck + test)
npm run verify

# Run Playwright end-to-end tests (requires dev server or builds)
npm run e2e
```
