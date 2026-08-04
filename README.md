# SafeTour AI: Smart Tourist Safety & Incident Response Dashboard

SafeTour AI is a state-of-the-art MERN Stack full-stack application designed to ensure the safety, security, and convenience of international and domestic tourists. It combines real-time emergency responder dispatching, AI-powered travel tools, crowdsourced scam tracking, and a comprehensive localization system to create a resilient safety net for travelers.

---

## 🚀 Key Features

### 1. 🌐 Real-time Localization (i18n)
- **Supported Languages**: English, Hindi (🇮🇳 HI), Marathi (🇮🇳 MR), and Assamese (🇮🇳 AS).
- **Reactive Hooks**: Integrates a dynamic ES6 Proxy-based language translator that propagates translations instantly across all tabs and panels without requiring browser reloads.
- **Persistent Selection**: Automatically stores language choices in `localStorage` to preserve user preferences across sessions.

### 2. 🚨 Global Emergency SOS & Chat Assistant Container
- **Unified Layout**: Incorporates a layout-aware `FloatingActionContainer` that anchors the chat toggle and active SOS panic button.
- **Dynamic Collision Offsets**: Checks the DOM for other positioned UI overlays (like maps, footer notices, or mobile nav bars) and shifts the floating stack upward dynamically to prevent overlap.
- **Overlay Layering**: When the chat sidebar expands, the SOS widget automatically offsets upward by `100px` and remains fully visible, active, and clickable on top of the chat drawer via z-index `100001`.

### 3. 🗺️ Multi-Role Dashboard Hub
- **Tourist Command Console**:
  - Live coordinates telemetry tracking (emitted via WebSockets).
  - Silent SOS panic broadcasting.
  - Trusted emergency contacts circles management.
  - Blockchain-style immutable security profile checker.
- **Responder Dispatch Terminals**:
  - **Police Terminal**: Manage active SOS reports and log local criminal incidents.
  - **Hospital Terminal**: Coordinate trauma responses, check ambulance telemetry, and log medical dispatches.
  - **Wilderness Search & Rescue (Rescue) Terminal**: Manage search teams, coordinate off-grid rescues, and log dispatcher updates.
- **Admin Command Portal**: Global telemetry overview, safety zone geo-fencing creation, and global incident log audits.

### 4. 🧠 Intelligent Travel Security Tools
- **AI Safety Trip Planner**: Generates safe itinerary checklists, transport route recommendations, and category-by-category security budgets powered by generative AI.
- **Crowdsourced Scam Radar**: Live scam reporting maps that cluster verified incidents into geographical heatmaps and trigger alerts.
- **Offline Resiliency Package**: Caches critical safety directories, medical check-ins, local police hotlines, and security procedures inside browser memory for travelers experiencing cellular blackouts.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite, Tailwind CSS, Lucide React, Zustand State Store)
- **Backend**: Node.js, Express.js, Socket.io (WebSocket telemetry), BullMQ (Background Jobs), Nodemailer (Welcome Emails)
- **Database**: MongoDB Atlas (Mongoose Object Document Mapping)
- **Cache**: Redis (Background Queue broker)

---

## 📦 Directory Structure

```bash
travel project/
├── frontend/             # React Client
│   ├── src/
│   │   ├── components/   # ChatAssistant, SOSWidget, Maps, FloatingActionContainer
│   │   ├── context/      # Theme, App, Language Contexts
│   │   ├── locales/      # Translations JSON files (en, hi, mr, as)
│   │   ├── pages/        # Dashboard panels, scam radar, trip planner, auth
│   │   └── store/        # Zustand state definitions
│   └── vite.config.js    # Vite dev proxy configuration
│
├── backend/              # Express API Server
│   ├── src/
│   │   ├── config/       # MongoDB, Redis, socket setups
│   │   ├── models/       # Mongoose Schemas (User, Alert, SOSRequest, ScamReport)
│   │   ├── routes/       # Authentication, community log, active dispatches
│   │   └── server.js     # Express App entry & seeder
│   └── .env              # Environment configurations (MONGO_URI, JWT_SECRET, etc.)
│
└── start.js              # Concurrently launches backend & frontend suites
```

---

## 🔌 Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: An active Atlas cluster (with `0.0.0.0/0` access whitelist)
- **Redis**: Running instance on port `6379` (Optional; falls back to sync execution if unavailable)

### 1. Repository Setup
Clone the repository and navigate to the project directory:
```bash
cd "travel project"
```

### 2. Configure Backend Environment
Navigate to the backend directory and create/edit your `.env` file:
```bash
cd backend
# Edit the .env file with your Atlas credentials
```
Ensure the variables are configured:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
MONGO_URI=mongodb+srv://[username]:[password]@cluster0.xxxx.mongodb.net/futuredna?retryWrites=true&w=majority
```

### 3. Install Dependencies
Run from the root directory to install packages for both client and backend:
```bash
npm install
```

### 4. Running the Application Locally
Launch both servers concurrently from the root directory using:
```bash
npm run dev
```
- **Frontend client** launches at: `http://localhost:3000`
- **Backend server** listens at: `http://localhost:5000`

---

## 🔐 Seeding Demo Credentials
During initialization, the database seeder automatically creates the following test accounts:

| Role | Email | Password |
|---|---|---|
| **Tourist** | `tourist@safetour.ai` | `password123` |
| **Police Officer** | `police@safetour.ai` | `password123` |
| **Hospital Staff** | `hospital@safetour.ai` | `password123` |
| **Rescue Dispatcher** | `rescue@safetour.ai` | `password123` |
| **System Admin** | `admin@safetour.ai` | `password123` |
