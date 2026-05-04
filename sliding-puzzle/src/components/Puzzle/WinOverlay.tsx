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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-md"
    >
      <div className="relative w-full max-w-5xl flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="w-full flex flex-col items-center"
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20 mb-4"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tighter mb-2">
              MASTERPIECE RESTORED!
            </h2>
            <p className="text-slate-400 font-medium">You solved the puzzle with precision and style.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 w-full">
            {/* The Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 aspect-auto bg-slate-900 flex items-center justify-center"
            >
              <img
                src={sourceImageUrl}
                alt="Masterpiece"
                className="max-w-full max-h-[60vh] object-contain block"
              />
            </motion.div>

            {/* Stats and Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <Hash className="w-4 h-4 text-indigo-400" /> Moves
                  </span>
                  <span className="text-3xl font-black text-white">{moves}</span>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <Timer className="w-4 h-4 text-purple-400" /> Time
                  </span>
                  <span className="text-3xl font-black text-white">{timeFormatted}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={onRestart}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" /> Play Again
                </button>
                <button
                  onClick={onNewGame}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-black text-xs uppercase tracking-widest active:scale-95 text-slate-300"
                >
                  <ImageIcon className="w-5 h-5" /> New Puzzle
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
