import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gallery, Level } from "../../data/galleries";
import { storage, LevelProgress } from "../../utils/storage";
import { 
  ChevronLeft, 
  Download, 
  Play, 
  CheckCircle2, 
  Lock, 
  Trophy, 
  Clock, 
  Hash,
  Loader2,
  Smartphone
} from "lucide-react";

interface GalleryDetailProps {
  gallery: Gallery;
  onBack: () => void;
  onPlayLevel: (level: Level) => void;
}

export const GalleryDetail: React.FC<GalleryDetailProps> = ({ gallery, onBack, onPlayLevel }) => {
  const [progress, setProgress] = useState<Record<string, LevelProgress>>({});
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const p: Record<string, LevelProgress> = {};
      for (const level of gallery.levels) {
        const state = await storage.getProgress(level.id);
        if (state) p[level.id] = state;
      }
      setProgress(p);
      setIsDownloaded(await storage.isGalleryDownloaded(gallery.id));
    };
    loadState();
  }, [gallery]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      for (const level of gallery.levels) {
        await storage.cacheImage(level.imageUrl);
      }
      await storage.setGalleryDownloaded(gallery.id, true);
      setIsDownloaded(true);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Galleries</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloaded || isDownloading}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all active:scale-95 ${
            isDownloaded 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default" 
              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
          }`}
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isDownloaded ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isDownloading ? "Downloading..." : isDownloaded ? "Downloaded for Offline" : "Download Gallery"}
          </span>
        </button>
      </div>

      <div className="relative rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {gallery.name}
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            {gallery.description}
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Levels</span>
              <span className="text-2xl font-black text-white">{gallery.levels.length}</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Solved</span>
              <span className="text-2xl font-black text-indigo-400">{Object.keys(progress).length}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950 to-transparent" />
          <img src={gallery.coverUrl} className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.levels.map((level, index) => {
          const state = progress[level.id];
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={level.imageUrl}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    state ? "grayscale-0 scale-100" : "grayscale blur-[2px] scale-105 opacity-50"
                  } group-hover:scale-110`}
                  alt={level.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                {!state && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10">
                      <Lock className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                )}
                
                {state && (
                  <div className="absolute top-4 right-4 p-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-black text-white tracking-tight">{level.title}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                      Level {index + 1} • {level.defaultSize.cols}x{level.defaultSize.rows}
                    </span>
                  </div>
                </div>

                {state ? (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                        <Hash className="w-2 h-2" /> Best Moves
                      </span>
                      <span className="text-sm font-black text-indigo-300">{state.bestMoves}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                        <Clock className="w-2 h-2" /> Best Time
                      </span>
                      <span className="text-sm font-black text-purple-300">{state.bestTime}s</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 py-4 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-600 border border-dashed border-white/10 rounded-xl italic">
                    Unsolved Masterpiece
                  </div>
                )}

                <button
                  onClick={() => onPlayLevel(level)}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300"
                >
                  <Play className="w-3 h-3 fill-current" /> {state ? "Replay Puzzle" : "Solve Puzzle"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isDownloaded && (
        <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/20">
            <Smartphone className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h5 className="font-black text-white text-sm uppercase tracking-tight">Offline Play Available</h5>
            <p className="text-xs text-slate-400 font-medium">Download this gallery to solve puzzles even without an internet connection.</p>
          </div>
        </div>
      )}
    </div>
  );
};
