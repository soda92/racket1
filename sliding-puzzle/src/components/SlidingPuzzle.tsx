import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleGrid, canMove, isSolved } from "../utils/gameLogic";
import type { GridSize } from "../utils/gameLogic";
import { sliceImage } from "../utils/imageProcessor";
import { Camera, RefreshCw, Trophy, LayoutGrid } from "lucide-react";

const SlidingPuzzle: React.FC = () => {
  const [size, setSize] = useState<GridSize>({ rows: 4, cols: 4 });
  const [grid, setGrid] = useState<number[]>([]);
  const [imageTiles, setImageTiles] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("https://picsum.photos/800/800");

  const initGame = useCallback(async () => {
    const newGrid = shuffleGrid(size);
    setGrid(newGrid);
    setMoves(0);
    setHasWon(false);
    
    try {
      const tiles = await sliceImage(imageUrl, size);
      setImageTiles(tiles);
    } catch (err) {
      console.error("Failed to slice image", err);
    }
  }, [size, imageUrl]);

  useEffect(() => {
    initGame();
  }, [initGame]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-slate-800">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sliding Puzzle</h1>
            <p className="text-slate-500">Solve the mystery, tile by tile.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold">
              Moves: <span className="text-indigo-600">{moves}</span>
            </div>
            <button 
              onClick={initGame}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              title="Restart Game"
            >
              <RefreshCw className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8">
          {/* Puzzle Board */}
          <div 
            className="relative aspect-square bg-slate-200 rounded-xl overflow-hidden border-4 border-slate-200 shadow-inner"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
              gridTemplateRows: `repeat(${size.rows}, 1fr)`,
              gap: "2px"
            }}
          >
            <AnimatePresence>
              {grid.map((tileIndex, posIndex) => (
                <motion.div
                  key={tileIndex === -1 ? "empty" : tileIndex}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`relative cursor-pointer select-none ${tileIndex === -1 ? "bg-slate-200" : ""}`}
                  onClick={() => handleTileClick(posIndex)}
                >
                  {tileIndex !== -1 && imageTiles[tileIndex] && (
                    <img 
                      src={imageTiles[tileIndex]} 
                      alt={`Tile ${tileIndex}`}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {hasWon && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
              >
                <Trophy className="w-20 h-20 text-yellow-500 mb-4" />
                <h2 className="text-3xl font-black text-slate-900 mb-2">Victory!</h2>
                <p className="text-slate-600 mb-6">You solved the {size.rows}x{size.cols} puzzle in {moves} moves.</p>
                <button 
                  onClick={initGame}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  Play Again
                </button>
              </motion.div>
            )}
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Grid Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSize({ rows: n, cols: n })}
                    className={`py-2 rounded-lg border-2 transition-all font-medium ${
                      size.rows === n 
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    {n}x{n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Camera className="w-4 h-4" /> Custom Image
              </label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center group-hover:border-indigo-400 transition-colors">
                  <p className="text-xs text-slate-500">Upload your own photo</p>
                </div>
              </div>
              <button
                onClick={() => setImageUrl(`https://picsum.photos/800/800?t=${Date.now()}`)}
                className="w-full text-xs text-indigo-600 font-semibold hover:underline"
              >
                Try a random image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingPuzzle;
