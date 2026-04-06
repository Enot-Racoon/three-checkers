import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { Player, PieceType, type Piece, type Move } from "@/types";
import {
  COLOR_BOARD_FRAME,
  COLOR_SQUARE_LIGHT,
  COLOR_SQUARE_DARK,
  COLOR_HIGHLIGHT_VALID_MOVE,
  COLOR_HIGHLIGHT_LAST_MOVE,
  COLOR_PIECE_RED,
  COLOR_PIECE_RED_EMISSIVE,
  COLOR_PIECE_RED_RING,
  COLOR_PIECE_BLACK,
  COLOR_PIECE_BLACK_EMISSIVE,
  COLOR_PIECE_BLACK_RING,
  COLOR_PIECE_BLACK_DYING,
  COLOR_KING_CROWN,
  COLOR_KING_CROWN_TORUS,
  COLOR_SELECTION_RING,
  COLOR_EMISSIVE_NONE,
  COLOR_DYING_GLOW,
} from "@/app/colors";

interface Board3DProps {
  board: (Piece | null)[][];
  selectedPiece: Piece | null;
  validMoves: Move[];
  dyingPieces: Piece[];
  lastMove: Move | null;
  onPieceClick: (piece: Piece) => void;
  onSquareClick: (row: number, col: number) => void;
}

const Board3D: React.FC<Board3DProps> = ({
  board,
  selectedPiece,
  validMoves,
  dyingPieces,
  lastMove,
  onPieceClick,
  onSquareClick,
}) => {
  const size = 8;
  const offset = (size - 1) / 2;

  const squares = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isDark = (r + c) % 2 !== 0;
      const isValidTarget = validMoves.some(
        (m) => m.to.row === r && m.to.col === c,
      );
      const isLastMoveHighlight =
        (lastMove?.from.row === r && lastMove?.from.col === c) ||
        (lastMove?.to.row === r && lastMove?.to.col === c);

      squares.push(
        <Square
          key={`sq-${r}-${c}`}
          row={r}
          col={c}
          offset={offset}
          isDark={isDark}
          isValidTarget={isValidTarget}
          isLastMove={isLastMoveHighlight}
          onClick={() => onSquareClick(r, c)}
        />,
      );
    }
  }

  const pieces: React.ReactNode[] = [];
  board.flat().forEach((p) => {
    if (p) {
      const isSelected = selectedPiece?.id === p.id;
      pieces.push(
        <CheckersPiece
          key={p.id}
          piece={p}
          isSelected={isSelected}
          onClick={() => onPieceClick(p)}
          offset={offset}
        />,
      );
    }
  });

  const dying = dyingPieces.map((p) => (
    <DyingPiece key={`dying-${p.id}`} piece={p} offset={offset} />
  ));

  return (
    <group>
      {squares}
      {pieces}
      {dying}
      {/* Board Base */}
      <mesh position={[0, -0.26, 0]} receiveShadow>
        <boxGeometry args={[size + 1.2, 0.4, size + 1.2]} />
        <meshPhysicalMaterial
          color={COLOR_BOARD_FRAME}
          roughness={0.05}
          metalness={0.9}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
    </group>
  );
};

interface SquareProps {
  row: number;
  col: number;
  offset: number;
  isDark: boolean;
  isValidTarget: boolean;
  isLastMove: boolean;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({
  row,
  col,
  offset,
  isDark,
  isValidTarget,
  isLastMove,
  onClick,
}) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (materialRef.current && (isValidTarget || isLastMove)) {
      const pulseSpeed = isValidTarget ? 5 : 2;
      const pulse = (Math.sin(state.clock.elapsedTime * pulseSpeed) + 1) / 2;
      materialRef.current.emissiveIntensity =
        (isValidTarget ? 0.3 : 0.1) + pulse * (isValidTarget ? 0.7 : 0.4);
    }
  });

  const baseColor = isDark ? COLOR_SQUARE_DARK : COLOR_SQUARE_LIGHT;
  const emissiveColor = isValidTarget
    ? COLOR_HIGHLIGHT_VALID_MOVE
    : isLastMove
      ? COLOR_HIGHLIGHT_LAST_MOVE
      : COLOR_EMISSIVE_NONE;

  return (
    <mesh
      position={[col - offset, -0.1, row - offset]}
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        color={baseColor}
        roughness={isDark ? 0.1 : 0.8}
        metalness={isDark ? 0.8 : 0.1}
        emissive={emissiveColor}
        emissiveIntensity={0}
      />
    </mesh>
  );
};

interface PieceProps {
  piece: Piece;
  isSelected: boolean;
  onClick: () => void;
  offset: number;
}

const CheckersPiece: React.FC<PieceProps> = ({
  piece,
  isSelected,
  onClick,
  offset,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const targetX = piece.col - offset;
  const targetZ = piece.row - offset;

  useFrame((state, delta) => {
    if (groupRef.current) {
      const currentPos = groupRef.current.position;

      const dx = targetX - currentPos.x;
      const dz = targetZ - currentPos.z;
      const distanceToTarget = Math.sqrt(dx * dx + dz * dz);

      // Horizontal movement speed
      const moveSpeed = 9;
      currentPos.x = THREE.MathUtils.lerp(
        currentPos.x,
        targetX,
        delta * moveSpeed,
      );
      currentPos.z = THREE.MathUtils.lerp(
        currentPos.z,
        targetZ,
        delta * moveSpeed,
      );

      // Vertical "Hop" logic
      // We are "moving" if the distance is significant
      const isMoving = distanceToTarget > 0.05;
      const targetY = isSelected ? 0.6 : 0.14;

      // Calculate hop offset: higher when in the middle of a move
      // We simulate a parabola based on how far we are from the target logic cell
      // Since pieces are grid-aligned, a jump is usually distance ~1.4 or ~2.8
      const maxHopHeight = isMoving ? 0.7 : 0;
      // We use a sine wave that peaks when the piece is between its current visual position and its logic target
      const hopY =
        Math.sin(Math.min(1, 1 - distanceToTarget / 1.414) * Math.PI) *
        maxHopHeight;

      currentPos.y = THREE.MathUtils.lerp(
        currentPos.y,
        targetY + Math.max(0, hopY),
        delta * 15,
      );

      // Selected floating & spinning
      if (isSelected) {
        groupRef.current.position.y +=
          Math.sin(state.clock.elapsedTime * 4) * 0.04;
        groupRef.current.rotation.y += delta * 1.5;
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          0,
          delta * 5,
        );
      }
    }

    if (materialRef.current && isSelected) {
      const glow = (Math.sin(state.clock.elapsedTime * 6) + 1) / 2;
      materialRef.current.emissiveIntensity = 0.8 + glow * 1.5;
    }
  });

  const color =
    piece.player === Player.RED ? COLOR_PIECE_RED : COLOR_PIECE_BLACK;
  const emissive =
    piece.player === Player.RED
      ? COLOR_PIECE_RED_EMISSIVE
      : COLOR_PIECE_BLACK_EMISSIVE;

  return (
    <group
      ref={groupRef}
      position={[piece.col - offset, 0.14, piece.row - offset]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.44, 0.44, 0.24, 64]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color={color}
          roughness={0.05}
          metalness={0.5}
          emissive={isSelected ? emissive : COLOR_EMISSIVE_NONE}
          emissiveIntensity={0}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
        />
      </mesh>

      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.38, 32]} />
        <meshStandardMaterial
          color={
            piece.player === Player.RED
              ? COLOR_PIECE_RED_RING
              : COLOR_PIECE_BLACK_RING
          }
          roughness={0.4}
        />
      </mesh>

      {piece.type === PieceType.KING && (
        <group position={[0, 0.18, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.38, 0.12, 32]} />
            <meshStandardMaterial
              color={COLOR_KING_CROWN}
              metalness={1}
              roughness={0}
            />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.04, 16, 48]} />
            <meshStandardMaterial
              color={COLOR_KING_CROWN_TORUS}
              metalness={1}
              roughness={0}
            />
          </mesh>
        </group>
      )}

      {isSelected && (
        <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.72, 64]} />
          <meshBasicMaterial
            color={COLOR_SELECTION_RING}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
};

const DyingPiece: React.FC<{ piece: Piece; offset: number }> = ({
  piece,
  offset,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.multiplyScalar(0.92);
      meshRef.current.position.y += 0.02;
      meshRef.current.rotation.y += delta * 12;
    }
  });

  const color =
    piece.player === Player.RED ? COLOR_PIECE_RED : COLOR_PIECE_BLACK_DYING;

  return (
    <mesh
      ref={meshRef}
      position={[piece.col - offset, 0.3, piece.row - offset]}
      castShadow
    >
      <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        emissive={COLOR_DYING_GLOW}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
};

export default Board3D;
