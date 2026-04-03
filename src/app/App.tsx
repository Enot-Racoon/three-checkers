import "./index.css";

import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Float,
  Stats,
} from "@react-three/drei";
import * as THREE from "three";

import {
  createInitialBoard,
  getValidMoves,
  applyMove,
} from "@/logic/gameLogic";
import { getBestMove } from "@/logic/aiLogic";
import Board3D from "@/components/Board3D";
import UIOverlay from "@/components/UIOverlay";

import { Player, type Piece, type Move, type ExtendedGameState } from "@/types";
import { useWindowSize } from "@/lib/hooks";

const isDev = process.env.NODE_ENV === "development";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<ExtendedGameState>({
    board: createInitialBoard(),
    turn: Player.RED,
    selectedPiece: null,
    validMoves: [],
    gameOver: false,
    winner: null,
    aiThinking: false,
    lastMove: null,
    dyingPieces: [],
    started: false,
  });

  const { width } = useWindowSize();

  const fov = width < 1024 ? (width < 768 ? 75 : 55) : 40;

  const boardRef = useRef(gameState.board);
  boardRef.current = gameState.board;

  const checkGameOver = (board: (Piece | null)[][], turn: Player) => {
    const moves = getValidMoves(board, turn);
    if (moves.length === 0) {
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        winner: turn === Player.RED ? Player.BLACK : Player.RED,
      }));
      return true;
    }
    return false;
  };

  const handlePieceClick = (piece: Piece) => {
    if (
      gameState.gameOver ||
      gameState.aiThinking ||
      piece.player !== gameState.turn
    ) {
      return;
    }

    if (gameState.selectedPiece?.id === piece.id) {
      setGameState((prev) => ({
        ...prev,
        selectedPiece: null,
        validMoves: [],
      }));
    } else {
      const moves = getValidMoves(gameState.board, gameState.turn, piece);
      setGameState((prev) => ({
        ...prev,
        selectedPiece: piece,
        validMoves: moves,
      }));
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameState.selectedPiece) {
      const move = gameState.validMoves.find(
        (m) => m.to.row === row && m.to.col === col,
      );
      if (move) {
        void performMove(move);
      }
    }
  };

  const performMove = async (move: Move) => {
    const capturedPiece = move.captured
      ? gameState.board[move.captured.row]?.[move.captured.col]
      : null;
    const { newBoard, wasJump } = applyMove(gameState.board, move);

    if (!gameState.started) {
      setGameState((prev) => ({ ...prev, started: true }));
    }

    if (capturedPiece) {
      setGameState((prev) => ({
        ...prev,
        dyingPieces: [...prev.dyingPieces, capturedPiece],
      }));
      // Wait for jump animation
      await new Promise((r) => setTimeout(r, 500));
      setGameState((prev) => ({
        ...prev,
        dyingPieces: prev.dyingPieces.filter((p) => p.id !== capturedPiece.id),
      }));
    }

    if (wasJump) {
      const updatedPiece = newBoard[move.to.row]?.[move.to.col];
      if (!updatedPiece) return;
      const nextJumps = getValidMoves(
        newBoard,
        gameState.turn,
        updatedPiece,
      ).filter((m) => !!m.captured);
      if (nextJumps.length > 0) {
        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          selectedPiece: updatedPiece,
          validMoves: nextJumps,
          lastMove: move,
        }));
        return;
      }
    }

    const nextTurn = gameState.turn === Player.RED ? Player.BLACK : Player.RED;

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      turn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      lastMove: move,
    }));

    if (!checkGameOver(newBoard, nextTurn)) {
      if (nextTurn === Player.BLACK) {
        await triggerAI(newBoard);
      } else {
        console.log(`Player moved piece to ${move.to.row},${move.to.col}`);
      }
    }
  };

  const triggerAI = async (currentBoard: (Piece | null)[][]) => {
    setGameState((prev) => ({ ...prev, aiThinking: true }));

    // Small delay to let player realize it's AI turn
    await new Promise((r) => setTimeout(r, 800));

    const bestMove = getBestMove(currentBoard, 4);
    if (bestMove) {
      let workingBoard = currentBoard;
      let currentMove = bestMove;

      // Execute sequence of jumps if it's a multi-jump
      while (currentMove) {
        const captured = currentMove.captured
          ? workingBoard[currentMove.captured.row]?.[currentMove.captured.col]
          : null;
        const { newBoard, wasJump } = applyMove(workingBoard, currentMove);

        if (captured) {
          setGameState((prev) => ({
            ...prev,
            dyingPieces: [...prev.dyingPieces, captured],
          }));
        }

        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          lastMove: currentMove,
        }));

        if (captured) {
          await new Promise((r) => setTimeout(r, 450));
          setGameState((prev) => ({
            ...prev,
            dyingPieces: prev.dyingPieces.filter((p) => p.id !== captured.id),
          }));
        }

        workingBoard = newBoard;

        // Chain multi-jumps one by one
        let nextJumps: Move[] = [];
        if (wasJump) {
          const piece = workingBoard[currentMove.to.row]?.[currentMove.to.col];
          if (piece) {
            nextJumps = getValidMoves(workingBoard, Player.BLACK, piece).filter(
              (m) => !!m.captured,
            );
          }
        }

        if (nextJumps.length > 0) {
          await new Promise((r) => setTimeout(r, 600)); // Pause between jumps
          currentMove = nextJumps[0]!;
        } else {
          break;
        }
      }

      const nextTurn = Player.RED;
      setGameState((prev) => ({
        ...prev,
        turn: nextTurn,
        aiThinking: false,
      }));

      checkGameOver(workingBoard, nextTurn);
      console.log("The CPU strikes back.");
    } else {
      setGameState((prev) => ({
        ...prev,
        aiThinking: false,
        gameOver: true,
        winner: Player.RED,
      }));
    }
  };

  const restartGame = () => {
    setGameState({
      board: createInitialBoard(),
      turn: Player.RED,
      selectedPiece: null,
      validMoves: [],
      gameOver: false,
      winner: null,
      aiThinking: false,
      lastMove: null,
      dyingPieces: [],
      started: false,
    });
  };

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping }}
      >
        {isDev && <Stats />}
        <PerspectiveCamera makeDefault position={[0, 11, 11]} fov={fov} />
        <OrbitControls
          maxPolarAngle={Math.PI / 2.25}
          minDistance={7}
          maxDistance={20}
          enablePan={false}
          makeDefault
          enableDamping
          dampingFactor={0.05}
        />

        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 12, 35]} />

        {/* Main dynamic lights */}
        <group rotation={[0, gameState.turn === Player.RED ? 0 : Math.PI, 0]}>
          <spotLight
            position={[10, 15, 10]}
            angle={0.35}
            penumbra={0.6}
            castShadow
            intensity={2.5}
            shadow-mapSize={2048}
            color={gameState.turn === Player.RED ? "#ffedd5" : "#e0f2fe"}
          />
        </group>

        <pointLight position={[-12, 6, -12]} intensity={0.7} color="#581c87" />
        <ambientLight intensity={0.4} />

        <Environment preset="night" blur={0.8} />

        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.1}>
          <Board3D
            board={gameState.board}
            selectedPiece={gameState.selectedPiece}
            validMoves={gameState.validMoves}
            dyingPieces={gameState.dyingPieces}
            lastMove={gameState.lastMove}
            onPieceClick={handlePieceClick}
            onSquareClick={handleSquareClick}
          />
        </Float>

        <ContactShadows
          position={[0, -0.45, 0]}
          resolution={512}
          scale={15}
          blur={2}
          opacity={0.8}
          far={10}
          color="#000"
        />
      </Canvas>

      <UIOverlay gameState={gameState} onRestart={restartGame} />
    </div>
  );
};

export default App;
