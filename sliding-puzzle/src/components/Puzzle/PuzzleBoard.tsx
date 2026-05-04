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
  // Trigger confetti on win
  useEffect(() => {
    if (hasWon) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [hasWon]);

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
              initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ 
                duration: 2.5, 
                ease: [0.16, 1, 0.3, 1], // Cinematic out-expo style
                delay: 0.1
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={imageUrl} 
                alt="Completed" 
                className="w-full h-full object-cover" 
              />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, times: [0, 0.5, 1], delay: 0.3 }}
                className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
              />
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
