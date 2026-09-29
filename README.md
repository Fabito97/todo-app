# Next.js Todo App (Version 1.2)

A fast, resilient, and accessible Todo application built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Zod.

## Architecture & Storage

All todos are stored client-side in the browser's `localStorage` under the key `todos:v1`, and user theme preferences (`light`, `dark`, or `system`) are persisted under `theme:v1` via `src/services/theme-storage.ts`. The UI components and hooks interact exclusively through the `src/services/` boundary (`LocalTodoService` and `theme-storage`), ensuring strict separation of concerns, complete backwards compatibility with legacy Version 1 items, and a seamless upgrade path for Version 2 (API routes + database).

All unit, component, and contract test suites live in a dedicated top-level `test/` directory mirroring `src/`, keeping production code in `src/` clean.

## Features

- **Dashboard Progress & Stat Summary**:
  - Live completion progress bar (`role="progressbar"`) with percentage indicator.
  - Quick-glance stat pills for **Total**, **Active**, and **Completed** tasks.
- **Softer Dark Mode & Interactive Theme Toggle**:
  - Layered slate/charcoal dark mode palette (`#0f172a` / `slate-900` background, `slate-800/90` cards, `slate-700/60` inputs) designed for comfortable contrast.
  - Interactive **Light / Dark / Auto** theme switcher in the header persisted in `localStorage` (`theme:v1`).
- **Add Rich Todos**: Add tasks with title alone, or expand the details panel to include:
  - **Priority**: `high`, `medium`, or `low` (defaults to `medium`).
  - **Due Date**: Date picker with automatic overdue detection for uncompleted tasks.
  - **Category**: Custom category tag with quick presets (Work, Personal, Shopping, Other).
  - **Description**: Detailed notes up to 1,000 characters.
- **Rich Display & Inline Edit**:
  - Priority-colored left accent borders (`border-l-4`) and badges (rose for high, amber for medium, blue for low).
  - Overdue warning badges for past-due incomplete tasks.
  - Category tags and collapsible notes viewer.
  - Full-field inline edit drawer for editing title, description, priority, due date, and category.
- **Enhanced Filtering & Sorting**:
  - Filter by **Status** (All, Active, Completed).
  - Filter by **Priority** (All, High, Medium, Low).
  - Filter by **Category** (All categories or specific tags).
  - One-click **Reset filters** button whenever any non-default filter is active.
  - Sort by **Newest**, **Due Date** (earliest first), or **Priority** (high to low).
  - Contextual empty state messages adapting to active filters.
- **Active Counter**: Real-time counter displaying remaining active items.
- **Toggle Completion**: Mark items as complete or active with immediate persistence across page reloads.
- **Delete Items**: Delete todos permanently.
- **Storage Resilience**:
  - Automatically recovers from corrupt `localStorage` data by initializing a fresh list and displaying a status banner.
  - Seamlessly parses legacy Version 1 stored items without metadata loss.
  - If storage writes fail (e.g., storage quota exceeded or private browsing restrictions), the app continues operating smoothly in memory and alerts the user with a non-dismissible status notice.
- **Accessibility & Keyboard Navigation**:
  - Full keyboard support: navigate with <kbd>Tab</kbd>, activate with <kbd>Enter</kbd> / <kbd>Space</kbd>, cancel edit with <kbd>Escape</kbd>.
  - Accessible names, roles, and states (`aria-label`, `aria-current`, `aria-pressed`, `role="progressbar"`, `role="status"`).
- **Mobile Responsive**: Fully responsive layout optimized for screens down to 375px width without horizontal overflow.

## Tech Stack

- **Framework**: Next.js 16 (App Router with `src/` directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Unit & Component Testing**: Vitest & React Testing Library (`test/` directory, jsdom)
- **End-to-End Testing**: Playwright (`e2e/` directory, Chromium)

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
