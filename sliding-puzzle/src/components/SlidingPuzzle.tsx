import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePuzzleGame } from "../hooks/usePuzzleGame";
import { useTimer } from "../hooks/useTimer";
import { useFullscreen } from "../hooks/useFullscreen";
import { PuzzleHeader } from "./Puzzle/PuzzleHeader";
import { PuzzleBoard } from "./Puzzle/PuzzleBoard";
import { PuzzleControls } from "./Puzzle/PuzzleControls";
import { ImagePreparer } from "./ImagePreparer";
import { WinOverlay } from "./Puzzle/WinOverlay";
import { GalleryList } from "./Gallery/GalleryList";
import { GalleryDetail } from "./Gallery/GalleryDetail";
import { Gallery, Level } from "../data/galleries";
import { storage } from "../utils/storage";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LayoutGrid, Camera, Image as ImageIcon, ChevronLeft } from "lucide-react";

type ViewState = "menu" | "gallery-list" | "gallery-detail" | "game" | "setup";

const SlidingPuzzle: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewState>("menu");
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  
  const [sourceImageUrl, setSourceImageUrl] = useLocalStorage<string>(
    "puzzle-source-image", 
    "https://picsum.photos/1200/800"
  );
  
  const {
    grid,
    moves,
    imageUrl,
    setImageUrl,
    size,
    setSize,
    time,
    setTime,
    imageTiles,
    hasWon,
    isSolving,
    showPreview,
    setShowPreview,
    initGame,
    handleTileClick,
    handleAutoSolve,
  } = usePuzzleGame();

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const { seconds, formatTime } = useTimer(!hasWon && moves > 0 && !isSolving, time);

  useEffect(() => {
    setTime(seconds);
  }, [seconds, setTime]);

  // Handle Win Persistence
  useEffect(() => {
    if (hasWon && currentLevel) {
      storage.saveProgress(currentLevel.id, {
        solved: true,
        bestMoves: moves,
        bestTime: seconds
      });
    }
  }, [hasWon, currentLevel, moves, seconds]);

  const handleSetupComplete = (data: { processedImageUrl: string; size: { rows: number; cols: number } }) => {
    setImageUrl(data.processedImageUrl);
    setSize(data.size);
    setView("game");
  };

  const handlePlayLevel = async (level: Level) => {
    setCurrentLevel(level);
    const cachedUrl = await storage.getCachedImage(level.imageUrl);
    setSourceImageUrl(cachedUrl);
    setImageUrl(cachedUrl);
    setSize(level.defaultSize);
    setView("game");
    initGame(true);
  };

  const handleNextLevel = () => {
    if (!selectedGallery || !currentLevel) return;
    const currentIndex = selectedGallery.levels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex !== -1 && currentIndex < selectedGallery.levels.length - 1) {
      handlePlayLevel(selectedGallery.levels[currentIndex + 1]);
    } else {
      setView("gallery-detail");
    }
  };

  const handleFastRandomize = async () => {
    try {
      const response = await fetch(`https://picsum.photos/1200/800?t=${Date.now()}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setSourceImageUrl(url);
        setImageUrl(url);
        setCurrentLevel(null);
        setView("game");
        initGame(true);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-hidden flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-4 text-white"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        layout
        className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-4 md:p-10"
      >
        <AnimatePresence mode="wait">
          {view === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center py-12"
            >
              <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tighter mb-6">
                SLIDING PUZZLE
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-2xl leading-relaxed">
                Experience the classic challenge reimagined with stunning visuals and curated masterpieces.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <button
                  onClick={() => setView("gallery-list")}
                  className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all group active:scale-95"
                >
                  <div className="p-5 bg-indigo-500/20 rounded-2xl group-hover:bg-indigo-500/30 transition-colors">
                    <ImageIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Gallery</h3>
                    <p className="text-slate-500 text-sm font-medium">Browse curated collections</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setView("setup")}
                  className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group active:scale-95"
                >
                  <div className="p-5 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-colors">
                    <Camera className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Custom</h3>
                    <p className="text-slate-500 text-sm font-medium">Use your own photos</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {view === "gallery-list" && (
            <motion.div key="gallery-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => setView("menu")} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Back to Menu</span>
              </button>
              <GalleryList onSelectGallery={(g) => { setSelectedGallery(g); setView("gallery-detail"); }} />
            </motion.div>
          )}

          {view === "gallery-detail" && selectedGallery && (
            <motion.div key="gallery-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GalleryDetail 
                gallery={selectedGallery} 
                onBack={() => setView("gallery-list")} 
                onPlayLevel={handlePlayLevel} 
              />
            </motion.div>
          )}

          {view === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-10 border-b border-white/10 pb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400 tracking-tighter">PREPARE YOUR PUZZLE</h2>
                  <p className="text-slate-400 mt-1">Select an image and configure your challenge.</p>
                </div>
                <button onClick={() => setView("menu")} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <ImagePreparer 
                initialImageUrl={sourceImageUrl} 
                initialSize={size}
                onComplete={(data) => {
                  setSourceImageUrl(data.initialImageUrl);
                  setCurrentLevel(null);
                  handleSetupComplete(data);
                }} 
                onCancel={() => setView("menu")}
              />
            </motion.div>
          )}

          {view === "game" && (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setView(currentLevel ? "gallery-detail" : "menu")}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Exit to {currentLevel ? "Gallery" : "Menu"}
                  </span>
                </button>
                {currentLevel && (
                  <div className="h-1 w-1 rounded-full bg-slate-700" />
                )}
                {currentLevel && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    {selectedGallery?.name} • {currentLevel.title}
                  </span>
                )}
              </div>
              
              <PuzzleHeader
                moves={moves}
                timeFormatted={formatTime(seconds)}
                isFullscreen={isFullscreen}
                isSolving={isSolving}
                hasWon={hasWon}
                onToggleFullscreen={toggleFullscreen}
                onAutoSolve={handleAutoSolve}
                onRestart={() => initGame(true)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 md:gap-12">
                <PuzzleBoard
                  grid={grid}
                  size={size}
                  imageTiles={imageTiles}
                  imageUrl={imageUrl}
                  showPreview={showPreview}
                  hasWon={hasWon}
                  onTileClick={handleTileClick}
                  onShowPreview={setShowPreview}
                />

                <PuzzleControls
                  size={size}
                  isSolving={isSolving}
                  onSizeChange={setSize}
                  onOpenSetup={() => setView("setup")}
                  onRandomImage={handleFastRandomize}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {hasWon && (
          <WinOverlay
            moves={moves}
            timeFormatted={formatTime(seconds)}
            sourceImageUrl={sourceImageUrl}
            onRestart={() => initGame(true)}
            onNewGame={() => {
              setView(currentLevel ? "gallery-detail" : "menu");
              initGame(true);
            }}
            onNextLevel={currentLevel && selectedGallery?.levels.findIndex(l => l.id === currentLevel.id) !== selectedGallery?.levels.length! - 1 
              ? handleNextLevel 
              : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlidingPuzzle;
