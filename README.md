# Typing Knight ⚔️⌨️

A high-fidelity, gothic-themed action game built with **Electron**, **Phaser 3**, and **Vite**. The game combines high-speed typing with side-scrolling combat, where your typing performance directly drives the knight's power and speed.

## 🕹️ Project Overview
**Typing Knight** is a rhythmic combat game where the player controls a knight in a dark, atmospheric world. Success is measured by "Normative WPM" (Words Per Minute) and accuracy. As the player types atmospheric/gothic words, the knight automatically strikes enemies, builds combos, and accelerates through the level.

---

## 🏗️ Technical Stack
- **Core**: JavaScript (ES6+), HTML5
- **Engine**: Phaser 3 (Game Engine)
- **Framework**: Electron (for Desktop distribution)
- **Build Tool**: Vite (for fast HMR and optimized builds)
- **State Management**: Reactive `StatsBus` (Global Event Bus)

---

## 📂 File Structure
```text
typing-knight/
├── electron/
│   ├── main.js             # Electron main process (Window management)
│   └── preload.js           # Secure bridge between Electron and Web
├── src/
│   ├── game/
│   │   ├── entities/
│   │   │   ├── Knight.js    # Player entity (Animated, combat logic)
│   │   │   └── Enemy.js     # Enemy entity (Health bars, death particles)
│   │   ├── scenes/
│   │   │   ├── BootScene.js  # Asset generation (Canvas textures)
│   │   │   └── GameScene.js  # Main gameplay loop & parallax logic
│   │   ├── systems/
│   │   │   ├── LevelManager.js # Progression, phases, and scaling
│   │   │   ├── StatsBus.js     # Global reactive game state
│   │   │   └── TypingEngine.js # Key interceptor and WPM calculator
│   │   ├── config.js         # Phaser engine configuration
│   └── main.js               # Entry point for the web application
├── package.json              # Scripts and dependencies
└── index.html                # Main game container
```

---

## 🚀 Progress Summary

### 1. Core Framework (Completed)
- [x] Initialized Electron + Vite scaffolding.
- [x] Configured Phaser 3 for 1280x720 gothic rendering.
- [x] Implemented a reactive `StatsBus` to decouple UI, Engine, and Entities.

### 2. Typing & Mechanics (Completed)
- [x] **Typing Engine**: Intercepts keystrokes, calculates "Normative WPM", and tracks accuracy.
- [x] **Word Prompt System**: Displays atmospheric words (e.g., *shadow, hollow, void*) at the bottom with real-time character highlighting (Green for correct, Red flash for error).
- [x] **Combo System**: Incremental multipliers that unlock enhanced visual effects and multi-target attacks.

### 3. Combat & Level Loop (Completed)
- [x] **Parallax World**: 3-layer scrolling system creating depth in a dark, atmospheric environment.
- [x] **Knight Entity**: Features a programmatically generated 6-frame animation system (Idle & Attack) using Canvas textures.
- [x] **Enemy System**: Procedurally spawned enemies with dynamic health bars that scale in health and speed every 500 units of distance.
- [x] **Auto-Attack**: The knight attacks the nearest enemy automatically at a rate driven by the user's WPM.
- [x] **Visual Polish**: 
    - Screen shake on heavy hits (>20 damage).
    - Particle bursts on enemy death.
    - Full-screen color overlays (Red/Amber/Purple) that intensify with Combo.
    - "Ghost WPM" background text that reacts to combo multipliers.

### 4. Progression & Difficulty (Completed)
- [x] **Level Manager**: Tracks `distanceTraveled` and cycles through 5 Phases.
- [x] **Scaling Difficulty**: Phase 1 through 5 increases enemy health by 20% and spawn rate significantly.

---

## 🛠️ How to Run
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch Development Mode**:
   ```bash
   npm run electron:dev
   ```
3. **Build for Production**:
   ```bash
   npm run electron:build
   ```

---

## 🗺️ Roadmap
- [ ] **Prompt 4: Boss Encounters**: Huge specters that appear every 2500 units with multi-stage typing requirements.
- [ ] **Prompt 5: UI & Meta-progression**: Main menu, post-run stats summary, and unlockable knight tints.
- [ ] **Prompt 6: Audio Integration**: Dark ambient soundtrack and mechanical "clicky" typing sounds.
