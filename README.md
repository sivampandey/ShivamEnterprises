# Shivam Enterprises — Labour Attendance & Wage Ledger System

A professional, full-stack labour attendance and wage ledger web application built for **Shivam Enterprises** (single shop admin).

Designed with a modern ledger paper aesthetic, rubber ink stamp attendance controls, tabular currency tracking in Indian Rupees (₹), mobile-first responsive layouts, running balance calculations, and downloadable monthly CSV reports.

---

## 📲 How to Download & Install as an App on Your Device

**Shivam Enterprises** is built as a Progressive Web App (PWA). You can install it directly onto your phone's home screen or laptop desktop without going through an app store!

### 📱 On Android (Google Chrome)
1. Open the app in **Chrome** browser on your Android phone.
2. Tap the **"Install App"** button in the top header, OR tap the **⋮ (three dots menu)** in the top right corner.
3. Select **"Install App"** or **"Add to Home Screen"**.
4. Tap **Install**. The **Shivam Ledger** app icon will appear on your phone home screen and app drawer!

### 🍎 On iPhone / iPad (Apple Safari)
1. Open the app in **Safari** browser on your iPhone or iPad.
2. Tap the **Share** button (the square icon with an upward arrow at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner. The **Shivam Ledger** app icon will appear on your iPhone home screen!

### 💻 On Windows PC / Mac (Google Chrome or Microsoft Edge)
1. Open the app URL in **Chrome** or **Microsoft Edge**.
2. Click the **"Install App"** button in the header bar, or click the **Install icon (small monitor with down arrow)** in the address bar.
3. Click **Install**. The app will launch in a standalone window and add a shortcut to your Desktop and Start Menu!

---

## 🌟 Key Features

- **🔐 Admin Authentication**: Secure login with JWT tokens delivered via `httpOnly`, `sameSite`, `secure` cookies with bcrypt password hashing and session validation.
- **📅 Today's Attendance Register**: Date-picker register with interactive ink stamp buttons (**Present** / **Half Day** / **Absent**), cash advance tracking, and live daily wage earned calculations.
- **👥 Labourers Roster & Directory**: Manage shop workers, daily wage rates, inline wage editing, active/inactive toggles, Add Labourer modal, and confirmation dialogs for destructive actions.
- **📖 Individual Labourer Ledgers**: Comprehensive worker history timeline, running balance statistics, attendance totals, and cash settlement payout recording.
- **📊 Monthly Reports & CSV Export**: Summary dashboard for monthly wages paid, advances issued, net balances owed, sortable worker tallies, and instant CSV file downloads.
- **🎨 Ledger Aesthetics & Dark Mode**: Modern paper-and-ink visual theme (`#FAF6EC` / `#26221A` / `#B9812E`) with a light/dark mode toggle.
- **📱 Responsive & Mobile-Friendly**: Adapts smoothly from desktop tabular views to touch-friendly single-column mobile web cards with bottom navigation.

---

## 🏗️ Technology Stack

### **Frontend (`src/`)**
- **Core**: React 18 + Vite + TypeScript
- **PWA**: Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Standalone Display
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Custom CSS (Ink stamp animations, tabular numerals)
- **HTTP Client**: Axios (with JWT header interceptor & 401 login auto-redirect)
- **State Management**: React Context (`AuthContext`, `ThemeContext`) & Local Storage Fallback
- **Icons**: Lucide React

### **Backend (`server/`)**
- **Core**: Node.js + Express
- **Database**: MongoDB + Mongoose Schema Models
- **Security & Auth**: JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `helmet`, `cors`, `express-rate-limit`
- **Validation**: `zod` schema validation
- **Logging**: `morgan`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`

### 2. Frontend Setup & Launch
```bash
# 1. Install frontend dependencies
npm install

# 2. Start Vite development server
npm run dev
```
The web application will open at **`http://localhost:3000`**.

### 3. Backend Setup & Launch
```bash
# 1. Navigate to server directory
cd server

# 2. Install backend dependencies
npm install

# 3. Seed default admin credentials and sample workers
npm run seed

# 4. Start backend server in development mode
npm run dev
```
The REST API server will run at **`http://localhost:5000`**.

---

## 🔑 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 📐 Server Business Rules & Balance Calculation

1. **Daily Wage Earned**:
   - `PRESENT`: $100\%$ of worker's daily wage
   - `HALF_DAY`: $50\%$ of worker's daily wage
   - `ABSENT`: ₹0

2. **Net Running Balance Formula**:
   $$\text{Running Balance Owed} = \sum \text{Earned Wages} - \sum \text{Cash Advances Taken} - \sum \text{Settlements Paid}$$

---

## 📄 License

This project is created for **Shivam Enterprises**. All rights reserved.
