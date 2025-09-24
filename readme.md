# Task Manager

Minimal, responsive task manager app built with **vanilla HTML, CSS, JavaScript** for the frontend and a small **PHP + MySQL (PDO)** backend for persistence. Designed as a clean starter project that can be incrementally extended.

---

## Recent Updates (as of September 2025)

**Project Progress:**
- Directory structure and all key files created
- Environment and database validated
- Database schema updated: `due_date` (DATE), `due_time` (TIME), `tags` (TEXT), `recurring`, `completed` (ENUM)
- Frontend UI: responsive, mobile-first, table layout, icon buttons, Flatpickr for date/time, SweetAlert2 for dialogs
- Backend API: moved to `public/api.php` to avoid routing conflicts
- Frontend JS: updated to use `/api.php` endpoint
- Bug fixes: tasks no longer default to completed, time formatting fixed for MySQL compatibility
- All CRUD operations (add, fetch) work and persist data

**Key Fixes:**
- Removed `index.php` from `public/` so `index.html` is served as default UI
- Time input now converted to 24-hour format (`HH:mm:ss`) before sending to backend
- API endpoint routing updated to avoid UI/API conflicts
- Frontend and backend field names matched for reliable data flow

**Next Steps:**
- Implement advanced backend features (update, delete)
- Add tags/recurring support in frontend UI
- Continue feature development and UX improvements

**Major Changes** (September 2025)
Soft Delete:

The completed column in the SQL schema now supports a third value: 'Deleted'.
Deleting a task from the UI sets its status to 'Deleted' in the database, rather than removing the row.
The backend only fetches tasks where completed != 'Deleted'.
Update/Edit Logic:

Editing a task now updates the existing row in the database (PATCH), rather than creating a new one.
The UI form switches to "Update Task" mode when editing, and resets after saving.
Due Date & Due Time Columns:

The UI now displays Due Date and Due Time as separate columns, matching the SQL schema.
Status Display Bug Fix:

The UI now correctly displays the status as "Pending" or "Completed" based on the actual value from the database.
Other Improvements:

PATCH endpoint added to the backend for updating tasks.
All status changes (complete/undo) now update the correct row, not create duplicates.
---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Directory Structure](#directory-structure)
5. [Database Schema (SQL)](#database-schema-sql)
6. [Backend (PHP + PDO)](#backend-php--pdo)

   * [Configuration](#configuration)
   * [PDO connection example](#pdo-connection-example)
   * [API Endpoints](#api-endpoints)
   * [Sample controller code](#sample-controller-code)
7. [Frontend (Vanilla JS)](#frontend-vanilla-js)

   * [How frontend talks to backend](#how-frontend-talks-to-backend)
   * [LocalStorage fallback behavior](#localstorage-fallback-behavior)
   * [JS snippets with inline comments](#js-snippets-with-inline-comments)
8. [Docker (optional)](#docker-optional)
9. [Security Considerations](#security-considerations)
10. [Testing & Development Tips](#testing--development-tips)
11. [Roadmap / Phases](#roadmap--phases)
12. [License](#license)

---

## Project Overview

This repository provides a small but practical Task Manager app. The goal is a frictionless, dependency-free developer experience with a production-capable backend (PHP + PDO + MySQL). The frontend is minimal, responsive, and written with no frameworks so it’s easy to inspect and extend.

Use cases: personal to-do lists, small team task demos, learning project for full-stack beginners.

---

## Features

**MVP (implemented):**

* Add task with title and description
* Select priority (High / Medium / Low)
* Display tasks grouped / color-coded by priority
* Mark tasks as completed (move to Completed or strike-through)
* Delete tasks
* Persist tasks in MySQL via backend API
* Responsive, minimal UI (no frameworks)
* JavaScript contains inline comments explaining each part

**Quality-of-life / added features (also included in spec):**

* Due date and optional reminders (stored in DB)
* Search and filter (keyword, priority, status)
* Edit task
* Dark mode toggle
* Tags / categories
* Drag-and-drop ordering (spec provided)
* Auto-save while typing
* Visual progress tracker (completed / total)

**Stretch / future features:**

* Recurring tasks (daily/weekly/monthly)
* Export / import (JSON or CSV)
* Tiny AI suggestion for priority (local keyword heuristics)
* Multi-user accounts (auth) and sync

---

## Tech Stack

* Frontend: HTML5, CSS3 (mobile-first), Vanilla JavaScript (ES6+)
* Backend: PHP (7.4+ recommended) using PDO for MySQL
* Database: MySQL 5.7+ / 8.0+
* Optional: Docker (MySQL + PHP/Apache) for quick local dev

---

## Directory Structure

A carefully organized layout so a team of humans can stop screwing around and actually build.

```
task-manager/
├── README.md
├── docker-compose.yml                # optional dev environment
├── .env.example                      # example env vars
├── sql/
│   └── schema.sql                    # DB schema and seed data
├── public/                           # static frontend served to browser
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       ├── css/
│       │   └── styles.css
│       ├── js/
│       │   ├── app.js                # main application JS (inline comments)
│       │   └── utils.js              # helper functions
│       └── images/
├── server/                           # backend code (PHP)
│   ├── public/
│   │   └── index.php                 # front controller / router for API
│   ├── src/
│   │   ├── Config/
│   │   │   └── config.php            # DB config loader
│   │   ├── Controllers/
│   │   │   └── TaskController.php
│   │   ├── Models/
│   │   │   └── Task.php              # simple model wrapper (optional)
│   │   └── Utils/
│   │       └── Response.php
│   └── scripts/
│       └── seed_db.php
├── tests/
│   ├── php/                          # PHP unit tests (optional)
│   └── js/                           # JS unit / integration tests
└── docs/
    └── api.md                        # developer-facing API documentation
```

---

## Database Schema (SQL)

`sql/schema.sql` (safe for MySQL 5.7+; updated for current app):

```sql
CREATE DATABASE IF NOT EXISTS `task_manager` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `task_manager`;

CREATE TABLE `tasks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `priority` ENUM('High','Medium','Low') NOT NULL DEFAULT 'Low',
  `due_date` DATE DEFAULT NULL,
  `due_time` TIME DEFAULT NULL,
  `tags` TEXT DEFAULT NULL,
  `recurring` VARCHAR(50) DEFAULT NULL,
  `completed` ENUM('Pending','Completed') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`priority`),
  INDEX (`completed`),
  INDEX (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Notes:

* `due_time` must be in 24-hour format (`HH:mm:ss`). Frontend now converts time input automatically.
* `tags` is stored as TEXT (JSON string if needed).
* `completed` is ENUM for clear status.

---

## Backend (PHP + PDO)

### Configuration

Create `server/.env` or adapt `server/src/Config/config.php` with your DB credentials. Example `.env.example`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=task_manager
DB_USER=root
DB_PASS=secret
APP_ENV=local
APP_DEBUG=true
```

`server/src/Config/config.php` (simple loader):

```php
<?php
return [
  'db' => [
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'port' => getenv('DB_PORT') ?: 3306,
    'name' => getenv('DB_NAME') ?: 'task_manager',
    'user' => getenv('DB_USER') ?: 'root',
    'pass' => getenv('DB_PASS') ?: '',
    'charset' => 'utf8mb4'
  ]
];
```

### PDO connection example

`server/src/Config/database.php`:

```php
<?php
// returns a configured PDO instance
function getPDO(): PDO {
    $cfg = require __DIR__ . '/config.php';
    $db = $cfg['db'];
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $db['host'], $db['port'], $db['name'], $db['charset']
    );
    $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
```

This sets `ERRMODE_EXCEPTION` so errors throw PHP exceptions and `EMULATE_PREPARES` to false to use native prepared statements.


### API Endpoints (HTTP)

All endpoints now live under `/api.php` (to avoid routing conflicts with UI). Responses are JSON.

| Method | Endpoint      | Description                                 |
| ------ | ------------- | ------------------------------------------- |
| GET    | /api.php      | List all tasks                              |
| POST   | /api.php      | Create a new task (JSON body)               |
| (future) | /api.php    | Update, delete, and other actions           |

Sample curl (create):

```bash
curl -X POST http://localhost:8000/api.php \
  -H 'Content-Type: application/json' \
  -d '{"title":"Buy milk","description":"2 liters","priority":"High","due_date":"2025-09-24","due_time":"14:00:00"}'
```

Typical JSON response:

```json
{
  "success": true,
  "data": {
    "id": 12
  }
}
```

### Sample controller code (TaskController.php)

This is an illustrative but copy-paste-ready example showing prepared statements, and clear comments.

```php
<?php
// server/src/Controllers/TaskController.php
require_once __DIR__ . '/../Config/database.php';

class TaskController {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = getPDO(); // get the PDO instance from config
    }

    // List tasks with optional filters
    public function index(array $query) {
        // base SQL
        $sql = 'SELECT * FROM tasks WHERE 1=1';
        $params = [];

        if (!empty($query['status'])) {
            // translate status query param to completed flag
            $sql .= ' AND completed = :completed';
            $params[':completed'] = ($query['status'] === 'completed') ? 1 : 0;
        }

        if (!empty($query['priority'])) {
            $sql .= ' AND priority = :priority';
            $params[':priority'] = $query['priority'];
        }

        if (!empty($query['search'])) {
            $sql .= ' AND (title LIKE :q OR description LIKE :q)';
            $params[':q'] = '%' . $query['search'] . '%';
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $tasks = $stmt->fetchAll();

        echo json_encode(['success' => true, 'data' => $tasks]);
    }

    // Create a new task
    public function create(array $payload) {
        $sql = 'INSERT INTO tasks (title, description, priority, due_date, tags) VALUES (:title, :description, :priority, :due_date, :tags)';
        $stmt = $this->pdo->prepare($sql);

        // Bind values safely with prepared statements to avoid SQL injection
        $stmt->execute([
            ':title' => $payload['title'] ?? '',
            ':description' => $payload['description'] ?? null,
            ':priority' => $payload['priority'] ?? 'Low',
            ':due_date' => $payload['due_date'] ?? null,
            ':tags' => !empty($payload['tags']) ? json_encode($payload['tags']) : null,
        ]);

        $id = $this->pdo->lastInsertId();
        echo json_encode(['success' => true, 'data' => ['id' => (int)$id]]);
    }

    // Update, delete and toggle methods would follow the same prepared statement patterns
}
```

---

## Frontend (Vanilla JS)

### How frontend talks to backend

* The frontend sends/receives JSON via `fetch()` to the backend API endpoints listed above.
* If the backend is unreachable (e.g., offline testing), the frontend falls back to `localStorage` so the UI remains usable.

### LocalStorage fallback behavior

* On load the app tries to `GET /api/tasks`.

  * If successful (HTTP 200 + JSON), it uses server data and updates localStorage cache.
  * If the request fails or times out, it loads tasks from localStorage and marks the app as "offline" in the UI.
* On create/update/delete while offline, changes are persisted to localStorage and queued in `pendingActions` to be synced later when connectivity is restored.

### JS snippets with inline comments

`public/assets/js/app.js` contains thorough inline comments explaining everything. Small extract below:

```js
// app.js (extract)

// Local cache key
const STORAGE_KEY = 'tm_tasks_v1';

// Utility: save tasks to localStorage
function saveToLocal(tasks) {
  // JSON stringify and store so it persists across reloads
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Utility: read tasks from localStorage
function loadFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local tasks', e);
    return [];
  }
}

// Fetch tasks from server; if it fails, fallback to localStorage
async function fetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const payload = await res.json();
    // on success, update local cache
    saveToLocal(payload.data);
    return payload.data;
  } catch (err) {
    console.warn('Server fetch failed, falling back to local storage', err);
    return loadFromLocal();
  }
}

// Create a task: try server, if offline write to local and queue
async function createTask(task) {
  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Server create failed');
    const json = await res.json();
    return json.data; // expect server to return new id
  } catch (err) {
    // offline: save locally with a temporary id
    const tasks = loadFromLocal();
    const tempId = 'local-' + Date.now();
    tasks.push({ ...task, id: tempId });
    saveToLocal(tasks);
    // push to pending sync queue (not shown)
    return { id: tempId };
  }
}
```

The full `app.js` file includes inline comments for rendering, priority color-coding, editing, deleting, searching, and toggling completion.

---

## Docker (optional quick dev)

`docker-compose.yml` snippet for local dev:

```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: task_manager
    ports:
      - '3306:3306'
    volumes:
      - db_data:/var/lib/mysql
  php:
    image: php:8.1-apache
    volumes:
      - ./server:/var/www/html
      - ./public:/var/www/html/public
    ports:
      - '8080:80'
    depends_on:
      - db
volumes:
  db_data:
```

Start with:

```bash
docker-compose up -d
# then import schema using mysql client or execute seed script
```

---

## Security Considerations

* Use prepared statements (we do) to avoid SQL injection.
* Validate and sanitize all incoming data on the server.
* Implement proper CORS headers and enable only the origins you trust.
* Rate-limit write endpoints if you expose the API publicly.
* For multi-user deployments, add authentication (JWT or session cookies) and ensure users can only access their own tasks.
* If using tags JSON column, validate JSON and size limits.

---

## Testing & Development Tips

* Frontend: use browser DevTools and Lighthouse for performance.
* Backend: write unit tests for controllers using PHPUnit (examples in `tests/php`).
* Integration: test the API with Postman or curl.
* Lint JS with ESLint if you like strictness; project intentionally ships without heavy tooling to stay lightweight.

---

## Roadmap / Phases

**Phase 1 (MVP):**

* Add, list, complete, delete tasks
* Priority color-coding
* Persist to MySQL via PHP/PDO
* LocalStorage fallback

**Phase 2 (QoL):**

* Edit tasks, search/filter, due dates, progress tracker, dark mode
* Drag-and-drop ordering
* CSV export/import

**Phase 3 (optional):**

* Recurring tasks, notifications (browser push)
* Multi-device sync + user accounts
* Small "AI" priority suggestion (keyword heuristics)

---

## Deployment Notes

* Serve `public/` via Nginx or Apache. The server `public/index.php` should act as the API router.
* Ensure `server/src/Config/config.php` reads environment variables; never commit passwords to the repo.
* For production, use HTTPS and consider managed DB.

---

## Helpful Scripts

* `server/scripts/seed_db.php` - inserts some example tasks for development
* `sql/schema.sql` - DB schema

---

## License

MIT. Do what you want but don’t be terrible.

---

## Appendix: Quick start (short)

1. Import `sql/schema.sql` into MySQL
2. Configure server `.env` or `server/src/Config/config.php`
3. Start PHP server: `php -S 0.0.0.0:8000 -t server/public`
4. Open `public/index.html` in the browser (or serve it via the same PHP server)

\-- End of README
