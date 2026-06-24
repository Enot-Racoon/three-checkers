export enum Player {
  ONE = "ONE",
  TWO = "TWO",
}

export enum PieceType {
  NORMAL = "NORMAL",
  KING = "KING",
}

export interface Piece {
  id: string;
  player: Player;
  type: PieceType;
  row: number;
  col: number;
}

export interface Position {
  row: number;
  col: number;
}

export type Step = {
  to: Position;
  captured?: Position;
};

export interface Move {
  from: Position;
  steps: Step[];
}

type BoardCell = Piece | null;
type BoardRow = BoardCell[];
export type Board = BoardRow[];

export interface GameState {
  board: Board;
  turn: Player;
  selectedPiece: Piece | null;
  validMoves: Move[];
  gameOver: boolean;
  winner: Player | null;
  aiThinking: boolean;
}

export interface ExtendedGameState extends GameState {
  started: boolean;
  lastMove: Move | null;
  dyingPieces: Piece[];
}
