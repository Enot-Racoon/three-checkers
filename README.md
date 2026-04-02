# Three Checkers: Grandmaster Rival

A stunning 3D checkers game built with React, Three.js, and Bun. Challenge yourself against an AI opponent with dynamic lighting, smooth animations, and real-time AI rival.

![Three.js](https://img.shields.io/badge/Three.js-r183-orange) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-informational) ![Bun](https://img.shields.io/badge/Bun-1.3.3-yellow)

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

- **Bun** package manager (v1.3.3 or higher)

### Installation

1. **Navigate to the project directory**:

   ```bash
   cd three-checkers
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
   http://localhost:3000
   ```

## 🛠️ Tech Stack

| Category         | Technology                                           |
| ---------------- | ---------------------------------------------------- |
| **Frontend**     | React 19, TypeScript                                 |
| **3D Rendering** | Three.js r183, @react-three/fiber, @react-three/drei |
| **Runtime**      | Bun 1.3.3                                            |
| **Build Tool**   | Bun.build                                            |
| **Styling**      | Tailwind CSS 4, shadcn/ui components                 |
| **AI Logic**     | Minimax with Alpha-Beta Pruning                      |

## 🎯 Available Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `bun run dev`          | Start development server with hot reload |
| `bun run build`        | Build production bundle to `dist/`       |
| `bun run start`        | Start production server                  |
| `bun run lint`         | Run ESLint to check code quality         |
| `bun run lint:fix`     | Run ESLint and fix auto-fixable issues   |
| `bun run format`       | Format code with Prettier                |
| `bun run format:check` | Check code formatting without changes    |

## 🤖 AI Features

### Game AI

- **Algorithm**: Minimax with Alpha-Beta Pruning
- **Search Depth**: 4 plies
- **Evaluation**: Material count + positional bonuses + advancement bonus

## 🎨 Visual Features

- **Dynamic Lighting**: Spotlights follow the current player's turn
  - Red turn: Warm orange lighting (`#ffedd5`)
  - Black turn: Cool blue lighting (`#e0f2fe`)
- **Floating Animation**: Board gently floats with realistic physics
- **Contact Shadows**: Real-time shadow rendering
- **Piece Animations**: Smooth transitions for moves and captures with hop animation
- **Death Animation**: Captured pieces shrink and fade out dramatically
- **Last Move Highlight**: Golden glow on source and destination squares

## ⚙️ Configuration

### Bun Configuration

The project uses Bun's native build tool for fast builds. See `build.ts` for build configuration and `bunfig.toml` for Bun settings.

### TypeScript

Strict TypeScript configuration for type safety with path aliases (`@/*` → `./src/*`). See `tsconfig.json` for compiler options.

### Build Options

```bash
# Build with minification
bun run build --minify

# Build with sourcemaps
bun run build --sourcemap=linked

# Custom output directory
bun run build --outdir=build
```

## 📁 Project Structure

```
src/
├── app/              # App entry point and global styles
├── components/       # React components
│   ├── Board3D.tsx   # 3D board and pieces
│   ├── UIOverlay.tsx # Game UI overlay
│   └── ui/           # Reusable UI components
├── logic/            # Game logic
│   ├── gameLogic.ts  # Rules, valid moves, board state
│   └── aiLogic.ts    # AI minimax algorithm
├── lib/              # Utilities
├── types.ts          # TypeScript type definitions
├── frontend.tsx      # React entry point
├── index.ts          # Bun server entry point
└── index.html        # HTML template
```

## 🔧 Troubleshooting

### Performance Issues

- Reduce shadow quality in `App.tsx` (shadow-mapSize)
- Lower the AI search depth in `aiLogic.ts` (default: 4)
- Reduce fog distance in `App.tsx`

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && bun install`
- Clear dist folder: `rm -rf dist && bun run build`

### Server Issues

- Check if port 3000 is available
- Verify Bun version: `bun --version`

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
- **Bun** for blazing fast JavaScript runtime

---

**Ready to challenge the Grandmaster?** 🎲

```bash
bun run dev
```

Good luck - you'll need it! ♟️
