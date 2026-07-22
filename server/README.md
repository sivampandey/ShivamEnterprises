# Shivam Enterprises — Labour Attendance & Wage Ledger REST API Backend

Production-ready Express REST API service for **Shivam Enterprises** labour attendance and wage ledger system.

## Features
- **Authentication**: JWT authentication delivered via `httpOnly`, `sameSite`, `secure` cookies with bcrypt password hashing.
- **Labourers Directory**: Full CRUD management with server-side running balance calculations.
- **Attendance Register**: Upsert attendance status (`present`, `half`, `absent`, `null`) and daily withdrawals.
- **Ledger & Settlements**: Per-worker running balance timeline history and cash settlement recordings.
- **Reports & Export**: Monthly summary endpoint and downloadable CSV export (`/api/reports/summary.csv`).
- **Security & Middleware**: Rate limiting on login, Helmet security headers, CORS origin verification (`credentials: true`), and centralized error handling.

---

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
- `zod` schema validation
- `express-rate-limit`, `helmet`, `morgan`

---

## Environment Variables (`server/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Server listening port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/shivam_enterprises` | MongoDB connection string |
| `JWT_SECRET` | `shivam_enterprises_super_secret_jwt_key_2026` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration time |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed React frontend origin |
| `COOKIE_DOMAIN` | `localhost` | Cookie domain scope |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |

---

## Local Setup & Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Seed Initial Admin User
Seed default admin credentials (`admin` / `admin123`) and initial sample workers:
```bash
npm run seed
```

### 3. Start API Backend
Run in development mode with auto-reload:
```bash
npm run dev
```
Or start in production mode:
```bash
npm start
```

---

## API Endpoint Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login` — Body: `{ "username": "admin", "password": "admin123" }` (Sets JWT cookie)
- `POST /api/auth/logout` — Clears JWT cookie
- `GET /api/auth/me` — Returns logged-in admin details

### 2. Labourers (`/api/labourers`)
- `GET /api/labourers?active=true|false|all` — List labourers with computed balance
- `POST /api/labourers` — Body: `{ "name": "Rajesh Kumar", "dailyWage": 650 }`
- `PATCH /api/labourers/:id` — Body: `{ "dailyWage": 700, "active": true }`
- `DELETE /api/labourers/:id` — Cascade-deletes worker & all attendance records

### 3. Attendance (`/api/attendance`)
- `GET /api/attendance?date=YYYY-MM-DD` — List active workers' attendance for target date
- `PUT /api/attendance/:labourerId/:date` — Body: `{ "status": "present", "withdrawal": 100 }`

### 4. Ledger & Reports (`/api/reports`, `/api/labourers`)
- `GET /api/labourers/:id/ledger` — Full worker ledger timeline history & totals
- `POST /api/labourers/:id/settle` — Body: `{ "amount": 1500, "note": "Mid-month payout" }`
- `GET /api/reports/summary?month=YYYY-MM` — Monthly ledger totals & worker breakdown
- `GET /api/reports/summary.csv?month=YYYY-MM` — Download monthly summary in CSV format
