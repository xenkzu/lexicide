# Lexicide

Lexicide is a high-performance, gothic-themed action game built with Electron, Phaser 3, and Vite. The core mechanic integrates high-speed typing with side-scrolling combat, where performance metrics directly influence gameplay intensity and character power.

## Overview

Lexicide focuses on rhythmic, high-accuracy typing within a dark, atmospheric environment. The system utilizes a custom typing engine to calculate word-per-minute (WPM) and accuracy metrics in real-time. These metrics drive the player's movement speed, combat effectiveness, and progress through a procedurally scaling level system.

## Technical Architecture

The application is built on a modern JavaScript stack designed for low-latency input and fluid rendering:

*   **Engine**: Phaser 3 for canvas-based rendering and game loop management.
*   **Platform**: Electron for cross-platform desktop distribution.
*   **Build System**: Vite for optimized hot module replacement (HMR) and production bundling.
*   **State Management**: A reactive global event bus (StatsBus) that synchronizes the Typing Engine, Entity systems, and UI.

## Core Systems

### Typing Engine
A specialized input handler that monitors keystrokes to calculate normative WPM and accuracy. It supports dynamic word prompts with real-time visual feedback, including character-level highlighting and error state animations.

### Dynamic Parallax Environment
A multi-layered parallax system with 5+ layers of depth, featuring programmatically generated assets. The backdrop includes deep space starfields, distant gothic architecture, and foreground silhouettes that scale in velocity based on player performance.

### Combat and Progression
*   **Entity Mechanics**: Custom animated entities (Knight and Enemies) with state-driven behaviors.
*   **Boss Encounters**: Periodic high-intensity encounters featuring multi-stage health mechanics and phrase-based typing challenges.
*   **Scaling Difficulty**: A procedural level manager that increases enemy health, spawn density, and movement velocity as distance increases.

## Installation and Development

Ensure you have Node.js installed on your system before proceeding.

### Setup
```bash
npm install
```

### Development
Launch the application in development mode with HMR:
```bash
npm run electron:dev
```

### Production
Generate an optimized production bundle:
```bash
npm run electron:build
```

## Project Structure

```text
lexicide/
├── assets/             # Spritesheets and static media
├── electron/           # Main and preload processes
├── src/                # Application source code
│   ├── game/           # Core game logic
│   │   ├── entities/   # NPC and Player classes
│   │   ├── scenes/     # Boot and Gameplay scenes
│   │   ├── systems/    # Engine, State, and Level management
│   │   └── config.js   # Phaser configuration
│   └── main.js         # Entry point
└── vite.config.js      # Build configuration
```

## Current Status and Roadmap

Lexicide is currently in active development.

*   [x] Core Typing and Combat Engine
*   [x] Procedural Atmosphere and Parallax System
*   [x] Cinematic Boss Encounters
*   [ ] External Audio Integration
*   [ ] Persistent Statistics and Meta-progression
*   [ ] Advanced UI and Main Menu system
