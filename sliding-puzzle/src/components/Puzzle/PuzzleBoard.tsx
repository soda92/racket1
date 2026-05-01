import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { PuzzleTile } from "./PuzzleTile";
import type { GridSize } from "../../utils/gameLogic";

interface PuzzleBoardProps {
  grid: number[];
  size: GridSize;
  imageTiles: string[];
  imageUrl: string;
  showPreview: boolean;
  hasWon: boolean;
  moves: number;
  timeFormatted: string;
  onTileClick: (index: number) => void;
  onRestart: () => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  grid,
  size,
  imageTiles,
  imageUrl,
  showPreview,
  hasWon,
  moves,
  timeFormatted,
  onTileClick,
  onRestart,
}) => {
  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div
        className="relative w-full aspect-square bg-black/40 rounded-2xl overflow-hidden border-4 md:border-8 border-white/5 shadow-2xl"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
          gridTemplateRows: `repeat(${size.rows}, 1fr)`,
          gap: "1px",
        }}
      >
        <AnimatePresence mode="popLayout">
          {grid.map((tileIndex, posIndex) => (
            <PuzzleTile
              key={tileIndex === -1 ? "empty" : tileIndex}
              tileIndex={tileIndex}
              imageTile={imageTiles[tileIndex]}
              onClick={() => onTileClick(posIndex)}
            />
          ))}
        </AnimatePresence>

        {/* Preview Overlay */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 pointer-events-none"
            >
              <img src={imageUrl} alt="Reference" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[2px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {hasWon && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
            </motion.div>
            <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">UNBELIEVABLE!</h2>
            <p className="text-slate-300 mb-8 max-w-xs mx-auto">
              You solved this masterpiece in {moves} moves and {timeFormatted}.
            </p>
            <button
              onClick={onRestart}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all active:scale-95 uppercase tracking-tighter"
            >
              Challenge Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
