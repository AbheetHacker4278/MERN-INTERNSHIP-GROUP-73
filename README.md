# 🍽️ RESTROBOOK — Full-Stack Restaurant Reservation App

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> A modern, full-stack restaurant reservation platform built with the **MERN stack** (MongoDB, Express, React, Node.js). Features a premium glassmorphism UI, real-time booking management, a fully functional admin dashboard, and role-based authentication.

---

## 📸 Screenshots

| Home Page | Reservation Section | Admin Dashboard |
|---|---|---|
| Premium navbar with glassmorphism | 2-column booking form with slide-in reservations panel | Dark-theme stats + reservation management |

---

## ✨ Features

### 👤 User Features
- 🔐 **Authentication** — Signup / Login / Logout with JWT cookies
- 📋 **Make Reservations** — Fill a guided form with name, date, time, email, phone
- 📁 **My Reservations** — Slide-in panel to view all personal bookings with status badges
- ❌ **Cancel Reservations** — Cancel any active booking with confirmation dialog
- 🔄 **Auto-login state** — Auth state persisted via HTTP-only cookies

### 🛡️ Admin Features
- 🔑 **Admin Login** — Separate, role-protected admin access
- 📊 **Dashboard Overview** — Stats cards (Total, Pending, Confirmed, Completed, Cancelled, Users) with colour-coded top borders
- 📅 **All Reservations** — Search, filter by status, sort by any column, inline status update, delete with confirmation
- 👥 **All Users** — View all registered users with role badges and join dates
- 🚫 **No-Booking Policy** — Admins cannot make reservations (UI redirects to management view)
- 🔗 **Deep-linking** — Navbar & sidebar links jump directly to specific tabs via `?tab=reservations` / `?tab=users`
- 🔢 **Live Badges** — Sidebar nav items show live counts of reservations and users

### 🎨 UI/UX Highlights
- **Glassmorphism Navbar** — Frosted glass effect with scroll-depth transition
- **All-Admin Navbar Buttons** — When admin is logged in: ⚙️ Dashboard, 📋 All Reservations, 👥 All Users shown as a grouped gold-labelled section
- **Premium Reservation Section** — 2-column hero layout (info panel + glassmorphism form card), slide-in "My Reservations" drawer from the right
- **Slide-in Reservation Panel** — Colour-coded booking cards (⏳ Pending, ✅ Confirmed, 🎉 Completed, ❌ Cancelled)
- **Premium Light Admin Dashboard** — White sidebar with gold accent bar, orange gradient brand icon, section label, live count badges, user profile card with green online dot
- **Coloured Stat Cards** — Each stat card has a distinct colour-coded top border stripe
- **Responsive Design** — Mobile-first with hamburger drawer navigation
- **Smooth Animations** — Slide-in panels, modal pop animations, hover lifts

---

## 🏗️ Project Structure

```
MERN-INTERNSHIP-GROUP-73/
│
├── backend/                    # Express.js API server
│   ├── app.js                  # Main server entry, routes, middleware
│   ├── server.js               # Port listener
│   ├── controller/
│   │   └── reservation.js      # All controllers (auth, reservations, admin)
│   ├── database/
│   │   └── dbConnection.js     # MongoDB connection (RESERVATIONS DB)
│   ├── middlewares/
│   │   └── error.js            # Global error handler
│   ├── models/
│   │   ├── User.js             # User schema (name, email, password, role)
│   │   └── reservation.js      # Reservation schema (fields + status enum)
│   └── routes/
│       ├── reservationRoute.js # User-facing reservation endpoints
│       ├── user.js             # Auth endpoints (login, signup, logout, me)
│       └── adminRoute.js       # Admin-only protected endpoints
│
├── frontend/                   # React + Vite app
│   └── src/
│       ├── App.jsx             # Routes: /, /login, /signup, /success, /admin
│       ├── components/
│       │   ├── Navbar.jsx      # Premium glassmorphism navbar
│       │   ├── NavbarPremium.css
│       │   ├── HeroSection.jsx # Hero with CTA buttons
│       │   ├── Reservation.jsx # Full reservation section (form + panel + modals)
│       │   ├── Footer.jsx
│       │   └── Auth.jsx        # Login + Signup pages
│       └── Pages/
│           ├── Home/           # Homepage assembly
│           ├── Admin/
│           │   ├── AdminDashboard.jsx
│           │   └── AdminDashboard.css
│           └── ...
│
├── seedAdmin.js                # One-time script: creates admin@gmail.com in DB
├── debugAdmin.js               # Diagnostic: verify password hash in DB
├── config.env                  # Environment variables (⚠️ Keep secret!)
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** account (or local MongoDB)
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/AbheetHacker4278/MERN-INTERNSHIP-GROUP-73.git
cd MERN-INTERNSHIP-GROUP-73
```

---

### 2. Configure Environment Variables

Create / edit `config.env` in the project root:

```env
MONGO_URI = "mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority"
PORT = 4000
FRONTEND_URL = "http://localhost:5173"
JWT_SECRET = yourSuperSecretKey
```

> ⚠️ **Never commit `config.env` to version control.**

---

### 3. Install Dependencies

```bash
# Root dependencies (shared scripts)
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

---

### 4. Start the Development Servers

**Option A — Two terminals:**

```bash
# Terminal 1 — Backend (port 4000)
npm start

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

**Option B — Concurrently (if configured):**
```bash
npm run dev
```

Visit: **http://localhost:5173**

---

### 5. Seed the Admin Account

Run **once** to create the admin user in MongoDB:

```bash
node seedAdmin.js
```

Output:
```
✅  Connected to MongoDB (RESERVATIONS)
✅  bcrypt hash verified locally
🎉  Created new admin user!
    Email   : admin@gmail.com
    Password: 123456
    Role    : admin
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@gmail.com` | `123456` |
| **User** | _Register via UI_ | _Your choice_ |

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/signup` | Register new user | Public |
| POST | `/api/login` | Login, returns JWT cookie | Public |
| GET | `/api/logout` | Logout, clears cookie | Public |
| GET | `/api/me` | Get current user | 🔒 Required |

### Reservations (User)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/reservation/send` | Create reservation | 🔒 Required |
| GET | `/api/reservations` | Get my reservations | 🔒 Required |
| DELETE | `/api/reservations/:id` | Cancel my reservation | 🔒 Required |

### Admin API (Admin role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/reservations` | Get all reservations |
| PUT | `/api/admin/reservations/:id` | Update reservation status |
| DELETE | `/api/admin/reservations/:id` | Delete reservation |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/stats` | Dashboard statistics |

---

## 🎛️ Admin Dashboard

Navigate to **http://localhost:5173/admin** after logging in as admin.

### Sidebar
| Element | Details |
|---------|---------|
| **Brand Icon** | Orange gradient 🍽️ tile with "Admin Panel" + "RestroBook" |
| **MAIN MENU** | Section label above nav items |
| **Nav badges** | Live counts on Reservations & Users items |
| **User card** | Avatar, name, email, green online dot at bottom |
| **Logout** | Red outlined button in footer |

### Tabs
| Tab | Features |
|-----|----------|
| **📊 Overview** | Colour-striped stat cards + recent bookings table with View All button |
| **📅 Reservations** | Full table with search, filter by status, sort columns, inline status dropdown, delete |
| **👥 Users** | All registered users with gold Admin / blue User role badges |

### Quick Access from Navbar
When logged in as admin, the navbar shows 3 grouped buttons:
- ⚙️ **Dashboard** → `/admin`
- 📋 **All Reservations** → `/admin?tab=reservations`
- 👥 **All Users** → `/admin?tab=users`

---

## 🛠️ Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| **Node.js** | Runtime |
| **Express.js** | API framework |
| **MongoDB + Mongoose** | Database + ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **cookie-parser** | HTTP-only cookie handling |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

### Frontend
| Tech | Purpose |
|------|---------|
| **React 18** | UI framework |
| **Vite** | Dev server + bundler |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP requests |
| **react-hot-toast** | Toast notifications |
| **framer-motion** | Animations |
| **react-scroll** | Smooth scroll links |
| **react-icons** | Icon library |

---

## 📦 Deployment

The app is configured for deployment on **Render** (as a monorepo):

- Backend serves the built frontend from `/frontend/dist`
- Environment: set `NODE_ENV=production` and all `config.env` variables as Render env vars
- Build command: `cd frontend && npm install && npm run build`
- Start command: `node backend/app.js`

Live URL: `https://mern-internship-group-73-1.onrender.com`

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- Auth via **HTTP-only JWT cookies** (not localStorage)
- Admin routes protected by dual middleware: `isAuthenticated` + `isAdmin`
- CORS restricted to known origins
- `config.env` excluded from git via `.gitignore`

---

## 📝 Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm start` | Root | Start backend server |
| `npm run dev` | `/frontend` | Start React dev server |
| `node seedAdmin.js` | Root | Create/reset admin user |
| `node debugAdmin.js` | Root | Verify DB password hash |

---

## 👥 Contributors

Built by **Group 73** — CDC Internship MERN Stack Batch.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and modify.

---

> 🍽️ *Bon Appétit! Built with ❤️ using the MERN Stack.*
