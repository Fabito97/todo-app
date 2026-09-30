# Next.js Todo & Schedule Workspace (Version 1.3)

A fast, resilient, and accessible task and daily time-blocking workspace built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Zod.

## Architecture & Storage

All todos are stored client-side in the browser's `localStorage` under the key `todos:v1`, and user theme preferences (`light`, `dark`, or `system`) are persisted under `theme:v1` via `src/services/theme-storage.ts`. The UI components and hooks interact exclusively through the `src/services/` boundary (`LocalTodoService` and `theme-storage`), ensuring strict separation of concerns, complete backwards compatibility with legacy Version 1 / 1.1 / 1.2 items, and a seamless upgrade path for Version 2 (API routes + database).

All unit, component, and contract test suites live in a dedicated top-level `test/` directory mirroring `src/`, keeping production code in `src/` clean.

## Features

- **Zero-Flash Warm-Graphite Dark Mode & Interactive Theme Toggle**:
  - Synchronous blocking `<head>` script in `src/app/layout.tsx` reads `theme:v1` / `prefers-color-scheme` and applies `.dark` to `<html>` before first paint, completely eliminating light-to-dark page load flashes.
  - Curated Warm Graphite dark surface hierarchy (`#121316` canvas background, `#1a1d24` elevated cards, `#22262f` interactive controls, `#2e3340` hairline borders).
  - Interactive **Light / Dark / Auto** theme switcher in the header persisted in `localStorage` (`theme:v1`).
- **Today's Dashboard (`DashboardOverview`)**:
  - Live completion progress bar (`role="progressbar"`) with percentage indicator.
  - Quick-glance stat pills for **Total**, **Active**, **Completed**, and **Due Today** tasks.
  - Dedicated **Tasks for the Day** agenda (`role="region"`, `aria-label="Tasks for the day"`) listing all tasks due today ordered chronologically by `startTime`, with quick completion checkboxes and time-block badges.
- **Demarcated Task Creation & Accessible Modal Composer**:
  - Dedicated Quick Command surface card (`aria-label="Create task"`) visually separated from the Task Board.
  - Clicking **Schedule** (`aria-label="Toggle details"`) opens an accessible Modal Dialog (`role="dialog"`, `aria-modal="true"`, `aria-label="Task details and schedule"`, dismissible via `Escape` or `Done`) without pushing the task list down inline.
  - Supports **Title**, **Description** (up to 1,000 chars), **Priority** (`high`, `medium`, `low`), **Due Date**, **Start Time** (`HH:mm` or `null`), **End Time** (`HH:mm` or `null`, validated so `endTime > startTime`), and **Category** with quick presets (`Work`, `Personal`, `Shopping`, `Other`).
- **Interactive Calendar & Daily Schedule View (`CalendarScheduleView`)**:
  - Switch workspace views between **Tasks**, **Calendar & Schedule**, and **Split View**.
  - Interactive date navigation (**Prev**, **Today**, **Next**, date picker, and 7-day quick strip).
  - Separates **Time-Blocked Schedule** slots (`startTime – endTime`, ordered chronologically) from **All-Day / Unscheduled Tasks** for the selected date.
- **In-App Notification & Reminder Center (`NotificationCenter`)**:
  - Header notification button (`aria-label="Notifications"`) with an active count badge for **Overdue** and **Today's Scheduled** incomplete tasks.
  - Accessible popover (`role="region"`, `aria-label="Notifications panel"`) surfacing overdue alerts and today's scheduled time blocks.
- **Rich Display & Inline Edit**:
  - Priority-colored left accent borders (`border-l-4`) and badges (rose for high, amber for medium, blue for low).
  - Monospace time-block badges (`09:00 – 10:30`) and overdue warning badges.
  - Full-field inline edit drawer for editing title, description, priority, due date, start time, end time, and category.
- **Enhanced Filtering & Sorting**:
  - Filter by **Status** (All, Active, Completed), **Priority** (All, High, Medium, Low), and **Category**.
  - One-click **Reset filters** button whenever any non-default filter is active.
  - Sort by **Newest**, **Due Date** (earliest date first, then earliest `startTime`), or **Priority** (high to low).
- **Storage Resilience**:
  - Automatically recovers from corrupt `localStorage` data by initializing a fresh list and displaying a status banner.
  - Seamlessly normalizes legacy stored items without metadata loss (`startTime: null`, `endTime: null`).
  - If storage writes fail (e.g., storage quota exceeded), the app continues operating smoothly in memory and alerts the user with a non-dismissible status notice.

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
