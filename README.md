# Three Checkers: Grandmaster Rival

A stunning 3D checkers game built with React, Three.js. Challenge yourself against an AI opponent with dynamic lighting, smooth animations, and real-time AI rival.

![Three.js](https://img.shields.io/badge/Three.js-r182-orange) ![React](https://img.shields.io/badge/React-19.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-informational)

## ✨ Features

- **Beautiful 3D Graphics** – Immersive checkers board with dynamic lighting, shadows, and floating animations
- **AI Opponent** – Smart AI using minimax algorithm with alpha-beta pruning (depth: 4)
- **Multi-Jump Sequences** – Full support for chain captures with smooth animations
- **Interactive UI** – Clean overlay showing game state, turn indicators, and AI messages
- **Responsive Design** – Works on all screen sizes
- **King Promotion** – Pieces automatically become kings when reaching the opposite end

## 🎮 Gameplay

- **Red pieces** move first (you play as Red)
- **Black pieces** are controlled by the AI
- Click your piece to select it, then click a highlighted square to move
- Captures are mandatory in jump sequences
- Kings can move and capture both forward and backward

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **Bun** package manager (recommended) or npm

### Installation

1. **Clone the repository** (or navigate to the project directory):

   ```bash
   cd three-checkers/debug/example
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Start the development server**:

   ```bash
   bun run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

## 🛠️ Tech Stack

| Category         | Technology                                      |
| ---------------- | ----------------------------------------------- |
| **Frontend**     | React 19, TypeScript                            |
| **3D Rendering** | Three.js, @react-three/fiber, @react-three/drei |
| **Build Tool**   | Vite 6                                          |
| **AI Logic**     | Minimax with Alpha-Beta Pruning                 |

## 🎯 Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `bun run dev`     | Start development server with hot reload |
| `bun run build`   | Build production bundle                  |
| `bun run preview` | Preview production build locally         |

## 🤖 AI Features

### Game AI

- **Algorithm**: Minimax with Alpha-Beta Pruning
- **Search Depth**: 4 plies
- **Evaluation**: Material count + positional bonuses

## 🎨 Visual Features

- **Dynamic Lighting**: Spotlights follow the current player's turn
  - Red turn: Warm orange lighting
  - Black turn: Cool blue lighting
- **Floating Animation**: Board gently floats with realistic physics
- **Contact Shadows**: Real-time shadow rendering
- **Piece Animations**: Smooth transitions for moves and captures
- **Death Animation**: Captured pieces fade out dramatically

## ⚙️ Configuration

### Vite Configuration

The project uses Vite 6 with React plugin for fast development and optimized builds. See `vite.config.ts` for details.

### TypeScript

Strict TypeScript configuration for type safety. See `tsconfig.json` for compiler options.

## 🔧 Troubleshooting

### Performance Issues

- Reduce shadow quality in `App.tsx` if experiencing lag
- Lower the AI search depth in `aiLogic.ts` (default: 4)

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && bun install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## 📝 Game Rules

This implementation follows standard American checkers (English draughts):

- **Movement**: Regular pieces move diagonally forward one square
- **Capturing**: Jump over opponent pieces diagonally
- **King Promotion**: Reach the opposite end to become a king
- **King Movement**: Kings can move and capture both forward and backward
- **Multi-Jump**: Chain multiple captures in a single turn
- **Win Condition**: Capture all opponent pieces or block all their moves

## 📄 License

MIT License - feel free to use this code for your own projects.

## 🙏 Acknowledgments

- **Three.js** community for amazing 3D web graphics tools
- **React Three Fiber** for making Three.js accessible in React
- **@react-three/drei** for useful Three.js helpers

---

**Ready to challenge the Grandmaster?** 🎲

```bash
bun run dev
```

Good luck - you'll need it! ♟️
