# TaskMaster — Offline-First Task Manager

TaskMaster is a browser-based, offline-first task management board built with vanilla JavaScript (ES modules). It combines a Kanban board and a list view, backed by IndexedDB for local persistence and a simulated sync layer that queues changes while offline and replays them once the connection returns.

This project was built as an **Advanced JavaScript** practice task, focused on core language and browser-API concepts: modules, closures, the Pub/Sub pattern, IndexedDB, Web Workers, drag-and-drop, and state management — all without any external framework.

---

## Features

- **Kanban board** — Backlog, In Progress, Review, and Done columns with native HTML5 drag-and-drop to move tasks between statuses.
- **List view** — A sortable/filterable table view of the same task data, toggled from the sidebar.
- **Task CRUD** — Create, edit, and delete tasks through a modal dialog (title, description, priority, assignee, due date, status, labels).
- **Search & filters** — Full-text search plus multi-select filters for status, priority, assignee, and due-date state (overdue / due today / upcoming / completed).
- **Sorting** — Sort the task list by due date, priority, creation date, or title.
- **Dashboard stats** — Live counts for open, due-today, overdue, and completed tasks, plus a stats panel showing status breakdown, completion %, and average time-to-finish.
- **Offline-first sync** — An IndexedDB-backed offline queue tracks changes made while offline and replays them once the app detects it's back online; a sidebar panel shows pending offline actions and current sync status.
- **Undo / Redo** — Up to 20 steps of history for task changes.
- **Theme toggle** — Light/dark theme, persisted across sessions.
- **Toast notifications** — A custom, dependency-free toast system built on the internal event bus.
- **Hash-based routing** — Lightweight client-side router that switches between Dashboard, Board, List, and Stats views via the URL hash.
- **Background analytics** — Expensive stats calculations (overdue counts, completion %, average completion time) run in a Web Worker so the UI thread stays responsive.
- **Performance test data generator** — A utility that bulk-generates 1,000 sample tasks to stress-test rendering and worker performance.
- **Lightweight custom test suite** — A small hand-rolled assertion framework (no external test runner) that sanity-checks the store and API client.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties / design tokens, no framework) |
| Logic | Vanilla JavaScript (ES2020+ modules, no build step) |
| Persistence | IndexedDB (native browser API) |
| Concurrency | Web Workers |
| Data | Static JSON fixtures (`data/*.json`) |
| Testing | Custom lightweight assertion suite |

No `package.json`, bundler, or framework is required — the app runs directly as static files with native ES module imports.

---

## Project Structure

```
Task-Manager-Project/
├── index.html                          # App shell: layout, dialogs, templates
├── assets/
│   └── css/
│       ├── tokens.css                  # Design tokens (colors, spacing, etc.)
│       ├── app.css                     # Layout / page-level styles
│       └── components.css             # Component-level styles
├── data/
│   ├── users.json                      # Sample assignee/user records
│   ├── tasks.json                      # Sample task data
│   └── tasks2.json                     # Additional sample task data
├── js/
│   ├── app1.js                         # Main entry point (wires up all modules)
│   ├── app.js / step1.js               # Earlier iterations / in-progress versions
│   ├── core/
│   │   ├── store.js                    # Centralized state (subscribe/setState pattern)
│   │   ├── event-bus.js                # Pub/Sub event system
│   │   └── router.js                   # Hash-based view routing
│   ├── services/
│   │   ├── api-client.js               # Simulated REST client (latency + random failures)
│   │   ├── db.js                       # IndexedDB read/write helpers for tasks
│   │   └── sync-service.js             # Offline queue + online/offline sync logic
│   ├── features/
│   │   ├── board/
│   │   │   ├── drag-drop.js            # Kanban drag-and-drop handling
│   │   │   └── render-list.js          # Table/list view rendering
│   │   ├── filters/
│   │   │   └── filter-bar.js           # Search, filters, and sort controls
│   │   ├── history/
│   │   │   └── undo-redo.js            # Undo/redo stack (max 20 steps)
│   │   ├── tasks/
│   │   │   ├── task-form.js            # Create/edit task dialog logic
│   │   │   └── task-action.js          # Edit/delete actions on cards & rows
│   │   └── ui/
│   │       ├── theme.js                # Light/dark theme toggle
│   │       ├── toast.js                # Toast notification system
│   │       └── view-toggle.js          # Kanban <-> List view switch
│   ├── utils/
│   │   └── generator.js                # Bulk test-data generator (perf testing)
│   └── workers/
│       └── analytics.worker.js         # Background stats calculations
├── tests/
│   └── app.test.js                     # Custom lightweight test suite
├── Advanced_JavaScript_Practice_Task.docx  # Original assignment/requirements doc
└── README.md
```

---

## Architecture Overview

The app follows a lightweight, framework-free modular architecture:

- **`core/store.js`** holds all application state (tasks, filters, sort, view mode, theme) in a single object. Components read a cloned snapshot via `getState()` and push updates via `setState()`, which notifies all subscribers.
- **`core/event-bus.js`** is a simple Pub/Sub system used for cross-cutting concerns like toast notifications, decoupling UI events from the modules that trigger them.
- **`core/router.js`** listens to `hashchange` and toggles which panels (Board vs. Stats vs. both) are visible, without a full page reload.
- **`services/`** contains everything that talks to "the outside world": a simulated API client (`api-client.js`, which randomly injects latency and failures to mimic real network conditions), IndexedDB persistence (`db.js`), and the offline sync queue (`sync-service.js`).
- **`features/`** contains self-contained UI modules (board, filters, history, tasks, ui) that each expose an `init*()` function called once from `app1.js` on startup.
- **`workers/analytics.worker.js`** offloads the O(n) stats calculation (overdue count, completion %, average completion time) to a separate thread so large task lists don't block the UI.

`index.html` loads `js/app1.js` as an ES module, which imports and initializes every feature module in sequence.

> Note: `js/app.js` and `js/step1.js` appear to be earlier, monolithic iterations of the app kept in the repo for reference — `app1.js` is the current entry point used by `index.html`.

---

## Getting Started

Because the app uses native ES modules (`type="module"`) and `fetch()` to load local JSON files, it must be served over HTTP — opening `index.html` directly via `file://` will not work in most browsers.

1. **Clone the repository**
   ```bash
   git clone https://github.com/MuhammadAqibAli53/Task-Manager-Project.git
   cd Task-Manager-Project
   ```

2. **Serve it locally** (any static server works), for example:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```

3. **Open in your browser**
   ```
   http://localhost:8080
   ```

No build step, install, or dependencies are required.

---

## Running Tests

`tests/app.test.js` is a small hand-written assertion suite (no Jest/Mocha) that runs in-browser and logs results to the console. It's imported directly by `app1.js`, so simply loading the app and opening the browser console will show PASS/FAIL output for the store and API client checks.

---

## Known Notes / Limitations

- The API client simulates network calls with random latency and a small chance of failure — this is intentional, to exercise error-handling and retry paths, not a bug.
- `js/app.js` and `js/step1.js` are legacy/in-progress files not wired into `index.html`; the active code path is `js/app1.js` and everything it imports.
- Data (`tasks.json`, `tasks2.json`, `users.json`) is static and local — there is no real backend.

---

## Author

Built by [Muhammad Aqib Ali](https://github.com/MuhammadAqibAli53) as an Advanced JavaScript practice project.