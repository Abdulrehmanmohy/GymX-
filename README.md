# 🏋️ GymX — Next-Gen Full-Stack Fitness & Gym Management Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop" alt="GymX Hero Banner" width="100%" style="border-radius: 12px; max-height: 420px; object-fit: cover;" />
</p>

<p align="center">
  <strong>High-performance, full-stack fitness management system built with React 19, TypeScript, Vite, Tailwind CSS, and Express.</strong>
  <br />
  Featuring live workout tracking, barbell plate calculations, 1RM estimations, daily macro diet logging, smart vision nutritional scanning, digital QR attendance check-ins, and weekly calendar scheduling.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/GymX-v2.4.0--Pro-10b981?style=for-the-badge&logo=target&logoColor=white" alt="GymX Version" />
  <img src="https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6.2.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="License" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Workout Tracking & Training Hub](#1-workout-tracking--training-hub)
  - [2. Daily Macro & Nutrition Engine](#2-daily-macro--nutrition-engine)
  - [3. Smart Food Vision Scanner](#3-smart-food-vision-scanner)
  - [4. Fitness Calendar & Daily Planner](#4-fitness-calendar--daily-planner)
  - [5. Digital Gym Pass & Attendance Check-In](#5-digital-gym-pass--attendance-check-in)
  - [6. Analytics & Performance Hub](#6-analytics--performance-hub)
  - [7. Lifter Utility Modals & Calculators](#7-lifter-utility-modals--calculators)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [REST API Reference](#-rest-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
- [Theming & Customization](#-theming--customization)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**GymX** is an all-in-one athletic operating system designed for modern lifters, gym enthusiasts, and club managers. It bridges the gap between intense strength training logs, precise macronutrient tracking, gym desk operations, and dynamic calendar scheduling in a sleek, cyber-athletic interface.

Built from the ground up for speed, responsiveness, and aesthetic precision, GymX features dark-first high-contrast palettes, smooth micro-interactions, full offline-capable state synchronization, and an Express REST API engine.

---

## 🚀 Key Features

### 1. Workout Tracking & Training Hub
- **Interactive Exercise Library:** Filter dozens of compound and isolation lifts across chest, back, legs, shoulders, arms, and core with primary and secondary muscle targeting.
- **Active Workout Session Mode:** Full-screen live session runner with real-time rest timer countdowns, set-by-set weight & rep tracking, RPE (Rate of Perceived Exertion) logging, and personal best indicators.
- **Custom Routine Builder:** Design multi-day training splits (Push/Pull/Legs, Upper/Lower, Arnold Split) with custom exercise sequencing, target rep ranges, and rest intervals.
- **Biomechanical Exercise Swapper:** Instantly find biomechanically identical alternative exercises when gym equipment is occupied or due to joint strain.
- **Animated Biomechanics Visualizer:** Interactive canvas displaying targeted anatomical muscle activations.

### 2. Daily Macro & Nutrition Engine
- **Calorie & Macro Budget Tracker:** Real-time visual progress bars for total Calories, Protein (g), Carbohydrates (g), and Dietary Fats (g).
- **Categorized Meal Logger:** Log meals under Breakfast, Lunch, Dinner, Snack, Pre-Workout, and Post-Workout with timestamped history.
- **Hydration Tracker:** 1-tap quick water logging (+250ml, +500ml, +750ml) against daily athletic hydration goals with progress fill indicators.
- **Macro Distribution Charts:** Visual calorie density breakdown to maintain bulking, cutting, or lean-recomposition phases.

### 3. Smart Food Vision Scanner
- **Live Camera / File Upload:** Capture meals directly via device camera or upload image files.
- **Instant Nutritional Breakdown:** Estimates meal name, serving weight (g), caloric density, and macro split (Protein / Carbs / Fat / Fiber).
- **1-Click Logging:** Instantly transfers scanned nutritional data directly into the user's daily meal log without manual typing.

### 4. Fitness Calendar & Daily Planner
- **Interactive Calendar View:** Seamless monthly and weekly calendar navigation with daily task indicators.
- **Multi-Category Scheduling:** Schedule workouts, meal prep routines, cardio sessions, mobility work, and scheduled rest days.
- **Today's Training Hub:** Direct dashboard card highlighting scheduled routines, estimated duration, and primary target muscles.
- **Completion Checklists:** Track consistency with interactive check-offs and streak preservation.

### 5. Digital Gym Pass & Attendance Check-In
- **Dynamic QR Code Member Pass:** Generates high-definition, scan-ready dynamic QR codes with membership IDs and security tokens.
- **Multi-Tier Member Badges:** Supports membership tiers (e.g., *Black Onyx VIP*, *Gold Elite*, *Silver Pro*).
- **Live Floor Occupancy Gauge:** Real-time gym capacity meter with peak-hour warnings and live occupancy percentages.
- **Desk Check-In / Check-Out:** Instant member status check-in, duration counter, and historical check-in audit logs.
- **CSV Data Export:** Export clean CSV attendance records for gym administration and record keeping.

### 6. Analytics & Performance Hub
- **Volume Load Metric:** Calculates cumulative tonnage lifted across training cycles.
- **Consistency Heatmap:** Visual streak trackers displaying weekly workout attendance and consistency records.
- **PR & 1RM Progression:** Log and track personal records across bench press, back squat, deadlift, and overhead press.

### 7. Lifter Utility Modals & Calculators
- **Olympic Plate Calculator:** Visual barbell loading diagram that computes the exact plates needed per side (45lb / 25lb / 10lb / 5lb / 2.5lb or kg equivalent).
- **One-Rep Max (1RM) Estimator:** Scientific 1RM calculation using Brzycki, Epley, and Lander formulas with complete percentage intensity tables (95% down to 50%).
- **Warm-Up Pyramid Generator:** Calculates exact warm-up ramping sets (Empty Bar, 40%, 60%, 80%) to prepare nervous system and prevent injury.

---

## 🛠️ Tech Stack

### Frontend
- **React 19:** State-of-the-art declarative UI components and hooks
- **TypeScript 5.8:** End-to-end type safety and clean interfaces
- **Tailwind CSS v4:** Utility-first modern CSS framework with custom design system
- **Motion (Framer Motion):** Smooth modal animations, drawer transitions, and micro-interactions
- **Lucide React:** Comprehensive athletic and functional icon library
- **QRCode:** High-resolution digital member pass QR generator

### Backend & Tooling
- **Node.js & Express 4:** Robust RESTful API architecture
- **Vite 6:** Lightning-fast HMR and optimized production bundling
- **ESBuild & TSX:** High-performance TypeScript execution for the server runtime
- **Dotenv:** Secure environment variable management

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   GymX Client (React 19)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Workouts   │  │ Macro & Diet │  │ Vision Scan  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐  │
│  │ Daily Plan   │  │ QR Pass &    │  │ Analytics &  │  │
│  │ & Calendar   │  │ Attendance   │  │ PR Tracker   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │ (Vite Middleware & REST API Proxy)│
          ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────┐
│                Express REST API Engine                 │
│                                                        │
│  GET /api/exercises       GET /api/diet                │
│  POST /api/routines       POST /api/diet/meals         │
│  POST /api/workout/complete POST /api/scan-food        │
│  GET /api/tasks           GET /api/attendance          │
│  POST /api/tasks          POST /api/check-in           │
│  GET /api/members         POST /api/check-out          │
└────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Reference

The GymX backend provides clean, documented REST endpoints:

### System & Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service status, database counts, and system uptime |
| `GET` | `/api/system/status` | Real-time gym capacity, occupancy, and active lifters |

### Workouts & Routines
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/exercises` | List all exercises with muscle group and search filters |
| `GET` | `/api/routines` | Retrieve pre-built and custom user training splits |
| `POST` | `/api/routines` | Create and store a new custom training routine |
| `POST` | `/api/workout/complete` | Log completed session volume, duration, and update streak |

### Diet & Hydration
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/diet` | Fetch logged daily meals, calorie totals, and water intake |
| `POST` | `/api/diet/meals` | Add a new meal entry with protein, carbs, fat, and calories |
| `DELETE` | `/api/diet/meals/:id` | Remove a logged meal entry |
| `POST` | `/api/diet/water` | Update hydration intake (+amountMl) or reset daily log |

### Planner & Calendar
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all scheduled fitness and nutrition tasks |
| `POST` | `/api/tasks` | Create a new calendar task (workout, meal prep, cardio) |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle completion status of a scheduled task |
| `DELETE` | `/api/tasks/:id` | Delete a scheduled task |

### Attendance & Member Desk
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/members` | Retrieve registered gym members and membership tiers |
| `GET` | `/api/attendance` | Fetch current occupancy, peak hours, and check-in logs |
| `POST` | `/api/check-in` | Member check-in via QR Pass or manual desk entry |
| `POST` | `/api/check-out` | Member check-out with calculated workout session duration |

---

## 📁 Project Structure

```text
gymx/
├── index.html                   # HTML entry point with meta & OpenGraph tags
├── package.json                 # Project dependencies and script declarations
├── server.ts                    # Express REST API backend and dev Vite server
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS plugins
├── .env.example                 # Environment configuration template
└── src/
    ├── App.tsx                  # Root application router and layout coordinator
    ├── main.tsx                 # React DOM mount entry point
    ├── index.css                # Global Tailwind CSS imports and utility styling
    ├── components/
    │   ├── common/              # Shared header, navigation, and theme selectors
    │   │   ├── Header.tsx
    │   │   ├── BottomNav.tsx
    │   │   ├── NotificationBanner.tsx
    │   │   └── ThemePaletteSelector.tsx
    │   ├── workouts/            # Workout sessions, routines, and lifter tools
    │   │   ├── WorkoutsModule.tsx
    │   │   ├── ActiveWorkoutSessionModal.tsx
    │   │   ├── CustomRoutineBuilderModal.tsx
    │   │   ├── PlateCalculatorModal.tsx
    │   │   ├── OneRepMaxModal.tsx
    │   │   ├── WarmUpPyramidModal.tsx
    │   │   ├── ExerciseSwapModal.tsx
    │   │   ├── AnimatedExerciseCanvas.tsx
    │   │   ├── WorkoutVisualizer.tsx
    │   │   └── ExerciseVideoPlayer.tsx
    │   ├── planner/             # Calendar and task scheduling
    │   │   ├── DailyPlannerModule.tsx
    │   │   └── TodayWorkoutHub.tsx
    │   ├── diet/                # Macro tracking and meal management
    │   │   └── DailyDietModule.tsx
    │   ├── scanner/             # Nutritional vision scanner
    │   │   └── SmartFoodScannerModule.tsx
    │   ├── attendance/          # Member passes and attendance desk
    │   │   └── AttendanceModule.tsx
    │   └── analytics/           # Volume and streak analytics
    │       └── AnalyticsPerformanceModule.tsx
    ├── data/
    │   └── gymData.ts           # Initial exercise library, seed data, and helpers
    ├── types/
    │   └── gymTypes.ts          # Core TypeScript models and data structures
    └── utils/
        └── themePalettes.ts     # Color themes and dynamic styling palettes
```

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/gymx.git
   cd gymx
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts full-stack dev server with Express & Vite HMR on port 3000 |
| `npm run build` | Compiles frontend via Vite and bundles backend via ESBuild into `dist/` |
| `npm run start` | Runs the production-compiled Express server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview`| Previews the Vite production build locally |

---

## 🎨 Theming & Customization

GymX features multiple athlete-inspired color themes that switch seamlessly on the fly:
- **Emerald Stealth (Default):** Vibrant athletic neon-emerald accents on deep carbon backgrounds.
- **Inferno Red & Black:** High-octane powerlifting red and black motif.
- **Neon Cyber Blue:** Electric cyan aesthetic with crisp contrast.
- **Gold Luxury Elite:** Premium championship gold for executive lifters.

To switch themes, tap the palette toggle in the top-right header menu or customize presets in `src/utils/themePalettes.ts`.

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<p align="center">
  Built with passion for athletics and clean engineering • <strong>GymX</strong>
</p>
