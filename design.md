Design V1: APPROVED by human on 2026-09-29
Design V1.1: APPROVED by human on 2026-09-29
Design V1.2: APPROVED by human on 2026-09-29
Design V1.3: APPROVED by human on 2026-09-30

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

## 10. Open Decisions

- None (`0` `OPEN` items).
