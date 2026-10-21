# SpendWise — Smart Expense & Budget Tracker

A full-stack expense tracker built with **React + Vite + Tailwind CSS** (frontend), **Node.js + Express** (backend) and **MySQL** (database). Amounts are shown in Indian Rupees (₹).

## Features

- **Dashboard** – month spending, monthly budget, remaining budget, budget usage %, recent transactions, category chart, 6-month comparison chart, budget alerts
- **Expenses** – add, view, edit, delete (with confirmation), search, filter by category and date range, input validation
- **Budgets** – a total monthly budget plus a budget per category (Food, Travel, Shopping, Education, Bills, Health, Others); spent/remaining per category; warning at 80%; over-budget alert
- **Analytics** – category breakdown (donut chart + table) and monthly trend (bar chart) with date-range and category filters
- **Recurring expenses** – weekly or monthly, generated automatically without duplicates
- Responsive layout (sidebar on desktop, menu on mobile), loading states, empty states, success/error messages

---

## 1. Prerequisites

Install these first (skip any you already have):

| Tool | Download |
|------|----------|
| Node.js 18 or newer (LTS) | https://nodejs.org |
| MySQL Community Server 8.x | https://dev.mysql.com/downloads/mysql/ |
| VS Code | https://code.visualstudio.com |

Check they are installed. Open **PowerShell** (Start menu → type "PowerShell") and run:

```powershell
node --version
npm --version
mysql --version
```

Each command should print a version number. If `mysql` says "not recognized", MySQL is installed but not on your PATH. Either use the **MySQL 8.x Command Line Client** from the Start menu (it works the same way), or add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to your PATH and reopen PowerShell.

## 2. Extract the ZIP and open in VS Code

1. Right-click `SpendWise.zip` → **Extract All…** and pick a folder, for example `C:\Projects`.
2. Open VS Code → **File → Open Folder…** → choose the extracted `SpendWise` folder (the one that contains `backend`, `frontend` and `database`).
3. Open a terminal inside VS Code with **Terminal → New Terminal**. Use the **+** button to open a second terminal later.

> If VS Code's terminal is not PowerShell, click the dropdown next to **+** and choose **PowerShell**.

## 3. Create the database

From the **SpendWise** folder (the project root), run this in PowerShell. It asks for your MySQL root password:

```powershell
cd C:\Projects\SpendWise
Get-Content database\schema.sql | mysql -u root -p
```

This creates the `spendwise` database and its tables.

*(If `Get-Content ... | mysql` does not work for you, open the MySQL Command Line Client, enter your password, and run `source C:/Projects/SpendWise/database/schema.sql;` — use forward slashes.)*

**Optional demo data** (clearly labelled "Demo" in the app):

```powershell
Get-Content database\sample_data.sql | mysql -u root -p
```

To remove demo data later:

```powershell
mysql -u root -p -e "USE spendwise; DELETE FROM expenses WHERE is_demo = 1;"
```

## 4. Configure environment variables

**Backend** – run from the `SpendWise` folder:

```powershell
Copy-Item backend\.env.example backend\.env
code backend\.env
```

Edit `backend/.env` and set `DB_PASSWORD` to your MySQL password (and `DB_USER` if you do not use `root`):

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=spendwise
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

**Frontend** – the default works if the backend runs on port 5000, so this step is optional. To change the API address:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

and edit `VITE_API_BASE_URL` in `frontend/.env`.

> `.env` files hold your password. They are listed in `.gitignore`, so they are never committed to Git.

## 5. Install dependencies

Run each from the `SpendWise` folder:

```powershell
cd backend
npm install
cd ..\frontend
npm install
cd ..
```

## 6. Start the app (two terminals)

**Terminal 1 – backend** (run from `SpendWise\backend`):

```powershell
cd backend
npm start
```

You should see `SpendWise API running at http://localhost:5000/api` and `Database connection OK.`

**Terminal 2 – frontend** (run from `SpendWise\frontend`). Click **+** in the VS Code terminal panel to open a new terminal, then:

```powershell
cd frontend
npm run dev
```

## 7. Open the app

- App: **http://localhost:5173**
- API health check: **http://localhost:5000/api/health** (should show `"status":"ok"`)

Stop either server with `Ctrl + C` in its terminal.

---

## How recurring expenses work

1. On the **Expenses** page choose **Add expense**, tick **Make this a recurring expense** and pick **weekly** or **monthly** (or use **Recurring → Add recurring**). The date you choose is the first occurrence.
2. SpendWise stores a *recurring template* and creates normal expense rows for every due date from that start date up to today. A start date in the past creates the missed occurrences too.
3. The backend generates newly due expenses (a) when it starts, (b) every 6 hours while it is running, and (c) whenever you click **Generate due expenses**. If the backend is off for a while, the missed ones are created next time it starts.
4. **No duplicates:** each template remembers the last date it generated, and the database enforces a unique `(recurring_id, expense_date)` pair, so the same occurrence can never be inserted twice.
5. Monthly items on the 29th–31st use the last day of shorter months (e.g. the 31st becomes Feb 28/29).
6. **Pause** stops new expenses. **Delete** stops the schedule but keeps the expenses already created. If you delete a generated expense, it is *not* recreated.

## API reference

Base URL: `http://localhost:5000/api`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check (also tests the database) |
| GET | `/expenses?search=&category=&from=&to=` | List expenses |
| POST | `/expenses` | Create expense |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |
| GET | `/budgets?month=YYYY-MM` | Budgets with spent / remaining / status |
| PUT | `/budgets` | Create or update a budget (`category` = `TOTAL` or a category) |
| DELETE | `/budgets?month=&category=` | Remove a budget |
| GET | `/analytics/summary?month=` | Dashboard numbers |
| GET | `/analytics/by-category?from=&to=&category=` | Spending per category |
| GET | `/analytics/monthly?from=&to=&category=` | Monthly totals |
| GET / POST | `/recurring` | List / create recurring templates |
| PUT / DELETE | `/recurring/:id` | Update (pause/resume) / delete |
| POST | `/recurring/generate` | Generate due recurring expenses now |

## Project structure

```
SpendWise/
├── backend/
│   ├── src/
│   │   ├── config/        db.js, constants.js
│   │   ├── controllers/   expense, budget, analytics, recurring
│   │   ├── middleware/    validate.js, errorHandler.js
│   │   ├── routes/        index.js
│   │   ├── services/      recurring.js (recurrence engine)
│   │   ├── utils/         dates.js, errors.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/           client.js (Axios + single base URL)
│   │   ├── components/    Layout, forms, tables, charts, dialogs
│   │   ├── hooks/         useFetch.js
│   │   ├── pages/         Dashboard, Expenses, Budgets, Analytics, Recurring
│   │   └── utils/         format.js (₹ formatting, dates)
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql
│   └── sample_data.sql
├── .gitignore
└── README.md
```

## Troubleshooting

**"Cannot reach the SpendWise API" in the browser**
The backend is not running or is on another port. Start it (`npm start` in `backend`) and check http://localhost:5000/api/health. If you changed `PORT`, set the same port in `frontend/.env` (`VITE_API_BASE_URL`) and restart the frontend.

**"Cannot connect to the database" / `ECONNREFUSED`**
MySQL is not running. Press **Win + R**, type `services.msc`, find **MySQL80**, and click **Start**. Also confirm `DB_HOST` and `DB_PORT` in `backend/.env`.

**"Database login failed" / `Access denied for user`**
`DB_USER` or `DB_PASSWORD` in `backend/.env` is wrong. Test with `mysql -u root -p` in PowerShell using the same password. Restart the backend after editing `.env`.

**"Database not found" / "tables are missing"**
Import the schema again (step 3), then restart the backend.

**`EADDRINUSE` – port already in use**
Another program uses port 5000 (backend) or 5173 (frontend). Find it with `netstat -ano | findstr :5000`, stop it with `taskkill /PID <number> /F`, or change `PORT` in `backend/.env` (and `VITE_API_BASE_URL` in the frontend). If Vite picks another port such as 5174, add it to `CORS_ORIGIN` in `backend/.env`.

**CORS error in the browser console**
The frontend address is not in `CORS_ORIGIN`. Add it (comma separated) and restart the backend.

**`Cannot find module ...` or "npm is not recognized"**
Run `npm install` in the folder that failed (`backend` or `frontend`). If `npm` is not recognized, reinstall Node.js and reopen PowerShell/VS Code.

**PowerShell says "running scripts is disabled"**
Run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then try again.

**Port 3306 / MySQL installed with a different port**
Set `DB_PORT` in `backend/.env` to that port.

## Known limitations

- Single-user app: there is no login, so everyone who can open the app shares the same data. Do not expose it to the internet as-is.
- Recurring expenses are generated by a timer inside the backend process; they are created when the backend is running (missed ones are caught up on the next start). Recurring templates can be paused or deleted but their amount/category cannot be edited in the UI (delete and recreate instead).
- Budgets are stored per month; setting a budget for next month must be done separately (there is no automatic carry-over).
- Currency is fixed to INR (₹).
- The expense list shows the latest 1,000 matching expenses.
- Fonts load from Google Fonts; offline the app falls back to the system font.
