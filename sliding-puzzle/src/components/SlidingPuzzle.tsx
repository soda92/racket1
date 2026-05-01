import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleGrid, canMove, isSolved } from "../utils/gameLogic";
import type { GridSize } from "../utils/gameLogic";
import { sliceImage } from "../utils/imageProcessor";
import { Camera, RefreshCw, Trophy, LayoutGrid, Eye, EyeOff, Timer } from "lucide-react";

const SlidingPuzzle: React.FC = () => {
  // Persistence Helpers
  const getSaved = <T,>(key: string, fallback: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [size, setSize] = useState<GridSize>(getSaved("puzzle-size", { rows: 4, cols: 4 }));
  const [grid, setGrid] = useState<number[]>(getSaved("puzzle-grid", []));
  const [imageTiles, setImageTiles] = useState<string[]>([]);
  const [moves, setMoves] = useState(getSaved("puzzle-moves", 0));
  const [hasWon, setHasWon] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(getSaved("puzzle-image", "https://picsum.photos/800/800"));
  const [showPreview, setShowPreview] = useState(false);
  const [seconds, setSeconds] = useState(getSaved("puzzle-time", 0));
  const timerRef = useRef<number | null>(null);

  // Persistence Effects
  useEffect(() => localStorage.setItem("puzzle-size", JSON.stringify(size)), [size]);
  useEffect(() => localStorage.setItem("puzzle-grid", JSON.stringify(grid)), [grid]);
  useEffect(() => localStorage.setItem("puzzle-moves", JSON.stringify(moves)), [moves]);
  useEffect(() => localStorage.setItem("puzzle-image", JSON.stringify(imageUrl)), [imageUrl]);
  useEffect(() => localStorage.setItem("puzzle-time", JSON.stringify(seconds)), [seconds]);

  const initGame = useCallback(async (isNewSession = true) => {
    if (isNewSession) {
      const newGrid = shuffleGrid(size);
      setGrid(newGrid);
      setMoves(0);
      setSeconds(0);
      setHasWon(false);
    }
    
    try {
      const tiles = await sliceImage(imageUrl, size);
      setImageTiles(tiles);
    } catch (err) {
      console.error("Failed to slice image", err);
    }
  }, [size, imageUrl]);

  // Initial Load (Load tiles for saved image)
  useEffect(() => {
    if (grid.length === 0 || grid.length !== size.rows * size.cols) {
      initGame(true);
    } else {
      initGame(false); // Just load the image tiles for the existing grid
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, size]);

  // Timer Logic
  useEffect(() => {
    if (!hasWon && moves > 0) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hasWon, moves > 0]);

  const handleTileClick = useCallback((index: number) => {
    if (hasWon) return;

    const emptyIndex = grid.indexOf(-1);
    if (canMove(index, emptyIndex, size)) {
      const newGrid = [...grid];
      [newGrid[index], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[index]];
      setGrid(newGrid);
      setMoves((m) => m + 1);

      if (isSolved(newGrid)) {
        setHasWon(true);
      }
    }
  }, [grid, hasWon, size]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasWon) return;
      const emptyIndex = grid.indexOf(-1);
      if (emptyIndex === -1) return;

      const row = Math.floor(emptyIndex / size.cols);
      const col = emptyIndex % size.cols;
      
      let targetIndex = -1;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (row < size.rows - 1) targetIndex = emptyIndex + size.cols;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (row > 0) targetIndex = emptyIndex - size.cols;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (col < size.cols - 1) targetIndex = emptyIndex + 1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (col > 0) targetIndex = emptyIndex - 1;
          break;
      }
      
      if (targetIndex !== -1) {
        handleTileClick(targetIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid, hasWon, size, handleTileClick]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-4 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 md:p-10"
      >
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/10 pb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tighter"
            >
              PIXEL SLIDE
            </motion.h1>
            <p className="text-slate-400 mt-2 font-medium">Reassemble the masterpiece.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-6 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Moves</span>
                <span className="text-xl font-mono font-bold text-indigo-400">{moves}</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Time</span>
                <div className="flex items-center gap-2 text-xl font-mono font-bold text-purple-400">
                  <Timer className="w-4 h-4" />
                  {formatTime(seconds)}
                </div>
              </div>
            </div>
            <button 
              onClick={() => initGame(true)}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 active:scale-95 group"
              title="Restart Game"
            >
              <RefreshCw className="w-6 h-6 text-slate-300 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Puzzle Board Container */}
          <div className="relative">
            <div 
              className="relative aspect-square bg-black/40 rounded-2xl overflow-hidden border-8 border-white/5 shadow-2xl"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
                gridTemplateRows: `repeat(${size.rows}, 1fr)`,
                gap: "1px"
              }}
            >
              <AnimatePresence mode="popLayout">
                {grid.map((tileIndex, posIndex) => (
                  <motion.div
                    key={tileIndex === -1 ? "empty" : tileIndex}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    className={`relative cursor-pointer group ${tileIndex === -1 ? "bg-transparent" : "bg-slate-800"}`}
                    onClick={() => handleTileClick(posIndex)}
                  >
                    {tileIndex !== -1 && imageTiles[tileIndex] && (
                      <>
                        <img 
                          src={imageTiles[tileIndex]} 
                          alt={`Tile ${tileIndex}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-colors" />
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Preview Overlay */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 pointer-events-none"
                  >
                    <img src={imageUrl} alt="Reference" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[2px]" />
                  </motion.div>
                )}
              </AnimatePresence>

              {hasWon && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                  className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                  </motion.div>
                  <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">UNBELIEVABLE!</h2>
                  <p className="text-slate-300 mb-8 max-w-xs mx-auto">You solved this masterpiece in {moves} moves and {formatTime(seconds)}.</p>
                  <button 
                    onClick={() => initGame(true)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all active:scale-95 uppercase tracking-tighter"
                  >
                    Challenge Again
                  </button>
                </motion.div>
              )}
            </div>
            
            <button 
              onMouseDown={() => setShowPreview(true)}
              onMouseUp={() => setShowPreview(false)}
              onMouseLeave={() => setShowPreview(false)}
              onTouchStart={() => setShowPreview(true)}
              onTouchEnd={() => setShowPreview(false)}
              className="absolute bottom-4 right-4 z-40 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
              title="Hold to preview"
            >
              {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Controls Sidebar */}
          <div className="flex flex-col gap-8">
            <section className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Difficulty
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSize({ rows: n, cols: n })}
                    className={`relative overflow-hidden px-6 py-4 rounded-2xl border transition-all text-left group ${
                      size.rows === n 
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300" 
                        : "border-white/5 bg-white/5 hover:border-white/20 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{n}x{n} Grid</span>
                      <span className="text-xs opacity-50 uppercase font-black">{n*n - 1} Pieces</span>
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
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
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
                onClick={() => setImageUrl(`https://picsum.photos/800/800?t=${Date.now()}`)}
                className="w-full py-4 text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors border border-indigo-500/20 rounded-2xl"
              >
                Random Artwork
              </button>
            </section>

            {/* Mini Reference */}
            <div className="mt-auto">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target</p>
              <div className="relative aspect-square w-32 rounded-xl overflow-hidden border border-white/10">
                <img src={imageUrl} alt="Reference" className="w-full h-full object-cover grayscale opacity-40" />
                <div className="absolute inset-0 bg-indigo-500/10" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SlidingPuzzle;
