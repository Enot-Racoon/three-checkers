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

import {
  Player,
  type Piece,
  type Move,
  type ExtendedGameState,
  type Board,
} from "@/types";
import { useWindowSize } from "@/lib/hooks";
import * as Colors from "@/app/colors";

const isDev = process.env.NODE_ENV === "development";

const getFow = (width: number) => {
  return width < 1024 ? (width < 768 ? 75 : 55) : 40;
};

const useGame = () => {
  const [gameState, setGameState] = useState<ExtendedGameState>({
    board: createInitialBoard(),
    turn: Player.ONE,
    selectedPiece: null,
    validMoves: [],
    gameOver: false,
    winner: null,
    aiThinking: false,
    lastMove: null,
    dyingPieces: [],
    started: false,
  });

  const checkGameOver = (board: Board, turn: Player) => {
    const moves = getValidMoves(board, turn);
    if (moves.length === 0) {
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        winner: turn === Player.ONE ? Player.TWO : Player.ONE,
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
        (m) => m.steps[0]?.to.row === row && m.steps[0]?.to.col === col,
      );
      if (move) {
        void performMove(move);
      }
    }
  };

  const performMove = async (move: Move) => {
    const [step] = move.steps;
    if (!step) return;

    const capturedPiece = step.captured
      ? gameState.board[step.captured.row]?.[step.captured.col]
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
      const updatedPiece = newBoard[step.to.row]?.[step.to.col];
      if (!updatedPiece) return;
      const nextJumps = getValidMoves(
        newBoard,
        gameState.turn,
        updatedPiece,
      ).filter((m) => m.steps.some((s) => !!s.captured));
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

    const nextTurn = gameState.turn === Player.ONE ? Player.TWO : Player.ONE;

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      turn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      lastMove: move,
    }));

    if (!checkGameOver(newBoard, nextTurn)) {
      if (nextTurn === Player.TWO) {
        await triggerAI(newBoard);
      } else {
        console.log(`Player moved piece to ${step.to.row},${step.to.col}`);
      }
    }
  };

  const triggerAI = async (currentBoard: Board) => {
    setGameState((prev) => ({ ...prev, aiThinking: true }));

    // Small delay to let player realize it's AI turn
    await new Promise((r) => setTimeout(r, 800));

    const bestMove = getBestMove(currentBoard, 4);
    if (bestMove) {
      let workingBoard = currentBoard;
      let currentMove = bestMove;
      const [step] = currentMove.steps;

      // Execute sequence of jumps if it's a multi-jump
      while (currentMove && step) {
        const captured = step.captured
          ? workingBoard[step.captured.row]?.[step.captured.col]
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
          const piece = workingBoard[step.to.row]?.[step.to.col];
          if (piece) {
            nextJumps = getValidMoves(workingBoard, Player.TWO, piece).filter(
              (m) => m.steps.some((s) => !!s.captured),
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

      const nextTurn = Player.ONE;
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
        winner: Player.ONE,
      }));
    }
  };

  const restartGame = () => {
    setGameState({
      board: createInitialBoard(),
      turn: Player.ONE,
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

  return {
    gameState,
    handlePieceClick,
    handleSquareClick,
    performMove,
    restartGame,
  };
};

const App: React.FC = () => {
  const { gameState, handlePieceClick, handleSquareClick, restartGame } =
    useGame();

  const boardRef = useRef(gameState.board);
  boardRef.current = gameState.board;
  const { width } = useWindowSize();

  const fov = getFow(width);

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        shadows
        dpr={[1, 1.5]}
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

        <color attach="background" args={[Colors.BACKGROUND]} />
        <fog attach="fog" args={[Colors.BACKGROUND, 12, 35]} />

        {/* Main dynamic lights */}
        <group rotation={[0, gameState.turn === Player.ONE ? 0 : Math.PI, 0]}>
          <spotLight
            position={[10, 15, 10]}
            angle={0.35}
            penumbra={0.6}
            castShadow
            intensity={2.5}
            shadow-mapSize={1024}
            color={
              gameState.turn === Player.ONE
                ? Colors.LIGHT_ONE_TURN
                : Colors.LIGHT_TWO_TURN
            }
          />
        </group>

        <pointLight
          position={[-12, 6, -12]}
          intensity={0.7}
          color={Colors.AMBIENT_ACCENT}
        />
        <ambientLight intensity={0.4} />

        <Environment preset="night" resolution={256} />

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
          color={Colors.SHADOW}
        />
      </Canvas>

      <UIOverlay gameState={gameState} onRestart={restartGame} />
    </div>
  );
};

export default App;
