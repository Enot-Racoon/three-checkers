import { Player, PieceType, type Move, type Piece, type Board } from "@/types";

export const BOARD_SIZE = 8;

export const createInitialBoard = (): Board => {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 !== 0) {
        const boardRow = board[row];
        if (!boardRow) {
          throw new Error("Invalid board state");
        }
        if (row < 3) {
          boardRow[col] = {
            id: `two-${row}-${col}`,
            player: Player.TWO,
            type: PieceType.NORMAL,
            row,
            col,
          };
        } else if (row > 4) {
          boardRow[col] = {
            id: `one-${row}-${col}`,
            player: Player.ONE,
            type: PieceType.NORMAL,
            row,
            col,
          };
        }
      }
    }
  }
  return board;
};

export const getValidMoves = (
  board: Board,
  player: Player,
  piece: Piece | null = null,
): Move[] => {
  const moves: Move[] = [];
  const pieces = piece
    ? [piece]
    : (board
        .flat()
        .filter((p) => p !== null && p.player === player) as Piece[]);

  let jumpFound = false;

  // Jump moves check
  for (const p of pieces) {
    const jumps = getJumpMoves(board, p);
    if (jumps.length > 0) {
      if (!jumpFound) {
        moves.length = 0; // Clear normal moves if a jump is found
        jumpFound = true;
      }
      moves.push(...jumps);
    }

    if (!jumpFound) {
      moves.push(...getNormalMoves(board, p));
    }
  }

  return moves;
};

const getNormalMoves = (board: Board, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const directions =
    piece.type === PieceType.KING
      ? [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      : piece.player === Player.TWO
        ? [
            [1, 1],
            [1, -1],
          ]
        : [
            [-1, 1],
            [-1, -1],
          ];

  for (const [dr, dc] of directions) {
    const nr = piece.row + (dr ?? 0);
    const nc = piece.col + (dc ?? 0);
    if (isValidPosition(nr, nc) && board[nr]?.[nc] === null) {
      moves.push({
        from: { row: piece.row, col: piece.col },
        to: { row: nr, col: nc },
      });
    }
  }
  return moves;
};

const getDirections = (piece: Piece) => {
  if (piece.type === PieceType.KING) {
    return [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
  }

  if (piece.player === Player.TWO) {
    return [
      [1, 1],
      [1, -1],
    ];
  }

  return [
    [-1, 1],
    [-1, -1],
  ];
};

const getJumpMoves = (board: Board, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const directions = getDirections(piece);

  for (const [dr, dc] of directions) {
    const midR = piece.row + (dr ?? 0);
    const midC = piece.col + (dc ?? 0);
    const endR = piece.row + (dr ?? 0) * 2;
    const endC = piece.col + (dc ?? 0) * 2;

    if (isValidPosition(endR, endC) && board[endR]?.[endC] === null) {
      const captured = board[midR]?.[midC];
      if (captured && captured.player !== piece.player) {
        moves.push({
          from: { row: piece.row, col: piece.col },
          to: { row: endR, col: endC },
          captured: { row: midR, col: midC },
        });
      }
    }
  }
  return moves;
};

const isValidPosition = (row: number, col: number) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};
export const applyMove = (
  board: Board,
  move: Move,
): { newBoard: Board; wasJump: boolean } => {
  const newBoard = board.map((row) => [...row]);
  const rowToMove = newBoard[move.to.row];
  const rowFromMove = newBoard[move.from.row];

  if (!rowToMove || !rowFromMove) {
    throw new Error("Invalid move");
  }
  const piece = rowFromMove[move.from.col]!;

  rowToMove[move.to.col] = {
    ...piece,
    row: move.to.row,
    col: move.to.col,
  };
  rowFromMove[move.from.col] = null;

  let wasJump = false;
  if (move.captured) {
    const rowToCapture = newBoard[move.captured.row];
    if (!rowToCapture) {
      throw new Error("Invalid move");
    }
    rowToCapture[move.captured.col] = null;
    wasJump = true;
  }

  // Check King promotion
  const updatedPiece = rowToMove[move.to.col]!;
  if (updatedPiece.player === Player.TWO && move.to.row === 7) {
    updatedPiece.type = PieceType.KING;
  } else if (updatedPiece.player === Player.ONE && move.to.row === 0) {
    updatedPiece.type = PieceType.KING;
  }

  return { newBoard, wasJump };
};
