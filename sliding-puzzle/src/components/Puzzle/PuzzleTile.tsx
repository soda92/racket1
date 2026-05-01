import React from "react";
import { motion } from "framer-motion";

interface PuzzleTileProps {
  tileIndex: number;
  imageTile: string;
  onClick: () => void;
}

export const PuzzleTile: React.FC<PuzzleTileProps> = ({ tileIndex, imageTile, onClick }) => {
  if (tileIndex === -1) {
    return (
      <motion.div
        layout
        key="empty"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative bg-transparent cursor-pointer"
        onClick={onClick}
      />
    );
  }

  return (
    <motion.div
      layout
      key={tileIndex}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
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
          <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-colors" />
        </>
      )}
    </motion.div>
  );
};
