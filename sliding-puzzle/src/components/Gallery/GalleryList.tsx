import React from "react";
import { motion } from "framer-motion";
import { GALLERIES } from "../../data/galleries.ts";
import type { Gallery } from "../../data/galleries.ts";
import { ChevronRight, LayoutGrid, Image as ImageIcon } from "lucide-react";

interface GalleryListProps {
  onSelectGallery: (gallery: Gallery) => void;
}

export const GalleryList: React.FC<GalleryListProps> = ({ onSelectGallery }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tighter">
          CURATED GALLERIES
        </h2>
        <p className="text-slate-400 font-medium italic">Discover hand-picked masterpieces to solve.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GALLERIES.map((gallery) => (
          <motion.button
            key={gallery.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGallery(gallery)}
            className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all text-left"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={gallery.coverUrl}
                alt={gallery.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            <div className="p-8 mt-[-4rem] relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                  {gallery.levels.length} Levels
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">
                {gallery.name}
              </h3>
              <p className="text-slate-400 text-sm line-clamp-2 font-medium">
                {gallery.description}
              </p>
              
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                Explore Gallery <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
