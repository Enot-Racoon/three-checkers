import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { cn } from "@/lib/utils";
import { Player, type ExtendedGameState } from "@/types";

interface UIOverlayProps {
  gameState: ExtendedGameState;
  onRestart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, onRestart }) => {
  const redCount = gameState.board
    .flat()
    .filter((p) => p?.player === Player.RED).length;
  const blackCount = gameState.board
    .flat()
    .filter((p) => p?.player === Player.BLACK).length;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-10 font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl shadow-2xl flex items-center space-x-6">
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">
              Player
            </span>
            <div
              className={`w-12 h-4 rounded-full mt-1 ${gameState.turn === Player.RED ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-zinc-700"}`}
            />
            <span className="text-xl font-black mt-1">{redCount}</span>
          </div>
          <div className="h-10 w-px bg-zinc-800" />
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">
              CPU
            </span>
            <div
              className={`w-12 h-4 rounded-full mt-1 ${gameState.turn === Player.BLACK ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-zinc-700"}`}
            />
            <span className="text-xl font-black mt-1">{blackCount}</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          hidden={!gameState.started && !gameState.gameOver}
          className="bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-zinc-800 p-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 text-zinc-400 hover:text-white cursor-pointer"
        >
          <FontAwesomeIcon icon={faRotateRight} size="lg" color="white" />
        </button>
      </div>

      {/* Middle Alerts */}
      <div className="flex flex-col items-center space-y-4">
        {gameState.gameOver && (
          <div className="pointer-events-auto bg-black/90 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm animate-in fade-in zoom-in duration-300">
            <h2 className="text-4xl font-black mb-2 italic">GAME OVER</h2>
            <p className="text-zinc-400 mb-6">
              {gameState.winner === Player.RED
                ? "You actually won? I must have glitched."
                : "Predictable. Better luck next century."}
            </p>
            <button
              onClick={onRestart}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              REMATCH
            </button>
          </div>
        )}
      </div>

      {/* Bottom Personality Box */}
      <div
        className={cn("flex justify-center transition-all duration-500 -mb-6", {
          "-mb-28": !gameState.aiThinking,
        })}
      >
        <div className="pointer-events-auto max-w-sm w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl shadow-2xl flex items-center space-x-4">
          <div className="flex-1">
            <div className="text-center text-lg font-medium leading-tight">
              <span className="text-blue-400 italic">
                Calculating optimal move...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
