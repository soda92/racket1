import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, EyeOff, Eye, RefreshCw } from "lucide-react";
import { PuzzleTile } from "./PuzzleTile";
import type { GridSize } from "../../utils/gameLogic";

interface PuzzleBoardProps {
  grid: number[];
  size: GridSize;
  imageTiles: string[];
  imageUrl: string;
  showPreview: boolean;
  hasWon: boolean;
  showSuccessOverlay: boolean;
  moves: number;
  timeFormatted: string;
  onTileClick: (index: number) => void;
  onRestart: () => void;
  onShowPreview: (show: boolean) => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  grid,
  size,
  imageTiles,
  imageUrl,
  showPreview,
  hasWon,
  showSuccessOverlay,
  moves,
  timeFormatted,
  onTileClick,
  onRestart,
  onShowPreview,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative w-full max-w-full overflow-hidden shadow-2xl rounded-3xl border-4 md:border-8 border-white/5 bg-slate-900/50">
        <div
          className="relative w-full aspect-square overflow-hidden"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
            gridTemplateRows: `repeat(${size.rows}, 1fr)`,
            gap: "1px",
          }}
        >
          {/* Always show the grid or the full image based on hasWon */}
          {!hasWon ? (
            grid.map((tileIndex, posIndex) => (
              <PuzzleTile
                key={tileIndex === -1 ? "empty" : tileIndex}
                tileIndex={tileIndex}
                imageTile={imageTiles[tileIndex]}
                onClick={() => onTileClick(posIndex)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              <img src={imageUrl} alt="Completed" className="w-full h-full object-cover" />
            </motion.div>
          )}

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

          {/* Success Overlay (Floating Card) */}
          <AnimatePresence>
            {hasWon && showSuccessOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[4px] flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.8, y: 20, opacity: 0 }}
                  className="bg-slate-900/90 border border-white/20 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center max-w-sm w-full"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  >
                    <Trophy className="w-16 h-16 text-yellow-500 mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">VICTORY!</h2>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    A masterstroke! You solved this in <span className="text-indigo-400 font-bold">{moves}</span> moves and <span className="text-purple-400 font-bold">{timeFormatted}</span>.
                  </p>
                  <button
                    onClick={onRestart}
                    className="group flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all active:scale-95 uppercase tracking-tighter"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    New Masterpiece
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview Button below puzzle */}
      <div className="flex justify-center">
        <button
          onMouseDown={() => onShowPreview(true)}
          onMouseUp={() => onShowPreview(false)}
          onMouseLeave={() => onShowPreview(false)}
          onTouchStart={() => onShowPreview(true)}
          onTouchEnd={() => onShowPreview(false)}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all shadow-lg active:scale-95 select-none"
        >
          {showPreview ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-500" />}
          <span>Hold to Preview</span>
        </button>
      </div>
    </div>
  );
};
