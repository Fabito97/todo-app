# Next.js Todo & Executive Workspace (Version 1.4)

A fast, resilient, and accessible task management and executive daily workspace built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Zod.

## Architecture & Storage

All todos are stored client-side in the browser's `localStorage` under the key `todos:v1`, and user theme preferences (`light`, `dark`, or `system`) are persisted under `theme:v1` via `src/services/theme-storage.ts`. The UI components and hooks interact exclusively through the `src/services/` boundary (`LocalTodoService` and `theme-storage`), ensuring strict separation of concerns, complete backwards compatibility with legacy Version 1 / 1.1 / 1.2 / 1.3 items, and a seamless upgrade path for Version 2 (API routes + database).

All unit, component, and contract test suites live in a dedicated top-level `test/` directory mirroring `src/`, keeping production code in `src/` clean.

## Features

- **Full-Viewport Workspace Layout & Persistent Navigation**:
  - Persistent left sidebar on desktop (`w-60`, `hidden lg:flex`) featuring brand identity, navigation items (**Dashboard**, **Tasks**, **Calendar**), and anchored theme controls.
  - Responsive mobile bottom navigation bar (`lg:hidden`, `h-14`) with 44px touch targets.
  - Fixed top content header (`ContentHeader`) with active view titles, primary `+ New Task` action modal trigger, and notification center.
- **Executive Dashboard View (`DashboardView`)**:
  - 4 live Metric Cards: **Total Tasks**, **Active Tasks**, **Completed Tasks** (with animated progress bar and percentage), and **Critical Tasks** (high-priority count with urgency badge).
  - Single-line **Quick Add** input bar with instant submit and lightweight toast notifications.
  - Three demarcated executive panels:
    - **Today's Tasks**: Chronological agenda for today's time-blocked slots with quick completion toggles.
    - **Important / Critical**: Filtered high-priority tasks with quick edit and completion actions.
    - **Recent Tasks**: Latest tasks with relative timestamps and quick actions.
- **Modal Dialog System**:
  - Accessible modal dialogs (`role="dialog"`, `aria-modal="true"`, dismissible on `Escape`, backdrop click, or Cancel button):
    - `AddTaskModal`: Full task creation with title, description, priority, due date, start/end time, and category presets.
    - `TaskDetailsModal`: View-only read dialog displaying full task metadata, time block, notes, and inline delete confirmation.
    - `EditTaskModal`: Full-field task editor with pre-populated values and end-time validation.
- **Dedicated Tasks Board View (`TasksView`)**:
  - Clean view-only rows with status checkboxes, category tags, priority pills, and quick actions.
  - Comprehensive filtering by **Status** (All, Active, Completed), **Priority** (All, High, Medium, Low), and **Category**.
  - One-click **Reset filters** button and sorting by Newest, Due Date, or Priority.
- **Full Month Calendar Grid & Daily Schedule (`CalendarView`)**:
  - 7-column month grid displaying weekday headers, day numbers, today highlight, and task indicator dots.
  - Interactive month navigation (**Prev**, **Next**, **Today** jump).
  - Side-by-side or stacked Daily Schedule panel showing time-blocked intervals and all-day tasks for any selected date.
- **Zero-Flash Warm-Graphite Dark Mode**:
  - Synchronous blocking `<head>` script in `src/app/layout.tsx` eliminates theme flashing.
  - Curated Warm Graphite dark surface hierarchy (`#121316` canvas background, `#1a1d24` cards, `#22262f` interactive controls, `#2e3340` borders).
  - Interactive Light / Dark / Auto switcher.
- **Storage Resilience**:
  - Automatically recovers from corrupt `localStorage` data by initializing a fresh list and displaying a status banner.
  - Normalizes legacy stored items without metadata loss.
  - Continues operating in memory and alerts the user if browser storage writes fail.

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
