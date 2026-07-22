# Shivam Enterprises — Labour Attendance & Wage Ledger System

A complete full-stack web application for **Shivam Enterprises**, a labour attendance and wage ledger system for a single shop admin.

Designed with a paper ledger aesthetic, rubber ink stamp attendance controls, tabular currency tracking in Indian Rupees (₹), mobile-first responsive layouts, running balance calculations, downloadable monthly CSV reports, and automatic server health monitoring.

---

## 📁 Project Structure

```
/Shivam-Enterprises
  /server        (Node.js + Express + MongoDB REST API)
  /src           (React + Vite + Tailwind CSS Frontend)
  package.json   (root — runs both frontend & backend concurrently)
  .env.example   (frontend environment template)
  /server/.env.example (backend environment template)
  README.md
```

---

## ⚡ Quick Start (Single Command)

### 1. Initial Setup

```bash
# 1. Install root & frontend dependencies
npm install

# 2. Install backend dependencies
cd server && npm install && cd ..

# 3. Create local environment files
cp .env.example .env
cp server/.env.example server/.env
```

### 2. Seed Database

```bash
# Create default admin user (admin / admin123) and sample labourers
npm run seed
```

### 3. Launch Application (Backend + Frontend)

```bash
# Runs backend (port 5000) and frontend (Vite) concurrently with one command
npm run dev
```

---

## 🧪 Verify It Works

1. Open your browser and navigate to **`http://localhost:3000`** (or `http://localhost:5173`).
2. **Health Check Verification**: On page load, the frontend pings `/api/health`. The server health status passes cleanly without any warning banners.
3. **Login Verification**:
   - **Username**: `admin`
   - **Password**: `admin123`
4. Click **Sign In to Register**. On successful login, you will land on the **Dashboard**, pre-populated with sample labourers and attendance controls!

---

## ⚙️ Environment Variables & Deployment

Moving from local development to production requires **only changing values in `.env` files — no code changes.**

### **Backend Environment (`/server/.env`)**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shivam_attendance
JWT_SECRET=shivam_enterprises_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
NODE_ENV=development
```

### **Frontend Environment (`/.env`)**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### **When Deploying to Production:**
- **Backend `.env`**: Change `MONGODB_URI` to your production MongoDB Atlas cluster URL, `CORS_ORIGIN` to your deployed frontend domain (e.g. `https://shivam-enterprises.vercel.app`), `COOKIE_DOMAIN` to your domain, `NODE_ENV=production`, and set a strong `JWT_SECRET`.
- **Frontend `.env`**: Change `VITE_API_BASE_URL` to your deployed backend URL (e.g. `https://shivam-enterprises-backend.onrender.com/api`).
- **Nothing else needs editing.** All URLs, ports, and origins are consumed exclusively from these two environment files.

---

## 🏗️ Technology Stack

### **Frontend (`src/`)**
- **Core**: React 18 + Vite + TypeScript
- **PWA**: Web App Manifest (`manifest.json`), Standalone Display
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Custom CSS (Ink stamp animations, paper ledger theme `#FAF6EC` / `#26221A` / `#B9812E`)
- **HTTP Client**: Axios with `withCredentials: true` and authorization token headers
- **State Management**: React Context (`AuthContext`, `ThemeContext`) & Server Health Monitor (`ServerHealthBanner`)

### **Backend (`server/`)**
- **Core**: Node.js + Express
- **Database**: MongoDB + Mongoose Schema Models (`Admin`, `Labourer`, `AttendanceRecord`, `Settlement`)
- **Security & Auth**: JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `helmet`, `cors`, `express-rate-limit`
- **Validation**: `zod` schema validation
- **CSV Export**: Native CSV report generation (`GET /api/reports/summary.csv`)

---

## 🔑 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 📐 Business Rules & Ledger Calculations

1. **Daily Wage Earned**:
   - `PRESENT`: $100\%$ of worker's daily wage
   - `HALF_DAY`: $50\%$ of worker's daily wage
   - `ABSENT`: ₹0

2. **Net Running Balance Formula**:
   $$\text{Balance Owed} = \sum \text{Earned Wages} - \sum \text{Cash Advances Taken} - \sum \text{Settlements Paid}$$

---

## 📄 License

Created for **Shivam Enterprises**. All rights reserved.
