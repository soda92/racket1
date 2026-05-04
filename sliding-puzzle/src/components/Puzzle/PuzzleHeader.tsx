import React from "react";
import { motion } from "framer-motion";
import { Maximize, Minimize, Timer, Brain, RefreshCw, Loader2 } from "lucide-react";

interface PuzzleHeaderProps {
  moves: number;
  timeFormatted: string;
  isFullscreen: boolean;
  isSolving: boolean;
  hasWon: boolean;
  onToggleFullscreen: () => void;
  onAutoSolve: () => void;
  onRestart: () => void;
}

export const PuzzleHeader: React.FC<PuzzleHeaderProps> = ({
  moves,
  timeFormatted,
  isFullscreen,
  isSolving,
  hasWon,
  onToggleFullscreen,
  onAutoSolve,
  onRestart,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/10 pb-8">
      <div>
        <div className="flex items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400 tracking-tighter"
          >
            SLIDING PUZZLE
          </motion.h1>
          <button
            onClick={onToggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            title="Full Screen"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-slate-400" />
            ) : (
              <Maximize className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>
        <p className="text-slate-400 mt-2 font-medium">Reassemble the masterpiece.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-6 px-4 py-2 md:px-6 md:py-3 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-center">
            <span className="block text-[8px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              Moves
            </span>
            <span className="text-lg md:text-xl font-mono font-bold text-indigo-400">{moves}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block text-[8px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              Time
            </span>
            <div className="flex items-center gap-2 text-lg md:text-xl font-mono font-bold text-purple-400">
              <Timer className="w-4 h-4" />
              {timeFormatted}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAutoSolve}
            disabled={isSolving || hasWon}
            className="p-3 md:p-4 bg-indigo-500/20 hover:bg-indigo-500/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl transition-all border border-indigo-500/30 active:scale-95 text-indigo-300"
            title="AI Solve"
          >
            {isSolving ? (
              <Loader2 className="w-5 h-5 md:w-6 animate-spin" />
            ) : (
              <Brain className="w-5 h-5 md:w-6" />
            )}
          </button>
          <button
            onClick={onRestart}
            disabled={isSolving}
            className="p-3 md:p-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-2xl transition-all border border-white/10 active:scale-95 group"
            title="Restart Game"
          >
            <RefreshCw
              className={`w-5 h-5 md:w-6 text-slate-300 group-hover:rotate-180 transition-transform duration-500`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
