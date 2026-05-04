import React from "react";
import { motion } from "framer-motion";

interface PuzzleTileProps {
  tileIndex: number;
  imageTile: string;
  showNumbers?: boolean;
  onClick: () => void;
}

export const PuzzleTile: React.FC<PuzzleTileProps> = (
  { tileIndex, imageTile, showNumbers, onClick },
) => {
  if (tileIndex === -1) {
    return (
      <motion.div
        layout
        key="empty"
        className="relative bg-transparent cursor-pointer"
        onClick={onClick}
      />
    );
  }

  return (
    <motion.div
      layout
      key={tileIndex}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="relative cursor-pointer group bg-slate-800"
      onClick={onClick}
    >
      {imageTile && (
        <>
          <img
            src={imageTile}
            alt={`Tile ${tileIndex}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {showNumbers && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white text-lg md:text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-70 group-hover:opacity-100 transition-opacity">
                {tileIndex + 1}
              </span>
            </div>
          )}
          <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-colors" />
        </>
      )}
    </motion.div>
  );
};
