# 🌾 FARMDB: From Farmer to Agribusiness

> **A story-driven, interactive SQLite WebAssembly farming simulator that turns SQL beginners into agribusiness data masters.**

[![SQLite 3](https://img.shields.io/badge/SQLite_3-WebAssembly-003B57?logo=sqlite&logoColor=white)](https://github.com/sql-js/sql.js)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B_Modules-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural_Web_Audio_API-E04E39)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Story](#-the-story)
- [Key Features](#-key-features)
- [Architecture at a Glance](#-architecture-at-a-glance)
- [Quick Start](#-quick-start)
- [How to Play](#-how-to-play)
- [10-Level Learning Curriculum](#-10-level-learning-curriculum)
- [Interactive Controls & Shortcuts](#-interactive-controls--shortcuts)
- [Project Directory Structure](#-project-directory-structure)
- [Developer Diagnostics](#-developer-diagnostics)
- [Detailed Technical Documentation](#-detailed-technical-documentation)

---

## 🌟 Overview

**FARMDB** is a gamified, hands-on educational simulation where you learn relational databases and SQL by running an actual farm. 

Unlike conventional tutorials with static query boxes, **FARMDB connects a live, client-side SQLite 3 engine (compiled to WebAssembly) directly to a living, animated farm world**. Every crop you plant, seed you purchase, cow you register, liter of water you consume, and market order you fulfill is executed as a real SQL query.

When your query executes:
- The **database schema updates** immediately in SQLite memory.
- The **farm canvas reacts visually** (seedlings sprout, crops grow, cows graze, tractors drive, and warehouse crates stack).
- The **procedural Web Audio synthesizer** responds with farm sound effects synthesized in real time.

---

## 📜 The Story

> *"Your grandfather had the heart of a farmer, but the farm has grown too complicated for handwritten notes. A modern farm needs a memory. Welcome to FARMDB."*  
> — **Uncle Somu**, Family Friend & Agricultural Advisor

You inherit your family's countryside farm. In your hands is your grandfather's weathered journal containing inventory lists: bags of tomato, rice, and wheat seeds, two healthy cows in the barn, an old red tractor in the shed, and ₹500 in a tin box.

Guided by Uncle Somu, you modernize the family farm step-by-step—from creating your first database tables to managing soil nutrition, balancing water reservoirs, analyzing market prices, managing staff, resolving financial discrepancies, and ultimately making strategic executive decisions during regional droughts.

---

## ✨ Key Features

### 1. 🚜 Direct SQLite 3 WebAssembly Engine
- Runs a true SQLite 3 database directly inside your browser using WebAssembly (`sql.js`).
- Zero server backend required—all transactions, constraints, joins, triggers, and aggregations run with microsecond latency locally.
- Full schema introspection via SQLite `PRAGMA table_info` with a dynamic **Live Schema Browser** and **Interactive ERD View**.

### 2. 🌱 Living, Reactive Farm Canvas
- **5 Cultivation Plots (A1 – A5)**: Each full acre divides into North and South sub-beds (`A1.1`, `A1.2`), unlocking progressively as your farming level increases.
- **5-Stage Visual Crop Progression**: Watch crops advance from *Sprout* (0%) ➔ *Vegetative Sprout* (30%) ➔ *Growing Stem* (60%) ➔ *Flowering* (90%) ➔ *Ripe Harvest* (100%).
- **Interactive Water Reservoir**: Live water level gauge showing real-time liters consumption with interactive mouse ripple effects.
- **Pasture Barn & Livestock**: Animated grazing cows that automatically nod off and show sleep bubbles when night falls.
- **Equipment Yard**: Houses your tractor ("Old Red") that triggers scripted drive animations when harvesting crops.
- **Warehouse Storage**: Visual crates reflecting live inventory from your `seeds` and `stock` database tables.

### 3. ⚡ Draggable & Resizable SQL Studio
- **Floating Window**: Drag anywhere across the viewport or snap/resize to your preferred workspace dimensions.
- **Smart Code Editor**: Line numbers, query syntax hints, one-click query templates (`⚡ Fill Query`), and keyboard execution (`Ctrl+Enter`).
- **3-Tier Progressive Hint System**:
  - *Tier 1*: Conceptual agricultural nudge.
  - *Tier 2*: SQL keyword syntax guide.
  - *Tier 3*: Complete runnable SQL query.
- **Intelligent Error Diagnostics**: Educational diagnostic tips explaining misspelled keywords, missing tables, column errors, and constraint violations.
- **Minimized Telemetry Widget**: Minimize the terminal to a compact **Live Farm Dispatch Report** displaying real-time field status, water reserves, and warehouse metrics.

### 4. 🌅 Atmospheric Day/Night & Celestial Tracker
- **Physically Calculated Sun Trajectory**: The sun rises in the East (5:00 AM), follows a natural parabolic arc to zenith at midday (12:30 PM), and sets in the West (8:30 PM).
- **Four Atmospheric Phases**: *Morning* 🌅, *Day* ☀️, *Sunset* 🌇, and *Night* 🌙 with dynamic atmospheric lighting and palette filters.
- **Ambient Night Sky**: 40+ twinkling procedural stars and glowing floating fireflies over the meadow.

### 5. 🎵 100% Procedural Web Audio Synthesizer
- **Zero External Audio Assets**: All sound effects are synthesized mathematically in real time using the browser's native **Web Audio API**:
  - 🐓 **Authentic Dawn Rooster Crow** (*"Kuku-du-ku-ku!"*): 4-part vocal formant glide with 6.5 Hz vibrato.
  - 🚜 **Tractor Diesel Chug**: 55 Hz–80 Hz sawtooth waveform with gain ramping.
  - 💧 **Water Plop & Ripples**: Dual sine pitch-glides for fluid tactile feedback.
  - 🪙 **Coin Clink**: Harmonic chime for market sales.
  - 🦗 **Night Crickets & Morning Birdsong**: Procedural ambient nature sounds.
  - 🎺 **Level Complete Fanfare**: Ascending 4-note A-major victory chord.

### 6. 🖼️ Cinematic Living Login Experience
- Optional living entry view showcasing grandfather sitting under the oak tree, a sleeping farm dog with tail wags, an animated turning windmill, and live day/night lighting.

---

## 🏛️ Architecture at a Glance

```mermaid
flowchart TD
    subgraph UI ["User Interface Layer"]
        Editor["SQL Studio Terminal\n(Editor, Line Numbers, Hints)"]
        Nav["Top Navigation Bar\n(Time, Day, Cash, XP, Audio)"]
        World["Living Farm Canvas\n(Plots, Barn, Reservoir, Shed)"]
        Views["Alternate Views\n(ERD, Warehouse, Story Roadmap)"]
    end

    subgraph Core ["FARMDB Orchestrator (src/main.js)"]
        App["FarmDBApp Orchestrator"]
    end

    subgraph StateAndSim ["Game State & Simulation Engine"]
        GS["GameState (state.js)\n(Time, Cash, Level, Badges)"]
        SIM["SimulationEngine (simulation.js)\n(Day Advance, Crop Growth, Water)"]
        MIS["MissionsController (missions.js)\n(Objectives, Validators, Hints)"]
    end

    subgraph DB ["SQLite WebAssembly Engine (src/sql/engine.js)"]
        WASM["SQLite 3 (sql.js / WASM)"]
        Schema["Schema Inspector & PRAGMA"]
        Bus["Change Notification Event Bus"]
    end

    subgraph Audio ["Sound Controller (src/visuals/audio.js)"]
        Synth["Web Audio API Procedural Synthesizer"]
    end

    Editor -->|User runs SQL (Ctrl+Enter)| App
    App -->|execute(sql)| WASM
    WASM -->|Mutation Trigger| Bus
    Bus -->|Notify Database State Change| App
    App -->|Synchronize DOM Visuals| World
    App -->|Check Objectives| MIS
    MIS -->|Mission Passed| GS
    App -->|Synthesize Sound| Synth
    Nav -->|Advance Day| SIM
    SIM -->|UPDATE farming & water_reservoir| WASM
    SIM -->|Advance Time| GS
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- `npm` (bundled with Node.js)

### 1. Clone or Open the Repository
```bash
cd "c:/Users/Shashaank Sajjanar/Desktop/Random Projects/farmdb"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Local Development Server
```bash
npm run dev
```

The terminal will display the local development URL (typically `http://localhost:5173/`). Open this address in any modern web browser (Chrome, Edge, Firefox, Safari).

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🎮 How to Play

1. **Review Your Mission**: Check the active objective in the sidebar card or inside the SQL Terminal's **🎯 Mission Objectives** tab.
2. **Consult Grandfather's Journal**: Click the 📖 journal icon in the top header to review starting inventory notes and Uncle Somu's advice.
3. **Open the SQL Studio**: Click the ⚡ **SQL Compiler** button in the top bar or on any plot card.
4. **Write and Execute Your Query**:
   - Type standard SQL into the editor.
   - Click **▶ Run SQL** or press **`Ctrl + Enter`** (`Cmd + Enter` on macOS).
   - Use **⚡ Fill Query** if you wish to inspect a recommended query template.
   - Click **💡 Hint** if you need guidance (cycles through 3 escalating hint tiers).
5. **Watch the Farm Transform**:
   - Creating the `seeds` table stocks the storage warehouse.
   - Inserting cows populates the barn.
   - Planting seeds changes plot soil into living green sprouts.
   - Advancing the day (⏩ **Advance**) consumes water and matures your crops.
   - Harvesting triggers the tractor to collect yield into the warehouse.
   - Selling fulfilled orders deposits hard-earned cash (₹) into your farm treasury!

---

## 📚 10-Level Learning Curriculum

| Level | Title | Player Role | SQL Concepts Mastered | Story Milestone |
|:---:|:---|:---|:---|:---|
| **1** | **The Empty Farm** | New Farmer | `CREATE TABLE`, Primary Keys, Data Types, `INSERT INTO`, `SELECT *` | Catalog grandfather's notebook; populate seeds, cows, and tractor into SQLite. |
| **2** | **First Harvest** | Farmer | `SELECT ... WHERE`, `UPDATE`, Relational state transitions | Find available plots, sow tomatoes in Plot A1, nurture to 100%, harvest, and sell produce for ₹800. |
| **3** | **The Farm Gets Busy** | Farm Operator | `ORDER BY`, `GROUP BY`, Aggregates (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`), `HAVING` | Unlocks Plot A2! Manage multi-crop yields (Tomato, Rice, Wheat, Corn) with yield analytics. |
| **4** | **The Supply Problem** | Supply Manager | `AND`, `OR`, `IN`, `BETWEEN`, `LIKE`, `CASE`, `NULL` handling | Manage supply shortages in fertilizer, seed bags, and feed; dispatch supplier deliveries. |
| **5** | **The Market** | Market Seller | Date functions, calculated fields, dynamic pricing algorithms | Capitalize on fluctuating market prices and fulfill restaurant purchase contracts. |
| **6** | **Farm Manager** | Farm Manager | `INNER JOIN`, `LEFT JOIN`, Multi-table relational queries | Unlocks Plot A5! Recruit workers (Ravi, Maya, Arjun) and assign personnel to plots & machinery. |
| **7** | **The Numbers Don't Match** | Financial Manager | Subqueries, nested queries, financial audit & reconciliation | Investigate a ₹49,000 cash discrepancy and detect billing leakage. |
| **8** | **The Expansion** | Expansion Manager | Common Table Expressions (`WITH` CTEs), multi-farm schemas | Scale beyond the home farm: acquire Farm North, South, and East. |
| **9** | **The Agricultural Empire** | Agribusiness Exec | Window Functions (`RANK`, `ROW_NUMBER`, `PARTITION BY`), running totals | Rank employee productivity, track moving average yields, and model enterprise growth. |
| **10** | **The Harvest Decision** | Farm CEO | Multi-source data synthesis under severe resource constraints | Regional drought crisis! Synthesize water limits, crop margins, and historical yields to ensure farm survival. |

---

## ⌨️ Interactive Controls & Shortcuts

| Action | Shortcut / Trigger | Description |
|:---|:---|:---|
| **Run SQL Query** | `Ctrl + Enter` (or `Cmd + Enter`) | Executes SQL editor contents in SQLite WASM engine. |
| **Open Developer Diagnostics** | `F2` | Toggles the real-time diagnostic modal monitoring engine, state, and recent SQL. |
| **Dismiss Modals** | `Escape` | Closes open dialogs (Story notebook, Developer Diagnostics, Inspector). |
| **Cycle Time of Day** | Click on 🌅 Time Pill | Shifts atmosphere between Morning ➔ Day ➔ Sunset ➔ Night. |
| **Advance Farm Day** | Click ⏩ Advance Button | Advances date, waters crops (+35% growth), and consumes reservoir water. |
| **Trigger Rooster Crow** | Shift to Morning | Synthesizes an authentic rooster crow (*"Kuku-du-ku-ku!"*). |
| **Water Ripples** | Click Reservoir Tank | Generates expanding concentric surface ripples and water audio. |
| **Inspect Field Plot** | Click any Sub-bed | Opens the Plot Inspector displaying active crop, soil status, growth %, and yield. |
| **Minimize SQL Studio** | Click `_` on Terminal | Collapses the studio into the Live Farm Dispatch telemetry dashboard. |
| **Toggle Audio** | Click 🔇 / 🔊 Icon | Enables or mutes procedural procedural sound effects. |

---

## 📁 Project Directory Structure

```
farmdb/
├── index.html                   # Main application entry point & DOM layout
├── package.json                 # Project configuration & npm scripts
├── vite.config.js               # Vite build & development configuration
├── README.md                    # Project overview & quick start guide
├── EXPLANATION.md               # In-depth architectural & technical documentation
│
├── public/                      # Static assets served directly by Vite
│   ├── sql-wasm.js              # SQLite 3 WebAssembly glue script
│   ├── sql-wasm.wasm            # Compiled SQLite 3 WebAssembly binary (658 KB)
│   └── images/                  # Scenery & thematic reference images
│
└── src/                         # Application source code
    ├── main.js                  # Main application orchestrator & event coordinator
    │
    ├── game/                    # Game mechanics & story simulation
    │   ├── missions.js          # Mission data definitions, SQL solutions & validators
    │   ├── simulation.js        # Agricultural simulation (plots, crop growth, water)
    │   └── state.js             # Game state manager (time, money, XP, persistence)
    │
    ├── sql/                     # SQLite database engine
    │   └── engine.js            # SQLEngine class, WASM loader & error diagnostics
    │
    ├── visuals/                 # Audio, DOM renderers & UI controllers
    │   ├── audio.js             # Web Audio API procedural sound synthesizer
    │   ├── draggable.js         # Floating draggable & resizable window controller
    │   ├── farmRenderer.js      # Living farm canvas DOM/SVG renderer
    │   └── loginView.js         # Living interactive login screen controller
    │
    └── styles/                  # Modular stylesheet architecture
        ├── variables.css        # Design tokens, color palette & typography
        ├── layout.css           # Grid architecture, top nav & sidebar navigation
        ├── farm.css             # Farm canvas, plot cards, reservoir, sky & lighting
        ├── terminal.css         # Draggable SQL terminal, results table & code editor
        ├── story.css            # Journal modal, celebration screen & journey roadmap
        └── login.css            # Living login screen, scenery & parallax styles
```

---

## 🐛 Developer Diagnostics

Press **`F2`** at any point during gameplay (or click the 🐛 icon in the top header) to open the **Developer Diagnostics Panel**:

- **SQLite Engine Status**: Real-time health check on the WebAssembly runtime.
- **Database Tables**: Instant list of all active tables currently registered in SQLite memory.
- **Game State Telemetry**: Level, Day, Hour, Cash, XP, and active mission ID.
- **Last Executed SQL & Results**: View exact raw SQL strings, affected row counts, and detailed error messages.
- **Test SQL Ping**: One-click database connectivity ping (`SELECT 1 AS ping, datetime('now');`).
- **Reset Options**: Instant localStorage wiping and factory-state reset for automated testing.

---

## 📖 Detailed Technical Documentation

Looking for an in-depth breakdown of the internal mechanics? Read **[EXPLANATION.md](file:///c:/Users/Shashaank%20Sajjanar/Desktop/Random%20Projects/farmdb/EXPLANATION.md)** for:
- Complete SQLite WebAssembly integration and execution lifecycle.
- Reactive event synchronization architecture.
- Database relational schemas, data dictionary, and deduplication triggers.
- Agricultural physics equations and parabolic celestial algorithms.
- Mathematical breakdown of the procedural Web Audio synthesizer.
- Automated testing harness with headless browser verification.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE). Built for learners, educators, and database enthusiasts worldwide! 🌱
