import { useCallback, useEffect, useRef, useState } from "react";
import {
  canMove,
  type GridSize,
  isSolved,
  shuffleGrid,
} from "../utils/gameLogic.ts";
import { sliceImage } from "../utils/imageProcessor.ts";
import { solvePuzzle } from "../utils/solver.ts";
import { useLocalStorage } from "./useLocalStorage.ts";

export function usePuzzleGame() {
  const [size, setSize] = useLocalStorage<GridSize>("puzzle-size", {
    rows: 4,
    cols: 4,
  });
  const [grid, setGrid] = useLocalStorage<number[]>("puzzle-grid", []);
  const [moves, setMoves] = useLocalStorage<number>("puzzle-moves", 0);
  const [imageUrl, setImageUrl] = useLocalStorage<string>(
    "puzzle-image",
    "https://picsum.photos/800/800",
  );
  const [time, setTime] = useLocalStorage<number>("puzzle-time", 0);

  const [imageTiles, setImageTiles] = useState<string[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const initGame = useCallback(
    async (isNewSession = true) => {
      if (isNewSession) {
        const newGrid = shuffleGrid(size);
        setGrid(newGrid);
        setMoves(0);
        setTime(0);
        setHasWon(false);
      }

      try {
        const tiles = await sliceImage(imageUrl, size);
        setImageTiles(tiles);
      } catch (err) {
        console.error("Failed to slice image", err);
      }
    },
    [size, imageUrl, setGrid, setMoves, setTime],
  );

  // Use a ref to track initialization
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current || grid.length !== size.rows * size.cols) {
      const shouldShuffle = grid.length === 0 ||
        grid.length !== size.rows * size.cols;
      initGame(shouldShuffle);
      isInitializedRef.current = true;
    } else {
      initGame(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, size.rows, size.cols]); // Depend on row/col specifically to avoid object ref issues

  const handleTileClick = useCallback(
    (index: number) => {
      if (hasWon || isSolving) return;

      const emptyIndex = grid.indexOf(-1);
      if (canMove(index, emptyIndex, size)) {
        const newGrid = [...grid];
        [newGrid[index], newGrid[emptyIndex]] = [
          newGrid[emptyIndex],
          newGrid[index],
        ];
        setGrid(newGrid);
        setMoves((m) => m + 1);

        if (isSolved(newGrid)) {
          setHasWon(true);
        }
      }
    },
    [grid, hasWon, size, isSolving, setGrid, setMoves],
  );

  const handleAutoSolve = async () => {
    if (isSolving || hasWon) return;
    setIsSolving(true);

    await new Promise((r) => setTimeout(r, 100));
    const solution = solvePuzzle(grid, size);

    if (!solution) {
      alert("No solution found within iteration limit.");
      setIsSolving(false);
      return;
    }

    for (const step of solution) {
      setGrid(step);
      setMoves((m) => m + 1);
      await new Promise((r) => setTimeout(r, 200));
    }

    setHasWon(true);
    setIsSolving(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasWon || isSolving) return;
      const emptyIndex = grid.indexOf(-1);
      if (emptyIndex === -1) return;

      const row = Math.floor(emptyIndex / size.cols);
      const col = emptyIndex % size.cols;

      let targetIndex = -1;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          if (row < size.rows - 1) targetIndex = emptyIndex + size.cols;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          if (row > 0) targetIndex = emptyIndex - size.cols;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          if (col < size.cols - 1) targetIndex = emptyIndex + 1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          if (col > 0) targetIndex = emptyIndex - 1;
          break;
      }

      if (targetIndex !== -1) {
        handleTileClick(targetIndex);
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [grid, hasWon, size, handleTileClick, isSolving]);

  return {
    size,
    setSize,
    grid,
    moves,
    setMoves,
    imageUrl,
    setImageUrl,
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
  };
}
