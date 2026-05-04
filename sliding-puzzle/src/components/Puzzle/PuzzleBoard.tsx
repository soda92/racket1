import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Eye } from "lucide-react";
import confetti from "canvas-confetti";
import { PuzzleTile } from "./PuzzleTile";
import type { GridSize } from "../../utils/gameLogic";

interface PuzzleBoardProps {
  grid: number[];
  size: GridSize;
  imageTiles: string[];
  imageUrl: string;
  showPreview: boolean;
  hasWon: boolean;
  onTileClick: (index: number) => void;
  onShowPreview: (show: boolean) => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  grid,
  size,
  imageTiles,
  imageUrl,
  showPreview,
  hasWon,
  onTileClick,
  onShowPreview,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative w-full max-w-full overflow-hidden shadow-2xl rounded-3xl border-4 md:border-8 border-white/5 bg-slate-900/50">
        <div
          className="relative w-full overflow-hidden"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
            gridTemplateRows: `repeat(${size.rows}, 1fr)`,
            gap: "1px",
            aspectRatio: `${size.cols} / ${size.rows}`,
          }}
        >
          {/* Always show the grid. When won, the empty tile is replaced by the last tile index */}
          {grid.map((tileIndex, posIndex) => (
            <PuzzleTile
              key={tileIndex === -1 ? "empty" : tileIndex}
              tileIndex={tileIndex}
              imageTile={imageTiles[tileIndex === -1 && hasWon ? size.rows * size.cols - 1 : tileIndex]}
              onClick={() => onTileClick(posIndex)}
            />
          ))}

          {/* Preview Overlay */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 pointer-events-none"
              >
                <img 
                  src={imageUrl} 
                  alt="Reference" 
                  className="w-full h-full object-cover opacity-60" 
                />
                <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[2px]" />
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
