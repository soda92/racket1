import { Hash, LayoutGrid, RefreshCw, Settings } from "lucide-react";
import type { GridSize } from "../../utils/gameLogic.ts";

interface PuzzleControlsProps {
  size: GridSize;
  isSolving: boolean;
  showNumbers: boolean;
  onSizeChange: (size: GridSize) => void;
  onToggleNumbers: (show: boolean) => void;
  onOpenSetup: () => void;
  onRandomImage: () => void;
}

export const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  size,
  isSolving,
  showNumbers,
  onSizeChange,
  onToggleNumbers,
  onOpenSetup,
  onRandomImage,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-4">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" /> Quick Resolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              disabled={isSolving}
              onClick={() => onSizeChange({ rows: n, cols: n })}
              className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                size.rows === n && size.cols === n
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                  : "border-white/5 bg-white/5 hover:border-white/10 text-slate-400"
              } disabled:opacity-30`}
            >
              {n}x{n}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          Advanced Actions
        </label>
        
        <button
          type="button"
          onClick={() => onToggleNumbers(!showNumbers)}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all active:scale-95 group ${
            showNumbers
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
              : "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
          }`}
        >
          <Hash className={`w-4 h-4 ${showNumbers ? "text-indigo-400" : "text-slate-500"}`} />
          <span className="text-xs font-black uppercase tracking-widest">
            {showNumbers ? "Hide Numbers" : "Show Numbers"}
          </span>
        </button>

        <button
          type="button"
          disabled={isSolving}
          onClick={onOpenSetup}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95 group disabled:opacity-50"
        >
          <Settings className="w-4 h-4 text-indigo-400 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-300">
            Reconfigure Board
          </span>
        </button>

        <button
          type="button"
          disabled={isSolving}
          onClick={onRandomImage}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all active:scale-95 group disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 text-purple-400 group-hover:rotate-180 transition-transform duration-700" />
          <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
            Fast Randomize
          </span>
        </button>
      </section>

      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
          Instructions
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Use arrow keys or click tiles to slide them. Reassemble the image by
          moving tiles into the empty slot.
        </p>
      </div>
    </div>
  );
};
