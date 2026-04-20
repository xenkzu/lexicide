# Lexicide: A Gothic Typing Action Odyssey

![Version](https://img.shields.io/badge/Version-0.1.0--alpha-blue)
![Engine](https://img.shields.io/badge/Engine-Phaser--3.80-orange)
![Platform](https://img.shields.io/badge/Platform-Electron--29-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blueviolet)

---

Lexicide is a high-performance desktop game that merges the rhythmic precision of typing with the dark, atmospheric intensity of a gothic side-scroller. Your keyboard is your weapon; every character you type drives your character forward and fuels your attacks. Built with a modern architecture, Lexicide is designed for low-latency input and fluid visual storytelling.

## Play Lexicide Now

The simplest way to experience Lexicide is by using the pre-compiled standalone executable or playing the demo online.

*   **Play on itch.io:** Visit the [Lexicide itch.io page](https://xenkzu.itch.io/lexicide) to play the demo or download the game.
*   **No installation required:** Simply run the file and start your descent into the gothic ruins.

---

## Gameplay and Mechanics

In Lexicide, performance translates directly into power. The game monitors your typing metrics in real-time to calculate your impact on the world.

*   **Typing-Driven Combat:** Every word you correctly type triggers character actions. Your Word-Per-Minute (WPM) affects your movement speed and attack frequency.
*   **Accuracy Modifiers:** Precision is rewarded. Maintaining high accuracy provides significant damage multipliers, allowing you to dispatch enemies more efficiently.
*   **Procedural Atmosphere:** Journey through a world featuring a dynamic 5-layer parallax system. The environment reacts to your progress, with background elements shifting and scaling based on your performance.
*   **Scaling Difficulty:** As you travel further, the game dynamically increases the challenge. Enemy density and health scale procedurally, ensuring a consistent testing of your typing speed.

## Technical Core

Lexicide is built on a robust stack designed for responsiveness and scalability.

*   **Renderer:** Phaser 3 manages the game loop and canvas-based rendering for high-performance visuals.
*   **Platform:** Electron provides a native desktop experience with cross-platform compatibility.
*   **Build System:** Vite ensures rapid development cycles and highly optimized production bundles.
*   **State Management:** A custom reactive event bus synchronizes the typing engine with the combat and animation systems.

---

## Building from Source

For developers or those interested in running the game from the source code, follow these standard steps to set up your local environment.

### Prerequisites

You will need [Node.js](https://nodejs.org/) installed on your machine to manage dependencies and run the build scripts.

### Setup and Development

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/xenkzu/lexicide.git
    cd lexicide
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Launch the Development Environment**
    Run the following command to start the game with Hot Module Replacement (HMR):
    ```bash
    npm run electron:dev
    ```

4.  **Create a Production Build**
    To package the application for distribution:
    ```bash
    npm run electron:build
    ```

---

## Project Structure

*   **/assets:** Contains all static media, including spritesheets, fonts, and audio files.
*   **/electron:** Houses the main process and preload logic for the desktop environment.
*   **/src/game:** The core engine, featuring the typing logic, scene management, and entity systems.
*   **vite.config.js:** Configuration for the fast, modern build pipeline.

## License

This project is open-source and available under the terms of the [MIT License](LICENSE).

---
Developed by the Lexicide Team.
