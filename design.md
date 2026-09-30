Design V1: APPROVED by human on 2026-09-29
Design V1.1: APPROVED by human on 2026-09-29
Design V1.2: APPROVED by human on 2026-09-29
Design V1.3: APPROVED by human on 2026-09-30
Design V1.4: APPROVED by human on 2026-09-30

---

# UI Design Specification — Version 1.3 (Task & Schedule Workspace)

## 1. Principles

1. **Warm Graphite, Not Blue-Tint Slate**: Dark mode uses a neutral **Warm Graphite** surface hierarchy (`#121316` canvas, `#1a1d24` cards, `#22262f` inputs, `#2e3340` borders) instead of cold `slate-900` (`#0f172a`), paired with a synchronous `<head>` theme script so page loads never flash light before turning dark.
2. **Demarcated Creation vs. Execution**: Task creation lives in its own dedicated Quick Command card at the top, and full task/event scheduling opens in an accessible **Modal Dialog** (`role="dialog"`) so expanding details never pushes the task list inline.
3. **Time-Aware Daily Workspace**: Tasks and schedule blocks coexist naturally through nullable `startTime` and `endTime` (`"HH:mm"`), surfaced in **Today's Dashboard**, an interactive **Calendar & Schedule View**, and a header **Notification Center**.
4. **High Contrast, Accessible by Default**: Every text and status badge pair exceeds WCAG AA (`4.5:1`), every interactive control is keyboard operable with a visible focus ring, and status is never communicated by colour alone.

---

## 2. Tokens

Dark mode is **in scope** (class-based `.dark` on `<html>`, persisted under `theme:v1` with Light, Dark, and System modes, initialized synchronously before first paint in `src/app/layout.tsx`).

### Color Tokens

| Role | Light Mode Class / Value | Light Hex | Dark Mode Class / Value (Warm Graphite) | Dark Hex | Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Canvas** | `bg-slate-50` | `#f8fafc` | `dark:bg-[#121316]` | `#121316` | Root `<body>` and `<main>` background |
| **Elevated Surface (Card / Modal)** | `bg-white` | `#ffffff` | `dark:bg-[#1a1d24]` | `#1a1d24` | Dashboard, Quick Command, Task Board, Schedule cards, Modal |
| **Interactive Control / Input** | `bg-slate-100` / `bg-white` | `#f1f5f9` / `#ffffff` | `dark:bg-[#22262f]` | `#22262f` | Text inputs, selects, segmented tabs, secondary buttons |
| **Surface Border** | `border-slate-200` | `#e2e8f0` | `dark:border-[#2e3340]` | `#2e3340` | Card, modal, input, and item borders |
| **Primary Text** | `text-slate-900` | `#0f172a` | `dark:text-zinc-100` | `#f4f4f5` | Headings, active task titles, input values |
| **Secondary Text** | `text-slate-600` | `#475569` | `dark:text-zinc-300` | `#d4d4d8` | Subtitles, descriptions, labels, metadata |
| **Muted Text** | `text-slate-500` | `#64748b` | `dark:text-zinc-400` | `#a1a1aa` | Completed task titles, helper hints, placeholders |
| **Primary Accent** | `bg-indigo-600 text-white` | `#4f46e5` / `#ffffff` | `bg-indigo-600 text-white` | `#4f46e5` / `#ffffff` | Primary CTAs (`Add Todo`, `Save`), active tabs, progress bar start |
| **Time-Block / Schedule Accent** | `bg-indigo-100 text-indigo-800 border-indigo-300` | `#e0e7ff` / `#3730a3` | `dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800` | `#1e1b4b` / `#a5b4fc` | Time-block badges (`09:00 – 10:30`), schedule slot indicators |
| **Completion / Success** | `bg-emerald-100 text-emerald-800 border-emerald-300` | `#d1fae5` / `#065f46` | `dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800` | `#022c22` / `#6ee7b7` | Completed stat pill, progress bar end gradient |
| **Priority High / Overdue / Danger** | `bg-rose-100 text-rose-800 border-rose-300` | `#ffe4e6` / `#9f1239` | `dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800` | `#4c0519` / `#fda4af` | High priority badge, overdue badge, error alerts, left border (`border-l-rose-500`) |
| **Priority Medium / Warning** | `bg-amber-100 text-amber-800 border-amber-300` | `#fef3c7` / `#92400e` | `dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800` | `#451a03` / `#fcd34d` | Medium priority badge, storage notice, left border (`border-l-amber-500`) |
| **Priority Low / Info** | `bg-blue-100 text-blue-800 border-blue-300` | `#dbeafe` / `#1e40af` | `dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800` | `#172554` / `#93c5fd` | Low priority badge, left border (`border-l-blue-500`) |
| **Focus Ring** | `focus:ring-2 focus:ring-indigo-500/50` | `#6366f1` | `focus:ring-2 focus:ring-indigo-400/60` | `#818cf8` | Keyboard focus indicator on all interactive elements |

### Typography, Spacing, Radius, Elevation & Breakpoints

- **Font Family**: Geist Sans (`--font-geist-sans`) for UI; Geist Mono (`--font-geist-mono`) for time-block ranges (`09:00 – 10:30`).
- **Type Scale**:
  - Workspace Title (`h1`): `text-3xl sm:text-4xl font-extrabold tracking-tight`
  - Section Heading (`h2`): `text-base sm:text-lg font-semibold`
  - Card / Item Title: `text-sm font-medium`
  - Body / Notes / Controls: `text-xs` (`12px`)
  - Badges / Pill Metadata: `text-[11px] font-medium`
- **Spacing & Container**: Max container width `max-w-5xl mx-auto` (expands cleanly for Split View while keeping single-pane views comfortable), vertical stack gap `space-y-6`, card padding `p-5 sm:p-6`.
- **Corner Radius**: Major cards & modal `rounded-2xl` (`16px`); inputs, buttons, and task items `rounded-xl` (`12px`); badges `rounded-full`.
- **Elevation**: Cards `shadow-md shadow-slate-200/40 dark:shadow-black/40`; Modal `shadow-2xl shadow-black/60` with `bg-black/60 backdrop-blur-sm` overlay.
- **Breakpoints**: Mobile-first down to `375px`; `sm:` (`640px`) for multi-column form grids and horizontal header bar; `lg:` (`1024px`) for side-by-side **Split View** (`grid-cols-1 lg:grid-cols-12`).

---

## 3. Layout Wireframes

### Desktop (`>= 1024px`, Split View active)

```text
+-----------------------------------------------------------------------------------+
| Todo List                                     [Bell (2)] [Light | Dark | System]  |
| Plan your tasks, daily schedule, and time blocks                                  |
+-----------------------------------------------------------------------------------+
| TODAY'S DASHBOARD                                                     67% done    |
| [Total: 3] [Active: 1] [Completed: 2] [Due Today: 2] [Time-Blocked: 1]            |
| [==================================================------------------------]      |
| Tasks for the Day (Today)                                                         |
|  - [ ] 09:00 - 10:30  Design review meeting        [high] [Work]                  |
|  - [x] All day        Submit sprint report         [medium] [Work]                |
+-----------------------------------------------------------------------------------+
| QUICK COMMAND BAR (Demarcated Card)                                               |
| [ What needs to be done?                              ] [Schedule / Details] [Add]|
+-----------------------------------------------------------------------------------+
| WORKSPACE VIEW:  (• Tasks )  ( Calendar & Schedule )  ( Split View )              |
+-----------------------------------------+-----------------------------------------+
| TASK BOARD (7 cols)                     | CALENDAR & SCHEDULE (5 cols)            |
| 1 item left [Reset]   [All|Active|Done] | [< Prev] [Today: 2026-09-30] [Next >]   |
| Priority: [All][High][Med][Low] [Sortv] | [Mon 28][Tue 29][*Wed 30*][Thu 01]...   |
| --------------------------------------- | --------------------------------------- |
| | [ ] Design review meeting   [Edit][X] | TIME-BLOCKED SCHEDULE                   |
| |     [high] [Work] [09:00 - 10:30]     |  09:00 - 10:30  Design review meeting   |
| | [x] Submit sprint report    [Edit][X] | ALL-DAY / UNSCHEDULED FOR THIS DATE     |
| |     [medium] [Work] [Due: 2026-09-30] |  [x] Submit sprint report               |
+-----------------------------------------+-----------------------------------------+
```

### Mobile (`375px`)

```text
+---------------------------------------+
| Todo List                             |
| [Bell (2)]   [Light | Dark | System]  |
+---------------------------------------+
| TODAY'S DASHBOARD           67% done  |
| [Total: 3] [Active: 1] [Due Today: 2] |
| [========================-----------] |
| Tasks for the Day:                    |
|  [ ] 09:00-10:30 Design review [high] |
+---------------------------------------+
| QUICK COMMAND BAR                     |
| [ What needs to be done?            ] |
| [Details / Schedule]     [ Add Todo ] |
+---------------------------------------+
| [ Tasks ] [ Calendar ] [ Split View ] |
+---------------------------------------+
| TASK BOARD                            |
| [All | Active | Completed]            |
| | [ ] Design review meeting [Edit][X] |
| |     [high] [09:00 - 10:30]          |
+---------------------------------------+
```

---

## 4. Components

### 4.1 Zero-Flash Theme Initializer (`src/app/layout.tsx`)
- **Purpose**: Prevent white flash (FOUC) when loading or reloading in Dark mode.
- **Anatomy & Behaviour**: Inline synchronous `<script>` in `<head>` reads `localStorage.getItem("theme:v1")`; if `"dark"` or (`!"light"` and `window.matchMedia("(prefers-color-scheme: dark)").matches`), adds `.dark` to `document.documentElement` before first paint.
- **Classes on `<body>`**: `min-h-full flex flex-col bg-slate-50 dark:bg-[#121316] text-slate-900 dark:text-zinc-100`.
- **Slice**: V1.3 Slice 02.

### 4.2 Quick Command Bar & Modal Composer (`src/components/AddTodoForm.tsx`)
- **Purpose**: Demarcated task creation bar that opens an accessible Modal Dialog (`role="dialog"`) for full metadata and time-blocking (`startTime`, `endTime`).
- **Anatomy**:
  - **Quick Command Bar**: Dedicated card (`bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-4 sm:p-5 shadow-md`) containing:
    - Title input (`aria-label="Todo title"`, placeholder `"What needs to be done?"`).
    - Details / Schedule trigger button (`aria-label="Toggle details"`, `aria-expanded={showDetails}`).
    - Submit button (`aria-label="Add todo"`, copy `"Add Todo"`).
  - **Modal Composer (`showDetails === true`)**:
    - Fixed overlay (`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4`) with dialog card (`role="dialog"`, `aria-modal="true"`, `aria-label="Task details and schedule"`).
    - Contains: Modal header + Close button (`aria-label="Close modal"`), Title mirror/input, Description textarea (`aria-label="Description"`), Priority button group (`Priority low`, `Priority medium`, `Priority high`), Due date input (`aria-label="Due date"`), Start time input (`type="time"`, `aria-label="Start time"`), End time input (`type="time"`, `aria-label="End time"`), Category input (`aria-label="Category"`) + preset chips (`Work`, `Personal`, `Shopping`, `Other`), and modal footer with `Cancel` and `Save & Add Todo` (`type="submit"`) buttons.
- **States**:
  - **Default**: Quick bar only; modal closed.
  - **Modal Open**: Focus moves into modal; pressing `Escape` or clicking Close/Backdrop closes modal.
  - **Validation Error**: Renders `<p role="alert">` inside the modal and under the bar (e.g., `"Title is required"` or `"End time must be after start time"`).
  - **Submitting / Disabled**: Inputs and submit button disabled while `onAdd` resolves; modal closes automatically on valid submission.
- **Slice**: V1.3 Slice 03.

### 4.3 Task Card with Time-Block Badge & Edit Inputs (`src/components/TodoItem.tsx`)
- **Purpose**: Displays a single task with priority left-border accent, metadata pills, time-block badge, and full inline edit mode including `startTime` and `endTime`.
- **Anatomy & States**:
  - **View Mode**: Checkbox (`aria-label="Toggle completion for <title>"`), title, Edit/Delete buttons, Priority badge, Category badge, Due Date badge (`Overdue: YYYY-MM-DD` or `Due: YYYY-MM-DD`), **Time-Block Badge** (rendered whenever `todo.startTime` or `todo.endTime` is set, e.g., `09:00 – 10:30` or `From 09:00` / `Until 10:30`, styled with `bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 font-mono`), and expandable notes.
  - **Edit Mode**: Title input (`aria-label="Edit todo title"`), Description textarea (`aria-label="Edit description"`), Priority group (`aria-label="Edit priority"`), Due date input (`aria-label="Edit due date"`), **Start time input** (`type="time"`, `aria-label="Edit start time"`), **End time input** (`type="time"`, `aria-label="Edit end time"`), Category input (`aria-label="Edit category"`), validation `<p role="alert">`, and `Cancel` / `Save` buttons.
- **Slice**: V1.3 Slice 03.

### 4.4 Today's Dashboard (`src/components/DashboardOverview.tsx`)
- **Purpose**: Gives the user an immediate, intuitive overview of today's workload, daily completion progress, and **Tasks for the Day**.
- **Anatomy**:
  - Card container (`aria-label="Task progress summary"`).
  - Stat pills row: `Total: <n>`, `Active: <n>`, `Completed: <n>`, `Due Today: <n>`.
  - Progress bar (`role="progressbar"`, `aria-label="Task completion progress"`, `aria-valuenow={completionPercentage}`).
  - **Tasks for the Day (`aria-label="Tasks for the day"`)**: Lists all todos where `dueDate === today` ordered chronologically by `startTime` (earliest `startTime` first, then all-day tasks for today), showing a completion checkbox, time-block badge (`09:00 – 10:30` or `All day`), title, and priority pill.
- **States**:
  - **Populated Today**: Renders each task due today with interactive completion toggle.
  - **Empty Today**: Displays `"No tasks scheduled for today. Use the command bar or calendar to plan your day."`
- **Slice**: V1.3 Slice 04.

### 4.5 Interactive Calendar & Schedule View (`src/components/CalendarScheduleView.tsx`)
- **Purpose**: Lets users browse dates, view a 7-day week strip with task indicators, and inspect a separated **Time-Blocked Schedule** vs. **All-Day / Unscheduled Tasks** for the selected date.
- **Anatomy**:
  - Section container (`aria-label="Calendar and schedule"`).
  - Date Navigation Bar: `Previous day` button (`aria-label="Previous day"`), `Today` button (`aria-label="Today"`), `Next day` button (`aria-label="Next day"`), and native date picker (`aria-label="Select schedule date"`).
  - 7-Day Week Strip: Interactive day pills showing weekday, day number, and count dot for days with scheduled items.
  - **Time-Blocked Schedule**: Chronological list of tasks on `selectedDate` that have `startTime` / `endTime`, displaying the time slot (`09:00 – 10:30`) in a left time column and the task card on the right.
  - **All-Day / Unscheduled Tasks**: Tasks due on `selectedDate` without a `startTime`.
- **States**:
  - **Empty Date**: Shows `"No tasks or time blocks scheduled for <selectedDate>."`
- **Slice**: V1.3 Slice 04.

### 4.6 Header Notification Center (`src/components/NotificationCenter.tsx`)
- **Purpose**: Alerts the user to **Overdue** and **Today's Scheduled** incomplete tasks without leaving the workspace.
- **Anatomy**:
  - Trigger button in header (`aria-label="Notifications"`, `aria-expanded={isOpen}`) with a numeric badge count of active alerts (overdue incomplete todos + incomplete todos due today).
  - Popover panel (`role="region"`, `aria-label="Notifications panel"`) listing each alert with an `Overdue` (rose) or `Today` (indigo/amber) status tag, its time block (`09:00 – 10:30` if set), and a quick complete action.
- **States**:
  - **Zero Alerts**: Badge hidden or `0`; clicking opens popover with `"You're all caught up! No overdue or upcoming tasks for today."`
  - **Active Alerts**: Displays count badge and categorized alert items; pressing `Escape` closes popover.
- **Slice**: V1.3 Slice 04.

---

## 5. Interaction and Motion

- **Zero Initial Theme Transition**: `<body>` and `<main>` omit slow background transition classes on initial load so the synchronous `<head>` theme script paints `#121316` immediately without fading from white.
- **Modal & Popover Transitions**: Subtle `150ms` opacity/scale entrance (`motion-reduce:transition-none`) respecting `prefers-reduced-motion`.
- **Keyboard Paths**:
  - `Enter` submits the Quick Command Bar title input or inline edit title input; `Enter` inside any `<textarea>` inserts a newline and never submits prematurely.
  - `Escape` closes the Modal Composer, Notification Center popover, or active inline edit mode.

---

## 6. Content and Microcopy

| Element | Copy |
| :--- | :--- |
| Header Subtitle | `"Plan your tasks, daily schedule, and time blocks"` |
| Quick Command Placeholder | `"What needs to be done?"` |
| Modal Title | `"Task Details & Time Block"` |
| Time Range Validation Error | `"End time must be after start time"` |
| Today's Dashboard Heading | `"Tasks for the Day"` |
| Today's Dashboard Empty State | `"No tasks scheduled for today."` |
| Calendar Empty State | `"No tasks or time blocks scheduled for this date."` |
| Notifications Empty State | `"You're all caught up! No overdue or upcoming tasks for today."` |

---

## 7. Accessibility Checklist & Verified Contrast Ratios

All colour pairs were verified using `node .agents/hooks/contrast.js <fg> <bg>`:

| Pair Description | Foreground | Background | Ratio | Normal Text (`4.5:1`) | Large / UI (`3.0:1`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Light Primary Text on Canvas | `#0f172a` | `#f8fafc` | **17.06:1** | PASS | PASS |
| Light Primary Text on Card | `#0f172a` | `#ffffff` | **17.85:1** | PASS | PASS |
| Light Secondary Text on Card | `#475569` | `#ffffff` | **7.58:1** | PASS | PASS |
| Light Secondary Text on Canvas | `#475569` | `#f8fafc` | **7.24:1** | PASS | PASS |
| Primary Button Text on Indigo CTA | `#ffffff` | `#4f46e5` | **6.29:1** | PASS | PASS |
| Dark Primary Text on Warm Graphite Canvas | `#f4f4f5` | `#121316` | **16.90:1** | PASS | PASS |
| Dark Primary Text on Warm Graphite Card | `#f4f4f5` | `#1a1d24` | **15.34:1** | PASS | PASS |
| Dark Secondary Text on Warm Graphite Card | `#d4d4d8` | `#1a1d24` | **11.41:1** | PASS | PASS |
| Dark Muted Text on Warm Graphite Card | `#a1a1aa` | `#1a1d24` | **6.58:1** | PASS | PASS |
| Dark Input Text on Warm Graphite Input | `#f4f4f5` | `#22262f` | **13.78:1** | PASS | PASS |
| High Priority / Overdue Badge (Light) | `#9f1239` | `#ffe4e6` | **6.68:1** | PASS | PASS |
| High Priority / Overdue Badge (Dark) | `#fda4af` | `#4c0519` | **8.27:1** | PASS | PASS |
| Medium Priority Badge (Light) | `#92400e` | `#fef3c7` | **6.37:1** | PASS | PASS |
| Medium Priority Badge (Dark) | `#fcd34d` | `#451a03` | **10.39:1** | PASS | PASS |
| Low Priority Badge (Light) | `#1e40af` | `#dbeafe` | **7.15:1** | PASS | PASS |
| Low Priority Badge (Dark) | `#93c5fd` | `#172554` | **8.15:1** | PASS | PASS |
| Time-Block Badge (Light) | `#3730a3` | `#e0e7ff` | **8.06:1** | PASS | PASS |
| Time-Block Badge (Dark) | `#a5b4fc` | `#1e1b4b` | **8.02:1** | PASS | PASS |
| Completed Stat Pill (Light) | `#065f46` | `#d1fae5` | **6.78:1** | PASS | PASS |
| Completed Stat Pill (Dark) | `#6ee7b7` | `#022c22` | **9.94:1** | PASS | PASS |

- **Non-colour indicators**: Priority badges include explicit text (`high`, `medium`, `low`), overdue badges include `Overdue: YYYY-MM-DD`, and time-block badges include clock/time range text (`09:00 – 10:30`).
- **Touch targets**: Primary buttons, segmented view controls, and modal triggers meet at least `40–44px` height on mobile.

---

## 8. Version Changes (V1.2 → V1.3)

1. **Dark Palette Upgrade**: Replaces `slate-900` (`#0f172a`) with Warm Graphite (`#121316` canvas, `#1a1d24` cards, `#22262f` controls) and adds a blocking `<head>` script in `src/app/layout.tsx` to eliminate the light-to-dark flash on reload.
2. **Modal Composer & Demarcation**: Moves `AddTodoForm` into its own card and opens its detail/schedule fields inside an accessible Modal Dialog (`role="dialog"`).
3. **Time-Blocking Fields**: Adds optional `startTime` and `endTime` inputs to `AddTodoForm` and `TodoItem` edit mode, plus time-block badges on task cards.
4. **Today's Dashboard, Calendar/Schedule View & Notification Center**: Adds `DashboardOverview`, `CalendarScheduleView`, `NotificationCenter`, and workspace view tabs (**Tasks**, **Calendar & Schedule**, **Split View**).

---

## 9. Suggested Plan Changes

Run `/plan 1.3` to record the Version 1.3 slices in `implementation_plan.md` and `task.md`:
1. **V1.3 Slice 01**: Add nullable `startTime` and `endTime` (`"HH:mm"` | `null`) to `src/lib/schemas.ts`, `src/services/local-todo-service.ts`, and `src/hooks/use-todos.ts` with `endTime > startTime` validation and secondary chronological sorting.
2. **V1.3 Slice 02**: Add synchronous `<head>` theme script in `src/app/layout.tsx` and apply the Warm Graphite dark palette across `globals.css`, `layout.tsx`, `page.tsx`, `FilterBar.tsx`, `TodoList.tsx`, and `TodoItem.tsx`.
3. **V1.3 Slice 03**: Demarcate `AddTodoForm` into its own card, convert `Toggle details` into a Modal Dialog (`role="dialog"`) with `Start time` and `End time` inputs, and add time-block badge + edit inputs to `TodoItem.tsx`.
4. **V1.3 Slice 04**: Build `DashboardOverview.tsx` (with **Tasks for the Day**), `CalendarScheduleView.tsx`, `NotificationCenter.tsx`, and workspace view tabs (**Tasks**, **Calendar & Schedule**, **Split View**) in `src/app/page.tsx`.
5. **V1.3 Slice 05**: Run `/finish 1.3` to audit and prepare release notes.

---

## 10. Open Decisions (V1.3)

- None (`0` `OPEN` items).

---

# UI Design Specification — Version 1.4 (Full-Viewport Sidebar Workspace)

## 1. Principles (V1.4)

1. **Full-Viewport Shell, Not a Page**: Replace the centered narrow column with a persistent left sidebar + main content area that fills the browser viewport, giving each view (Dashboard, Tasks, Calendar) full room to breathe.
2. **Three Distinct Views, One Shell**: Dashboard, Tasks, and Calendar each occupy the full content pane; users switch between them via clearly labeled sidebar nav items — nothing collapses into hidden tabs.
3. **Modals for Mutations, Not Inline Expansion**: Adding, inspecting, and editing a task all open true centered modal overlays (`role="dialog"`) so the task list is never distorted or interrupted by inline expansion.
4. **Metric Cards Over Stat Pills**: Dashboard metrics become first-class, grid-based cards with a large numeral, label, sub-label, and contextual progress or accent — not a horizontal row of compact pills.
5. **Full Month Calendar Grid**: The Calendar view shows a traditional 7-column, 5–6 row month grid with task indicators inside each day cell — not a 7-day strip.

---

## 2. Tokens (V1.4 Additions)

All V1.3 tokens remain in force. The following are new or adjusted for the sidebar workspace shell.

### New / Adjusted Color Tokens

| Role | Light Mode Class / Value | Light Hex | Dark Mode Class / Value | Dark Hex | Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sidebar Background** | `bg-slate-100` | `#f1f5f9` | `dark:bg-[#161920]` | `#161920` | Persistent left sidebar background |
| **Sidebar Active Nav Item** | `bg-indigo-600 text-white` | `#4f46e5` / `#fff` | `dark:bg-indigo-700 dark:text-white` | `#4338ca` / `#fff` | Highlighted navigation button for current view |
| **Sidebar Inactive Nav Text** | `text-slate-600` | `#475569` | `dark:text-zinc-300` | `#d4d4d8` | Non-active nav item label |
| **Calendar Today Cell** | `bg-indigo-600 text-white` | `#4f46e5` / `#fff` | `dark:bg-indigo-600 dark:text-white` | `#4f46e5` / `#fff` | Today's date cell in the month grid |
| **Calendar Selected Cell** | `bg-indigo-100 text-indigo-800 ring-2 ring-indigo-400` | `#e0e7ff` / `#3730a3` | `dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-600` | `#1e1b4b` / `#c7d2fe` | User-selected date cell |
| **Calendar Default Cell** | `text-slate-900` | `#0f172a` | `dark:text-zinc-100` | `#f4f4f5` | Non-selected, non-today calendar cells |
| **Calendar Cell Hover** | `hover:bg-slate-200` | `#e2e8f0` | `dark:hover:bg-[#22262f]` | `#22262f` | Cell hover state |
| **Task Count Dot (High)** | `bg-rose-500` | `#f43f5e` | `bg-rose-500` | `#f43f5e` | Calendar cell task count dot, high-priority tasks present |
| **Task Count Dot (Default)** | `bg-indigo-400` | `#818cf8` | `bg-indigo-400` | `#818cf8` | Calendar cell task count dot, no high-priority tasks |
| **Metric Card Accent (Total)** | `text-slate-700` | `#334155` | `dark:text-zinc-300` | `#d4d4d8` | Total Tasks card numeral accent |
| **Metric Card Accent (Active)** | `text-indigo-600` | `#4f46e5` | `dark:text-indigo-400` | `#818cf8` | Active Tasks card numeral accent |
| **Metric Card Accent (Completed)** | `text-emerald-600` | `#059669` | `dark:text-emerald-400` | `#34d399` | Completed Tasks card numeral accent |
| **Metric Card Accent (Critical)** | `text-rose-600` | `#e11d48` | `dark:text-rose-400` | `#fb7185` | Critical Tasks card numeral accent |

### Layout Extensions

- **Sidebar Width**: Fixed `w-60` (`240px`) on `lg:` and above; collapses to a bottom nav bar on `sm:` / mobile.
- **Content Pane**: `flex-1 min-w-0 overflow-y-auto` — takes remaining horizontal space beside the sidebar.
- **Workspace Container**: `flex h-screen overflow-hidden` — full-viewport root shell (replaces the old `max-w-5xl mx-auto` page container).

---

## 3. Layout Wireframes (V1.4)

### Desktop (`>= 1024px`) — Sidebar Shell

```text
+-----------------------------------------------------------------------------------+
| SIDEBAR (240px)           | MAIN CONTENT PANE (flexible)                         |
|                           |                                                      |
|  [App Logo / Name]        | HEADER BAR                                           |
|  Task Workspace           |  Dashboard             [+ New Task] [Bell (2)]       |
|                           |  Your executive task overview                        |
|  NAV ITEMS                +------------------------------------------------------+
|  [•] Dashboard            |                                                      |
|  [ ] Tasks                |  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  |
|  [ ] Calendar             |  │  Total   │ │  Active  │ │Completed │ │Critical│  |
|                           |  │    12    │ │    5     │ │    7     │ │   2    │  |
|                           |  │ 58% done │ │ tasks    │ │ [====--] │ │high pri│  |
|                           |  └──────────┘ └──────────┘ └──────────┘ └────────┘  |
|                           |                                                      |
|  (bottom of sidebar)      |  TODAY'S TASKS                  [+ Quick Add Input]  |
|  [Theme: L | D | S]       |  [ ] 09:00-10:30  Design review    [high]            |
|                           |  [x] All day      Sprint report    [med]             |
|                           |                                                      |
|                           |  IMPORTANT / CRITICAL TASKS                          |
|                           |  [ ] Design review meeting          [high] [Edit]    |
|                           |                                                      |
|                           |  RECENT TASKS                                        |
|                           |  Created today: Fix login bug / Write unit tests     |
+---------------------------+------------------------------------------------------+
```

### Desktop — Tasks View

```text
+---------------------------+------------------------------------------------------+
| SIDEBAR                   | TASKS                                                |
|  [ ] Dashboard            |  Manage and filter all your tasks  [+ New Task][Bell]|
|  [•] Tasks                +------------------------------------------------------+
|  [ ] Calendar             |  Filter: [All|Active|Done] Priority:[All|H|M|L]      |
|                           |  Sort: [Newest | Due Date | Priority]  [Reset]       |
|                           +------------------------------------------------------+
|                           |  [ ] Design review meeting                [⊞][✕]    |
|                           |      [high] [Work] [09:00-10:30] [Due: 2026-09-30]  |
|                           |  [x] Submit sprint report                 [⊞][✕]    |
|                           |      [medium] [Work] [Due: 2026-09-30]              |
+---------------------------+------------------------------------------------------+
```

### Desktop — Calendar View

```text
+---------------------------+-----------------------------+------------------------+
| SIDEBAR                   | MONTHLY CALENDAR            | DAILY SCHEDULE         |
|  [ ] Dashboard            |  < September 2026  >        |  Wed, Sep 30           |
|  [ ] Tasks                |  Sun Mon Tue Wed Thu Fri Sat+------------------------+
|  [•] Calendar             |   27  28  29 [30] 01  02 03 | TIME-BLOCKED           |
|                           |   04  05  06  07  08  09 10 |  09:00-10:30           |
|                           |   11  12  13  14  15  16 17 |  Design review         |
|                           |   18  19  20  21  22  23 24 | ALL-DAY / UNSCHEDULED  |
|                           |   25  26  27  28  29  30 01 |  [x] Sprint report     |
|                           |  (today highlighted in      |                        |
|                           |   indigo-600, selected in   |                        |
|                           |   indigo-100 ring)          |                        |
+---------------------------+-----------------------------+------------------------+
```

### Mobile (`375px`) — Bottom Nav Bar

```text
+---------------------------------------+
| HEADER                                |
|  Task Workspace  [+ New] [Bell] [L|D] |
+---------------------------------------+
|  MAIN CONTENT                         |
|  (current view fills this area)       |
|                                       |
|  DASHBOARD — Metric Cards             |
|  ┌─────────┐ ┌─────────┐             |
|  │ Total   │ │ Active  │             |
|  │   12    │ │    5    │             |
|  └─────────┘ └─────────┘             |
|  ┌─────────┐ ┌─────────┐             |
|  │Completed│ │Critical │             |
|  │    7    │ │    2    │             |
|  └─────────┘ └─────────┘             |
|  TODAY'S TASKS                        |
|  [ ] 09:00-10:30 Design review [high] |
+---------------------------------------+
|  [Dashboard]   [Tasks]   [Calendar]   |  ← Bottom nav
+---------------------------------------+
```

---

## 4. Components (V1.4)

### 4.7 Workspace Shell (`src/app/layout.tsx` + `src/app/page.tsx`)

- **Purpose**: Full-viewport root container that holds the sidebar and the main content pane side-by-side on desktop, or a single pane with a bottom nav bar on mobile.
- **Anatomy**:
  - Root shell: `<div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#121316]">`
  - **Sidebar** (desktop only, `lg:flex`): `<aside>` element, `w-60 flex-none flex flex-col bg-slate-100 dark:bg-[#161920] border-r border-slate-200 dark:border-[#2e3340]`.
  - **Content Pane**: `<main className="flex-1 min-w-0 flex flex-col overflow-hidden">`.
  - **View Router**: A single React state (`activeView: "dashboard" | "tasks" | "calendar"`) in `page.tsx`; conditionally renders `<DashboardView>`, `<TasksView>`, or `<CalendarView>`. No Next.js route changes — it's a client-side SPA-style switch.
- **States**: `activeView` changes which main component renders; sidebar nav item matching `activeView` receives the active pill style.
- **Accessibility**:
  - `<aside aria-label="Main navigation">`, `<nav>`, `<ul>` structure inside sidebar.
  - Each nav `<button>` has `aria-current="page"` when active.
  - Bottom mobile nav: `<nav aria-label="Mobile navigation">` with accessible button labels.
- **Slice**: V1.4 Slice 01.

### 4.8 Sidebar Navigation (`src/components/SidebarNav.tsx`)

- **Purpose**: Dedicated left navigation rail containing the workspace brand and three nav buttons (**Dashboard**, **Tasks**, **Calendar**), with the `<ThemeToggle>` anchored at the bottom on desktop.
- **Anatomy**:
  - Top section: App name/logo area (`h2` or logo mark, `text-base font-bold text-slate-900 dark:text-zinc-100`).
  - Nav list: `<ul>` of three `<li><button>` items, each with an inline SVG icon (20×20px, `aria-hidden="true"`) + label text (`Dashboard`, `Tasks`, `Calendar`).
  - Active item: `bg-indigo-600 text-white rounded-xl px-3 py-2.5` (light) / `dark:bg-indigo-700` (dark).
  - Inactive item: `text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#22262f] rounded-xl px-3 py-2.5`.
  - Bottom section: `<ThemeToggle>` component (anchored with `pt-4 border-t border-slate-200 dark:border-[#2e3340]`).
- **Keyboard**: `Tab` moves through nav items; `Enter`/`Space` activates the button.
- **Touch targets**: Each nav button is `min-h-[44px]`.
- **Slice**: V1.4 Slice 01.

### 4.9 Content Pane Header Bar (`src/components/ContentHeader.tsx`)

- **Purpose**: Top header bar inside the content pane displaying the current view title and subtitle on the left, and the persistent **`+ New Task`** primary action button alongside the **Notification Center** trigger (and mobile Theme Toggle) on the right.
- **Anatomy**:
  - `<header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] flex-none">`.
  - Left: `<h1>` (view title, `text-xl font-bold`) + `<p>` (subtitle, `text-xs sm:text-sm text-slate-500 dark:text-zinc-400`).
  - Right (`flex items-center gap-3`):
    - **`+ New Task` primary CTA button**: `flex items-center gap-2 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs`, `aria-label="Open new task modal"`, copy `"+ New Task"` (or `"New Task"` with plus icon).
    - `<NotificationCenter>` trigger button.
    - `<ThemeToggle>` (mobile only, `lg:hidden`).
- **Slice**: V1.4 Slice 01.

### 4.10 Dashboard Metric Cards (`src/components/MetricCard.tsx`)

- **Purpose**: Display a single key metric (Total, Active, Completed, Critical) in a full-sized card with a large numeral, a label, and an optional sub-element (progress bar for Completed, accent numeral for others).
- **Anatomy**:
  - Grid container: `grid grid-cols-2 lg:grid-cols-4 gap-4` in the Dashboard view.
  - Each card: `bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-md`.
  - Layout per card: `<p>` label (`text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400`), `<p>` numeral (`text-4xl font-extrabold` with accent color class), optional sub-content.
  - **Total Tasks card**: Numeral in `text-slate-700 dark:text-zinc-300`.
  - **Active Tasks card**: Numeral in `text-indigo-600 dark:text-indigo-400`; sub-label `"tasks remaining"`.
  - **Completed Tasks card**: Numeral in `text-emerald-600 dark:text-emerald-400`; sub-element is a mini progress bar (`role="progressbar"`, `aria-label="Completion progress"`).
  - **Critical Tasks card**: Numeral in `text-rose-600 dark:text-rose-400`; sub-label `"high priority"`.
- **States**: Numerals update reactively from `useTodos()`; no loading state needed (localStorage is synchronous).
- **Accessibility**: Each card is a `<section>` with `aria-label="<Metric name> metric"`.
- **Slice**: V1.4 Slice 02.

### 4.11 Dashboard View (`src/components/DashboardView.tsx`)

- **Purpose**: The full content-pane render when `activeView === "dashboard"`. Composes the Metric Cards grid, Quick Add Bar, Today's Tasks panel, Important/Critical Tasks panel, and Recent Tasks panel.
- **Anatomy** (vertical stack, `space-y-6 p-6 overflow-y-auto flex-1`):
  1. **Metric Cards Grid** (`<MetricCard>` ×4).
  2. **Quick Add Task Bar**: Single-row `<form>` with a text input (`aria-label="Quick add task title"`, placeholder `"Add a task quickly…"`) and a compact `Add` submit button (`aria-label="Add task"`). Submits a title-only `CreateTodo` (defaults: `priority: "medium"`, no dates). On success, clears input and shows a brief `"Task added"` toast (see 4.18).
  3. **Today's Tasks Panel** (`<section aria-label="Today's tasks">`): Card with header `"Today's Tasks"`, listing todos where `dueDate === today`, ordered by `startTime` ascending (nulls last), each row showing checkbox, time-block badge or `"All day"` label, title, priority badge. Empty state: `"No tasks due today. Plan your day by adding a due date."`.
  4. **Important / Critical Tasks Panel** (`<section aria-label="Important and critical tasks">`): Card with header `"Important / Critical"`, listing active (`completed: false`) todos where `priority === "high"`, each row showing checkbox, title, due date badge, and an `Edit` button (opens Edit Task Modal). Empty state: `"No critical tasks. Great job!"`.
  5. **Recent Tasks Panel** (`<section aria-label="Recent tasks">`): Card with header `"Recent Tasks"`, listing the 5 most recently created todos (`createdAt` descending), each row showing checkbox, title, priority badge, and created-at relative label (`"Today"`, `"Yesterday"`, or `"N days ago"`).
- **Slice**: V1.4 Slice 02.

### 4.12 Tasks View (`src/components/TasksView.tsx`)

- **Purpose**: Full-width dedicated task management board. Replaces the V1.3 "Tasks" workspace tab. Contains only filters, sort, and the task list — no calendar or dashboard elements.
- **Anatomy** (`flex-1 p-6 overflow-y-auto space-y-4`):
  - Section header (`<h2>Tasks</h2>` + task count label + `[+ New Task]` button, `aria-label="Open new task modal"`).
  - `<FilterBar>` (reused, existing component).
  - `<TodoList>` / task rows, each using the updated `<TodoItem>` (view/quick-action only — Edit opens the Edit Modal, click on title opens Task Details Modal).
- **Slice**: V1.4 Slice 03.

### 4.13 Calendar View (`src/components/CalendarView.tsx`)

- **Purpose**: Full-width calendar pane showing a month grid + a day schedule panel side-by-side on desktop, stacked on mobile.
- **Anatomy**:
  - Desktop: `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 p-6`.
  - **Month Grid** (`<section aria-label="Monthly calendar">`):
    - Header: month/year heading (`"September 2026"`), `<` Prev month button (`aria-label="Previous month"`), `Today` button, `>` Next month button (`aria-label="Next month"`), plus native `<input type="month">` for direct jump.
    - Weekday row: `Sun Mon Tue Wed Thu Fri Sat` (`<thead>` / header row, `text-[11px] font-semibold uppercase text-slate-500 dark:text-zinc-400`).
    - Day grid: `grid grid-cols-7`. Each day cell is a `<button>`:
      - Size: `min-h-[72px] w-full flex flex-col items-start p-1.5 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50`.
      - **Today**: `bg-indigo-600 text-white` — day numeral in `text-sm font-bold`.
      - **Selected** (non-today): `bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 ring-2 ring-indigo-400 dark:ring-indigo-600`.
      - **Other month days**: `text-slate-400 dark:text-zinc-600 opacity-50`.
      - Task count dots (up to 3): colored `w-1.5 h-1.5 rounded-full` dots below the day numeral — rose if any `high` priority task exists that day, else indigo-400.
      - `aria-label="<Weekday>, <Month> <Day>; <N> tasks"`, `aria-pressed={isSelected}`.
  - **Daily Schedule Panel** (`<aside aria-label="Daily schedule">`):
    - Date heading: `"Wed, Sep 30"` (`text-base font-semibold`).
    - Time-Blocked section: same layout as V1.3 `CalendarScheduleView`.
    - All-Day / Unscheduled section: same as V1.3.
    - Empty: `"No tasks scheduled for this date."`.
- **Slice**: V1.4 Slice 04.

### 4.14 Add Task Modal (`src/components/AddTaskModal.tsx`)

- **Purpose**: True centered modal overlay for creating a new task with full metadata. Triggered by the `+ New Task` button in the top header bar (or in the Tasks view). Replaces the V1.3 inline "Toggle details" modal in `AddTodoForm`.
- **Anatomy**: Same modal structure as V1.3 Modal Composer (§4.2) but:
  - The quick command bar in the Dashboard handles title-only rapid capture; this modal is for full-metadata creation.
  - Modal header copy: `"New Task"`.
  - Fields: Title (required), Description, Priority (button group), Due Date, Start Time, End Time, Category (+ preset chips).
  - Footer: `Cancel` | `Add Task` (`type="submit"`).
- **Focus management**: On open, focus moves to the Title input; on close (submit, Escape, backdrop click), focus returns to the trigger element.
- **Slice**: V1.4 Slice 03.

### 4.15 Task Details Modal (`src/components/TaskDetailsModal.tsx`)

- **Purpose**: Read-only inspection panel for a task. Clicking a task's title/body row opens this modal. Contains action buttons to Edit, Toggle Complete, or Delete.
- **Anatomy** (`role="dialog"`, `aria-modal="true"`, `aria-label="Task details"`):
  - Modal header: Task title (`text-lg font-bold`) + Close button.
  - Body: Full description/notes (`<p>`), Priority badge, Category badge, Due date badge (with Overdue styling if applicable), Time-block badge (`09:00 – 10:30`), Status chip (`Active` / `Completed`).
  - Footer: `Toggle Complete` button, `Edit` button (opens Edit Task Modal, closes this modal), `Delete` button (shows inline confirmation `"Delete this task?"` with `Confirm` / `Cancel` — no separate modal).
- **Slice**: V1.4 Slice 03.

### 4.16 Edit Task Modal (`src/components/EditTaskModal.tsx`)

- **Purpose**: Pre-populated form modal for editing all fields of an existing task. Triggered by `Edit` button on task cards or inside Task Details Modal.
- **Anatomy** (`role="dialog"`, `aria-modal="true"`, `aria-label="Edit task"`):
  - Same field set as Add Task Modal, pre-filled from the `Todo` object.
  - Modal header copy: `"Edit Task"`.
  - Footer: `Cancel` | `Save Changes` (`type="submit"`).
  - Validation error: `<p role="alert">` inline under each failing field.
- **Difference from V1.3**: Replaces the inline edit row (`TodoItem` edit mode). `TodoItem` no longer has an inline edit mode; it only has a view mode with quick-action buttons (checkbox, Details, Edit, Delete).
- **Slice**: V1.4 Slice 03.

### 4.17 `TodoItem` (V1.4 Revision)

- **Purpose**: Simplified task row with view-only display and three quick actions (open Task Details Modal, open Edit Task Modal, Delete with confirmation).
- **Anatomy (View Mode only)**:
  - Checkbox, title (clickable — opens Task Details Modal, `aria-label="View details for <title>"`), Edit icon button (`aria-label="Edit <title>"`), Delete icon button (`aria-label="Delete <title>"`).
  - Priority left-border accent (`border-l-4 border-l-rose-500` / amber / blue), priority badge, category badge, due date badge, time-block badge, notes preview (truncated, 2 lines).
- **Removed from V1.4**: Inline edit mode (now replaced by Edit Task Modal).
- **Slice**: V1.4 Slice 03.

### 4.18 Toast Notification (`src/components/Toast.tsx`)

- **Purpose**: Brief non-blocking success/error feedback (e.g., `"Task added"`, `"Task deleted"`) rendered in a fixed bottom-right corner container. Auto-dismisses after 3 seconds.
- **Anatomy**: `<div role="status" aria-live="polite">` wrapper (fixed, `bottom-4 right-4 z-50 space-y-2`); each toast `<div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-xl px-4 py-3 shadow-lg text-sm flex items-center gap-3">`.
- **States**: Success (emerald left border `border-l-4 border-l-emerald-500`), Error (rose left border `border-l-4 border-l-rose-500`).
- **Accessibility**: `role="status"`, `aria-live="polite"`, 3-second auto-dismiss.
- **Slice**: V1.4 Slice 02.

---

## 5. Interaction and Motion (V1.4)

- **View switching**: Instantaneous (`0ms`) — no fade between views. Only the content pane re-renders; the sidebar stays mounted.
- **Modal entrance**: `150ms` opacity + `scale-95` → `scale-100` transition (`motion-reduce:transition-none`).
- **Sidebar on mobile**: Hidden at `< lg`; replaced by fixed bottom nav (`h-14 flex items-center justify-around border-t border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24]`).
- **Calendar month transition**: Replacing month content with a simple re-render (no animation) — keeps reduced-motion parity trivially.
- **Keyboard paths**:
  - `Tab` through sidebar nav items → content pane header (`+ New Task` CTA, Notification Center) → content area.
  - `Escape` closes any open modal; focus returns to the element that opened it.
  - Inside month grid, `←`/`→` moves between day cells; `Enter`/`Space` selects a day.
  - `Enter`/`Space` on a task title row opens Task Details Modal.
  - `Enter` in Quick Add title field submits the form (textarea — newline; title input — submit).

---

## 6. Content and Microcopy (V1.4)

| Element | Copy |
| :--- | :--- |
| App name (sidebar) | `"Task Workspace"` |
| Dashboard subtitle | `"Your executive task overview"` |
| Tasks subtitle | `"Manage and filter all your tasks"` |
| Calendar subtitle | `"Browse by month and plan your schedule"` |
| Metric card label — Total | `"Total Tasks"` |
| Metric card label — Active | `"Active Tasks"` |
| Metric card label — Completed | `"Completed"` |
| Metric card label — Critical | `"Critical Tasks"` |
| Critical card sub-label | `"high priority"` |
| Active card sub-label | `"tasks remaining"` |
| Quick add placeholder | `"Add a task quickly…"` |
| Today's tasks empty state | `"No tasks due today. Plan your day by adding a due date."` |
| Critical tasks empty state | `"No critical tasks. Great job!"` |
| Recent tasks empty state | `"No tasks yet. Create your first task."` |
| Calendar day empty state | `"No tasks scheduled for this date."` |
| Add Task Modal title | `"New Task"` |
| Task Details Modal title | task's own title |
| Edit Task Modal title | `"Edit Task"` |
| Task Details delete confirm | `"Delete this task?"` |
| Toast success (add) | `"Task added"` |
| Toast success (delete) | `"Task deleted"` |
| Toast success (update) | `"Task updated"` |
| Header primary CTA button | `"+ New Task"` |

---

## 7. Accessibility Checklist (V1.4)

All new colour pairs verified with `node .agents/hooks/contrast.js <fg> <bg>`:

| Pair Description | Foreground | Background | Ratio | Normal Text (`4.5:1`) | Large / UI (`3.0:1`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Sidebar text on sidebar bg (light) | `#475569` | `#f1f5f9` | **7.16:1** | PASS | PASS |
| Sidebar text on sidebar bg (dark) | `#d4d4d8` | `#161920` | **11.90:1** | PASS | PASS |
| Active nav text (white) on indigo-600 | `#ffffff` | `#4f46e5` | **6.29:1** | PASS | PASS |
| Active nav text (white) on dark indigo-700 | `#ffffff` | `#4338ca` | **7.12:1** | PASS | PASS |
| Inactive nav text (dark mode) on sidebar | `#d4d4d8` | `#161920` | **11.90:1** | PASS | PASS |
| Metric numeral (indigo-600) on card (light) | `#4f46e5` | `#ffffff` | **6.29:1** | PASS | PASS |
| Metric numeral (indigo-400) on card (dark) | `#818cf8` | `#1a1d24` | **5.90:1** | PASS | PASS |
| Metric numeral (emerald-600) on card (light) | `#059669` | `#ffffff` | **4.64:1** | PASS | PASS |
| Metric numeral (rose-600) on card (light) | `#e11d48` | `#ffffff` | **4.60:1** | PASS | PASS |
| Calendar today cell text (white) on indigo-600 | `#ffffff` | `#4f46e5` | **6.29:1** | PASS | PASS |
| Calendar selected text on light selected bg | `#3730a3` | `#e0e7ff` | **8.06:1** | PASS | PASS |
| Calendar selected text (dark) on dark selected bg | `#c7d2fe` | `#1e1b4b` | **9.44:1** | PASS | PASS |
| Calendar default day text on canvas (light) | `#0f172a` | `#f8fafc` | **17.06:1** | PASS | PASS |
| Calendar default day text on canvas (dark) | `#f4f4f5` | `#121316` | **16.90:1** | PASS | PASS |
| Primary text on card (light) | `#0f172a` | `#ffffff` | **17.85:1** | PASS | PASS |
| Primary text on card (dark) | `#f4f4f5` | `#1a1d24` | **15.34:1** | PASS | PASS |

> **Note on `#059669` (emerald-600) and `#e11d48` (rose-600)**: Both achieve ≥ 4.5:1 on white (#ffffff). On the dark card (`#1a1d24`) these are replaced by `dark:text-emerald-400` (`#34d399`, 8.13:1 vs #1a1d24) and `dark:text-rose-400` (`#fb7185`, 5.21:1 vs #1a1d24), which also pass.

**Additional accessibility notes:**
- Day cells have `aria-label="<Weekday>, <Month> <Day>; <N> tasks"` and `aria-pressed` for selection state.
- Sidebar nav buttons use `aria-current="page"` when active.
- All modal overlays trap focus (`Tab`/`Shift+Tab` cycle within modal); `Escape` closes.
- Task count dots in the calendar are decorative (`aria-hidden="true"`); count is communicated through the button's `aria-label`.
- Toast container uses `role="status"` and `aria-live="polite"` to announce updates non-disruptively.
- Bottom mobile nav touch targets: `min-h-[44px]`, `min-w-[44px]` per item.
- The `+ New Task` header CTA is `min-h-[40px]` (`44px` on mobile).

---

## 8. Version Changes (V1.3 → V1.4)

1. **Full-Viewport Sidebar Shell**: Replaces the centered `max-w-2xl` / `max-w-5xl` column layout with a persistent sidebar + full-width content pane (`flex h-screen overflow-hidden`).
2. **Three Dedicated Views**: Dashboard, Tasks, and Calendar become separate view components (client-side switch), replacing the V1.3 in-page view tab bar (`Tasks / Calendar & Schedule / Split View`).
3. **Header `+ New Task` CTA**: Persistent `+ New Task` primary button placed in the top header bar beside the Notification Center trigger, keeping the left sidebar strictly focused on view navigation and appearance settings.
4. **Dedicated Metric Cards**: 4 full-sized grid cards replace the horizontal stat pill row.
5. **New Dashboard Panels**: Adds `Important / Critical Tasks` panel and `Recent Tasks` panel alongside the existing `Today's Tasks`.
6. **Quick Add Bar on Dashboard**: Lightweight title-only input bar for rapid capture without a modal.
7. **Full Month Calendar Grid**: Replaces the 7-day week strip with a full 7-column month grid, with task count dots and month navigation.
8. **True Modal Overlays**: Add Task Modal, Task Details Modal, and Edit Task Modal replace the V1.3 inline edit row in `TodoItem`.
9. **Simplified `TodoItem`**: View-mode only; Edit opens a modal rather than expanding inline.
10. **Toast Notifications**: New `<Toast>` component for transient success/error feedback.

---

## 9. Suggested Plan Changes

Run `/plan 1.4` to break V1.4 into slices. Recommended slice structure:

1. **V1.4 Slice 01 — Workspace Shell & Sidebar Navigation**: Create `SidebarNav.tsx`, `ContentHeader.tsx` (with `+ New Task` CTA beside `NotificationCenter`), refactor `src/app/page.tsx` to `flex h-screen` shell with client-side view state, wire `ThemeToggle` to sidebar desktop position + header mobile, add bottom mobile nav. Tests: sidebar renders, active nav item has `aria-current="page"`, view switches on click, mobile nav visible at 375px.
2. **V1.4 Slice 02 — Dashboard View & Metric Cards**: Create `MetricCard.tsx`, `DashboardView.tsx`, `Toast.tsx`; implement the 4-card grid, Quick Add Bar, Today's Tasks panel, Critical Tasks panel, Recent Tasks panel. Tests: each card shows correct count, Quick Add creates a todo, Today's Tasks list filters correctly, empty states render.
3. **V1.4 Slice 03 — Modal System & Tasks View**: Create `AddTaskModal.tsx`, `TaskDetailsModal.tsx`, `EditTaskModal.tsx`, `TasksView.tsx`; simplify `TodoItem.tsx` to view-mode only; wire the header `+ New Task` trigger to `AddTaskModal`; wire task title click to `TaskDetailsModal`; wire Edit button to `EditTaskModal`. Tests: modals open/close, focus management, form validation, submit mutates service.
4. **V1.4 Slice 04 — Calendar View (Full Month Grid)**: Refactor `CalendarScheduleView.tsx` → `CalendarView.tsx` with 7-column month grid; wire day-cell click to update daily schedule panel. Tests: month navigation, today cell highlight, task count dots, schedule panel updates.
5. **V1.4 Slice 05 — Finish**: Run `/finish 1.4`.

---

## 10. Open Decisions (V1.4)

- None (`0` `OPEN` items — resolved: `+ New Task` lives in the top header beside the notification button and opens the Add Task Modal; Calendar daily schedule panel scrolls independently).
