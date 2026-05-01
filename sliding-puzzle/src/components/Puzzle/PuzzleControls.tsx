import React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Camera } from "lucide-react";
import type { GridSize } from "../../utils/gameLogic";

interface PuzzleControlsProps {
  size: GridSize;
  isSolving: boolean;
  onSizeChange: (size: GridSize) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRandomImage: () => void;
}

export const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  size,
  isSolving,
  onSizeChange,
  onImageUpload,
  onRandomImage,
}) => {
  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-4">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" /> Difficulty
        </label>
        <div className="grid grid-cols-1 gap-3">
          {[3, 4, 5].map((n) => (
            <button
              key={n}
              disabled={isSolving}
              onClick={() => onSizeChange({ rows: n, cols: n })}
              className={`relative overflow-hidden px-6 py-4 rounded-2xl border transition-all text-left group ${
                size.rows === n
                  ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                  : "border-white/5 bg-white/5 hover:border-white/20 text-slate-400"
              } ${isSolving ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{n}x{n} Grid</span>
                <span className="text-xs opacity-50 uppercase font-black">{n * n - 1} Pieces</span>
              </div>
              {size.rows === n && (
                <motion.div layoutId="active-bg" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Camera className="w-4 h-4" /> Canvas
        </label>
        <div className={`relative group ${isSolving ? "opacity-30 cursor-not-allowed" : ""}`}>
          <input
            type="file"
            accept="image/*"
            disabled={isSolving}
            onChange={onImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center group-hover:border-indigo-500/50 transition-all bg-white/5 group-hover:bg-indigo-500/5">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 font-bold">Import Image</p>
            <p className="text-[10px] text-slate-600 uppercase mt-1">JPG, PNG, WEBP</p>
          </div>
        </div>
        <button
          disabled={isSolving}
          onClick={onRandomImage}
          className="w-full py-4 text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors border border-indigo-500/20 rounded-2xl disabled:opacity-30"
        >
          Random Artwork
        </button>
      </section>
    </div>
  );
};
