import { getValidMoves, applyMove } from "./gameLogic";
import { Player, PieceType, type Piece, type Move } from "@/types";

const PIECE_VALUE = 10;
const KING_VALUE = 20;

const evaluateBoard = (board: (Piece | null)[][]): number => {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r]?.[c];
      if (p) {
        const val = p.type === PieceType.KING ? KING_VALUE : PIECE_VALUE;
        score += p.player === Player.TWO ? val : -val;
        // Bonus for advancement
        if (p.type === PieceType.NORMAL) {
          score += (p.player === Player.TWO ? r : 7 - r) * 0.5;
        }
      }
    }
  }
  return score;
};

export const getBestMove = (
  board: (Piece | null)[][],
  depth: number,
): Move | null => {
  const moves = getValidMoves(board, Player.TWO);
  if (moves.length === 0) return null;

  let bestVal = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const { newBoard } = applyMove(board, move);
    const val = minimax(newBoard, depth - 1, false, -Infinity, Infinity);
    if (val > bestVal) {
      bestVal = val;
      bestMove = move;
    }
  }

  return bestMove ?? null;
};

const minimax = (
  board: (Piece | null)[][],
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
): number => {
  if (depth === 0) return evaluateBoard(board);

  const player = isMaximizing ? Player.TWO : Player.ONE;
  const moves = getValidMoves(board, player);

  if (moves.length === 0) return isMaximizing ? -1000 : 1000;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const { newBoard } = applyMove(board, move);
      const evalValue = minimax(newBoard, depth - 1, false, alpha, beta);
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const { newBoard } = applyMove(board, move);
      const evalValue = minimax(newBoard, depth - 1, true, alpha, beta);
      minEval = Math.min(minEval, evalValue);
      beta = Math.min(beta, evalValue);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};
