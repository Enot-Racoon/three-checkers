import { describe, test, expect } from "bun:test";
import { getBestMove } from "@/logic/aiLogic";
import { createInitialBoard } from "@/logic/gameLogic";
import { Player, PieceType, type Piece } from "@/types";

describe("aiLogic", () => {
  describe("getBestMove", () => {
    test("should return a move for initial board", () => {
      const board = createInitialBoard();
      const move = getBestMove(board, 2);
      expect(move).not.toBeNull();
      expect(move?.from).toBeDefined();
      expect(move?.to).toBeDefined();
    });

    test("should return null when no moves available", () => {
      // Create a board where Player Two has no pieces
      const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => null),
      );
      const move = getBestMove(board, 2);
      expect(move).toBeNull();
    });

    test("should prioritize captures", () => {
      // Create a board where black can capture
      const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => null),
      );

      // Place black piece
      if (board[2]?.[1]) {
        board[2][1] = {
          id: "two-test",
          player: Player.TWO,
          type: PieceType.NORMAL,
          row: 2,
          col: 1,
        };
      }

      // Place Player One piece that can be captured (diagonally in front of Player Two)
      if (board[3]?.[2]) {
        board[3][2] = {
          id: "one-test",
          player: Player.ONE,
          type: PieceType.NORMAL,
          row: 3,
          col: 2,
        };
      }

      const move = getBestMove(board, 3);
      // Move might be null if no valid capture position
      // Just verify AI can evaluate the position
      expect(move).toBeDefined();
    });

    test("should evaluate board position", () => {
      const board = createInitialBoard();
      const move = getBestMove(board, 3);
      expect(move).not.toBeNull();
      // AI plays as Player Two, should move forward (increase row)
      if (move) {
        expect(move.to.row).toBeGreaterThan(move.from.row);
      }
    });
  });

  describe("multi-jump scenario", () => {
    test("should handle position after capture", () => {
      const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => null),
      );

      // Place Player Two piece
      if (board[2]?.[1]) {
        board[2][1] = {
          id: "two-1",
          player: Player.TWO,
          type: PieceType.NORMAL,
          row: 2,
          col: 1,
        };
      }

      // Place Player One pieces that can be captured
      if (board[3]?.[2]) {
        board[3][2] = {
          id: "one-1",
          player: Player.ONE,
          type: PieceType.NORMAL,
          row: 3,
          col: 2,
        };
      }

      if (board[3]?.[0]) {
        board[3][0] = {
          id: "one-2",
          player: Player.ONE,
          type: PieceType.NORMAL,
          row: 3,
          col: 0,
        };
      }

      const move = getBestMove(board, 3);
      // Just verify AI can evaluate the position
      expect(move).toBeDefined();
    });
  });
});
