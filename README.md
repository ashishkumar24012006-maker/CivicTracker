# CivicTrack — Public Issue Reporting and Resolution Platform

CivicTrack is a civic technology platform that empowers citizens to report public infrastructure and municipal problems (potholes, water leaks, broken streetlights, overflowing garbage, drainage clogs, and traffic signal outages) and connects them directly with municipal administrators and field department staff.

---

## ⚡ Instant Demo Credentials

For testing and demonstration, use the 1-click demo login buttons directly on the login screen or enter:

| Role | Email | Password | Responsibilities |
|---|---|---|---|
| **Citizen** | `citizen@civictrack.org` | `password123` | Report issues, pin on map, track tickets, follow issues, verify resolution |
| **Administrator** | `admin@civictrack.org` | `password123` | Analytics dashboard, assign dept/staff, set deadlines & SLA, user directory |
| **Department Staff** | `staff.roads@civictrack.org` | `password123` | View assigned queue, update progress, upload proof photo evidence, resolve |
| **Staff (Water)** | `staff.water@civictrack.org` | `password123` | Water & Sewage work order management |

> **Role Switcher in Navbar:** Once logged in, you can instantly toggle between **Citizen**, **Staff**, and **Admin** via the demo switcher in the top navigation bar to test each role's view seamlessly.

---

## 🚀 Key Features

1. **Authentication Gate & Role-Based Access Control:**
   - Dedicated **Login & Sign Up Portal** presented first upon arrival.
   - Once authenticated, the website opens immediately into role-specific views.
   - JWT tokens with bcrypt password hashing and backend route protection.

2. **Interactive Issue Map (Leaflet & OpenStreetMap):**
   - Clickable SVG map pins color-coded by issue status and category.
   - Interactive popups with thumbnail photo, status, priority, and direct link to report.
   - Draggable pin placement tool for pinpointing exact coordinates when reporting.
   - Browser geolocation GPS detection.
   - Split-screen view, full map view, and list view toggles.

3. **Status Workflow Engine & Audit Trail:**
   - Sequential lifecycle: `Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Verified` (plus `Rejected` and `Reopened`).
   - Every action generates an immutable activity log with timestamp, operator, role, and notes.

4. **Field Resolution Evidence:**
   - Staff can upload photographs of completed repair work along with field completion notes.
   - Uploads support dual storage: Cloudinary or local disk storage (`/uploads`).

5. **Citizen Verification & Reopen Loop:**
   - When an issue is marked `Resolved`, the citizen reporter can confirm resolution with a 1-5 star rating or report that the issue is still unresolved to reopen the ticket.

6. **Executive Administration Command Center:**
   - Real-time MongoDB metrics: Total reports, pending triage, in progress, resolved, overdue count, and average resolution time in days and hours.
   - Interactive **Recharts** charts for category distributions and status donut charts.
   - Department SLA performance and resolution efficiency auditing.
   - Urgent & Overdue attention list with 1-click Dispatch/SLA assignment modal.

7. **Community Engagement & Live Notifications:**
   - Citizens can follow issues to receive updates.
   - Discussion board with official municipal response badges.
   - Real-time Socket.IO alerts and slide-out notifications drawer.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Leaflet, React-Leaflet, Recharts, Axios, Socket.IO Client
- **Backend:** Node.js, Express.js, MongoDB / Mongoose with GeoJSON 2dsphere indexing, MongoMemoryServer (zero-config local fallback), Multer, Cloudinary, Socket.IO, JWT, bcryptjs

---

## 💻 Running the Application

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Automated Tests
Run the comprehensive backend integration tests covering authentication, hashing, GeoJSON indexing, and the status workflow engine:
```bash
cd server
npm test
```

### 3. Start the Development Servers
From the root directory:
```bash
# In Terminal 1 - Start Backend API (Port 5000)
npm run server

# In Terminal 2 - Start Frontend (Port 3000)
npm run client
```

Now open **http://localhost:3000/** in your browser.

---

## 📂 Project Architecture

```
CivicTrack/
├── package.json              # Project scripts (server, client, seed, test)
├── README.md                 # Documentation
├── server/
│   ├── config/               # Database connection (MongoDB / MongoMemoryServer fallback)
│   ├── controllers/          # Business logic (auth, reports, comments, follow, notifications, admin)
│   ├── middleware/           # JWT auth, RBAC authorization, Multer uploads, error handler
│   ├── models/               # Mongoose schemas (User, Department, Report, Comment, Notification, ReportFollow)
│   ├── routes/               # Express REST routes
│   ├── scripts/              # Seed script with realistic civic issues & coordinates
│   ├── tests/                # Automated backend test suite
│   ├── public/uploads/       # Local upload directory for issue evidence photos
│   ├── server.js             # Express app & Socket.io server
│   └── .env.example          # Environment configuration
└── client/
    ├── src/
    │   ├── api/              # Axios instance with auth interceptor
    │   ├── context/          # AuthContext & SocketContext
    │   ├── components/       # Navbar, InteractiveMap, IssueCard, Badges, Modals, Drawers
    │   ├── pages/            # AuthPage, MapExplorerPage, SubmitIssuePage, IssueDetailPage,
    │   │                     # CitizenDashboard, AdminDashboard, StaffDashboard, DepartmentsPage,
    │   │                     # UserManagementPage, ProfilePage, NotFoundPage
    │   ├── App.jsx           # Root layout & role routing
    │   └── main.jsx          # Providers & entry point
    ├── vite.config.js        # Vite build & proxy config
    └── tailwind.config.js    # Civic palette design tokens
```

---

## 📜 License
ISC License © 2026 CivicTrack. Built for public good and municipal accountability.
