import React, { useRef } from "react";
import { motion } from "framer-motion";
import { usePuzzleGame } from "../hooks/usePuzzleGame";
import { useTimer } from "../hooks/useTimer";
import { useFullscreen } from "../hooks/useFullscreen";
import { PuzzleHeader } from "./Puzzle/PuzzleHeader";
import { PuzzleBoard } from "./Puzzle/PuzzleBoard";
import { PuzzleControls } from "./Puzzle/PuzzleControls";

const SlidingPuzzle: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    size,
    setSize,
    grid,
    moves,
    imageUrl,
    time,
    setTime,
    imageTiles,
    hasWon,
    showSuccessOverlay,
    isSolving,
    showPreview,
    setShowPreview,
    initGame,
    handleTileClick,
    handleAutoSolve,
    handleImageUpload,
    fetchRandomImage,
  } = usePuzzleGame();

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const { seconds, formatTime } = useTimer(!hasWon && moves > 0 && !isSolving, time);

  // Sync timer seconds back to game state for persistence
  React.useEffect(() => {
    setTime(seconds);
  }, [seconds, setTime]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-4 text-white"
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-4 md:p-10"
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 md:gap-12">
          <PuzzleBoard
            grid={grid}
            size={size}
            imageTiles={imageTiles}
            imageUrl={imageUrl}
            showPreview={showPreview}
            hasWon={hasWon}
            showSuccessOverlay={showSuccessOverlay}
            moves={moves}
            timeFormatted={formatTime(seconds)}
            onTileClick={handleTileClick}
            onRestart={() => initGame(true)}
            onShowPreview={setShowPreview}
          />

          <PuzzleControls
            size={size}
            isSolving={isSolving}
            onSizeChange={setSize}
            onImageUpload={handleImageUpload}
            onRandomImage={fetchRandomImage}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SlidingPuzzle;
