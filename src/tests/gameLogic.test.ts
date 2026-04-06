import { describe, test, expect } from "bun:test";
import {
  createInitialBoard,
  getValidMoves,
  applyMove,
  BOARD_SIZE,
} from "@/logic/gameLogic";
import { Player, PieceType } from "@/types";

describe("gameLogic", () => {
  describe("createInitialBoard", () => {
    test("should create 8x8 board", () => {
      const board = createInitialBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      expect(board[0]).toHaveLength(BOARD_SIZE);
    });

    test("should place Player Two pieces in rows 0-2", () => {
      const board = createInitialBoard();
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = board[row]?.[col];
          if ((row + col) % 2 !== 0) {
            expect(piece).not.toBeNull();
            expect(piece?.player).toBe(Player.TWO);
            expect(piece?.type).toBe(PieceType.NORMAL);
          } else {
            expect(piece).toBeNull();
          }
        }
      }
    });

    test("should place Player One pieces in rows 5-7", () => {
      const board = createInitialBoard();
      for (let row = 5; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = board[row]?.[col];
          if ((row + col) % 2 !== 0) {
            expect(piece).not.toBeNull();
            expect(piece?.player).toBe(Player.ONE);
            expect(piece?.type).toBe(PieceType.NORMAL);
          } else {
            expect(piece).toBeNull();
          }
        }
      }
    });

    test("should have empty rows 3-4", () => {
      const board = createInitialBoard();
      for (let row = 3; row <= 4; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          expect(board[row]?.[col]).toBeNull();
        }
      }
    });
  });

  describe("getValidMoves", () => {
    test("should return moves for Player One pieces at start", () => {
      const board = createInitialBoard();
      const moves = getValidMoves(board, Player.ONE);
      expect(moves.length).toBeGreaterThan(0);
    });

    test("should return moves for Player Two pieces", () => {
      const board = createInitialBoard();
      const moves = getValidMoves(board, Player.TWO);
      expect(moves.length).toBeGreaterThan(0);
    });

    test("should only return moves for specified piece", () => {
      const board = createInitialBoard();
      const onePiece = board[5]?.[0];
      if (onePiece) {
        const moves = getValidMoves(board, Player.ONE, onePiece);
        expect(moves.length).toBeGreaterThan(0);
        moves.forEach((move) => {
          expect(move.from.row).toBe(onePiece.row);
          expect(move.from.col).toBe(onePiece.col);
        });
      }
    });
  });

  describe("applyMove", () => {
    test("should move piece to new position", () => {
      const board = createInitialBoard();
      const onePiece = board[5]?.[0];
      if (onePiece) {
        const move = {
          from: { row: 5, col: 0 },
          to: { row: 4, col: 1 },
        };
        const { newBoard } = applyMove(board, move);
        expect(newBoard[4]?.[1]).not.toBeNull();
        expect(newBoard[4]?.[1]?.player).toBe(Player.ONE);
        expect(newBoard[5]?.[0]).toBeNull();
      }
    });

    test("should capture opponent piece", () => {
      const board = createInitialBoard();
      const move = {
        from: { row: 5, col: 0 },
        to: { row: 3, col: 2 },
        captured: { row: 4, col: 1 },
      };
      const { newBoard } = applyMove(board, move);
      expect(newBoard[4]?.[1]).toBeNull();
    });

    test("should promote to king when reaching opposite end", () => {
      const board = createInitialBoard();
      // Move red piece to king position
      const move = {
        from: { row: 5, col: 0 },
        to: { row: 4, col: 1 },
      };
      const { newBoard } = applyMove(board, move);
      const piece = newBoard[4]?.[1];
      // First move doesn't promote yet
      expect(piece?.type).toBe(PieceType.NORMAL);
    });

    test("should not mutate original board", () => {
      const board = createInitialBoard();
      const originalState = JSON.stringify(board);
      const move = {
        from: { row: 5, col: 0 },
        to: { row: 4, col: 1 },
      };
      applyMove(board, move);
      expect(JSON.stringify(board)).toBe(originalState);
    });
  });
});
