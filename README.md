# F1 Hub // 2026 Championship Tracker

Welcome to **F1 Hub**, a premium, minimalist dashboard designed for Formula 1 enthusiasts to track the 2026 Championship campaign in real-time. By wiring together open motorsport telemetry with a high-fidelity dark-mode interface, F1 Hub delivers a refined, distraction-free view of the ongoing season standings and active race weekend sessions.

### [Open F1 Hub Dashboard](index.html)

---

## Key Features

### 🏁 Live Session Ticker Ribbon
Positioned at the very top of the dashboard, this horizontal ticker loops through the active Grand Prix weekend schedule. 
- Displays key sessions: **Qualifying**, **Sprint Races**, and the **Main Grand Prix**.
- Real-time status indicators classify sessions as `Upcoming`, `Live`, or `Completed`.
- Low-profile UK broadcast network badges (`Sky Sports F1` / `Channel 4`) inform you where to watch.

### 📊 Symmetrical Key Metrics
Three premium indicator cards summarize the state of the championship instantly:
- **Championship Leader**: Prominently highlights the leading driver along with their average points hauled per race weekend.
- **Constructors Leader**: Details the leading constructor team and their combined points haul average.
- **Season Progress**: Shows the current round count (e.g., `Round 6 / 22`) paired with an animated progress bar indicating overall completion.

### 🏆 Comprehensive Standings & Specialized Leaderboards
The lower dashboard houses five symmetrical data tables arranged in a responsive grid layout:
1. **Drivers Standings**: Renders driver ranks, names, constructor affiliations, and total points.
2. **Constructors Standings**: Details team rankings and aggregated championship points.
3. **Pole Position Masters**: Aggregates qualifying results to rank drivers by total pole positions won.
4. **Most Retirements**: Tracks team reliability, sorting constructors by total DNFs (did not finish) caused by technical faults or accidents.
5. **Fastest Pit Crew**: Computes the absolute minimum pit stop time recorded by each constructor team during the latest completed round, sanitized to show competitive sub-3-second tire changes.

---

## Design Philosophy
F1 Hub replicates the design aesthetics of premium sports telemetry portals:
- **Vibrant Dark Mode**: Deep charcoal backgrounds paired with high-contrast racing red accents and neon green indicators.
- **Defensive Text Scales**: Font sizes dynamically scale via fluid CSS math (`clamp()`) to ensure driver names and statistics sit perfectly on a single line on any screen.
- **Glassmorphic Skeletons**: Smooth shimmer animations fill the screen during data load, offering a cohesive and premium app-like experience.
