import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePuzzleGame } from "../hooks/usePuzzleGame";
import { useTimer } from "../hooks/useTimer";
import { useFullscreen } from "../hooks/useFullscreen";
import { PuzzleHeader } from "./Puzzle/PuzzleHeader";
import { PuzzleBoard } from "./Puzzle/PuzzleBoard";
import { PuzzleControls } from "./Puzzle/PuzzleControls";
import { ImagePreparer } from "./ImagePreparer";

const SlidingPuzzle: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSetup, setShowSetup] = useState(false);
  
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

  // Sync timer seconds back to game state for persistence
  React.useEffect(() => {
    setTime(seconds);
  }, [seconds, setTime]);

  const handleSetupComplete = (data: { processedImageUrl: string; size: { rows: number; cols: number } }) => {
    setImageUrl(data.processedImageUrl);
    setSize(data.size);
    setShowSetup(false);
    // initGame will be triggered by useEffect in usePuzzleGame when imageUrl or size changes
  };

  const handleFastRandomize = async () => {
    try {
      const response = await fetch(`https://picsum.photos/1200/800?t=${Date.now()}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
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
      className="relative overflow-x-hidden flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-4 text-white"
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        layout
        className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-4 md:p-10"
      >
        <AnimatePresence mode="wait">
          {showSetup ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="mb-10 border-b border-white/10 pb-8">
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tighter">PREPARE YOUR PUZZLE</h2>
                <p className="text-slate-400 mt-1">Select an image and configure your challenge.</p>
              </div>
              <ImagePreparer 
                initialImageUrl={imageUrl} 
                initialSize={size}
                onComplete={handleSetupComplete} 
                onCancel={moves > 0 ? () => setShowSetup(false) : undefined}
              />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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
                  onOpenSetup={() => setShowSetup(true)}
                  onRandomImage={handleFastRandomize}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SlidingPuzzle;
