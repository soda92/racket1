import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Timer, Hash, RefreshCw, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti";

interface WinOverlayProps {
  moves: number;
  timeFormatted: string;
  sourceImageUrl: string;
  onRestart: () => void;
  onNewGame: () => void;
}

export const WinOverlay: React.FC<WinOverlayProps> = ({
  moves,
  timeFormatted,
  sourceImageUrl,
  onRestart,
  onNewGame,
}) => {
  useEffect(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md px-4 py-8 md:p-8"
    >
      <div className="min-h-full flex items-center justify-center">
        <div className="relative w-full max-w-5xl flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 20 }}
            className="w-full flex flex-col items-center"
          >
            <div className="mb-6 md:mb-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20 mb-4"
              >
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tighter mb-2">
                MASTERPIECE RESTORED!
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-medium">You solved the puzzle with precision and style.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 md:gap-8 w-full">
              {/* The Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 aspect-auto bg-slate-900 flex items-center justify-center"
              >
                <img
                  src={sourceImageUrl}
                  alt="Masterpiece"
                  className="max-w-full max-h-[40vh] md:max-h-[60vh] object-contain block"
                />
              </motion.div>

              {/* Stats and Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-4 md:gap-6"
              >
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                  <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10">
                    <span className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 md:mb-2">
                      <Hash className="w-3 h-3 md:w-4 md:h-4 text-indigo-400" /> Moves
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-white">{moves}</span>
                  </div>
                  <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10">
                    <span className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 md:mb-2">
                      <Timer className="w-3 h-3 md:w-4 md:h-4 text-purple-400" /> Time
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-white">{timeFormatted}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2 md:mt-auto">
                  <button
                    onClick={onRestart}
                    className="w-full flex items-center justify-center gap-3 py-4 md:py-5 rounded-xl md:rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> Play Again
                  </button>
                  <button
                    onClick={onNewGame}
                    className="w-full flex items-center justify-center gap-3 py-4 md:py-5 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95 text-slate-300"
                  >
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5" /> New Puzzle
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
