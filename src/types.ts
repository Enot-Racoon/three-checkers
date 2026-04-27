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

export interface Move {
  from: Position;
  to: Position;
  captured?: Position;
}

export type Board = (Piece | null)[][];

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
