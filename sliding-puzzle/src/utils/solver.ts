import { isSolved } from "./gameLogic";
import type { GridSize } from "./gameLogic";

type Board = number[];

interface Node {
  board: Board;
  moves: number;
  emptyIndex: number;
  priority: number;
  parent: Node | null;
}

const getManhattanDistance = (board: Board, size: GridSize): number => {
  let distance = 0;
  for (let i = 0; i < board.length; i++) {
    const value = board[i];
    if (value !== -1) {
      const targetRow = Math.floor(value / size.cols);
      const targetCol = value % size.cols;
      const currentRow = Math.floor(i / size.cols);
      const currentCol = i % size.cols;
      distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
    }
  }
  return distance;
};

export const solvePuzzle = (initialBoard: Board, size: GridSize): Board[] | null => {
  const startEmptyIndex = initialBoard.indexOf(-1);
  const startNode: Node = {
    board: initialBoard,
    moves: 0,
    emptyIndex: startEmptyIndex,
    priority: getManhattanDistance(initialBoard, size),
    parent: null,
  };

  const openSet: Node[] = [startNode];
  const closedSet = new Set<string>();

  // Optimization: Limit iterations to prevent browser hang on very complex shuffles
  let iterations = 0;
  const MAX_ITERATIONS = 10000;

  while (openSet.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    // Sort by priority (moves + distance)
    openSet.sort((a, b) => a.priority - b.priority);
    const current = openSet.shift()!;

    if (isSolved(current.board)) {
      const path: Board[] = [];
      let temp: Node | null = current;
      while (temp) {
        path.unshift(temp.board);
        temp = temp.parent;
      }
      return path.slice(1); // Exclude initial state
    }

    closedSet.add(current.board.join(","));

    // Find neighbors (up, down, left, right)
    const row = Math.floor(current.emptyIndex / size.cols);
    const col = current.emptyIndex % size.cols;

    const directions = [
      { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
    ];

    for (const dir of directions) {
      const newRow = row + dir.r;
      const newCol = col + dir.c;

      if (newRow >= 0 && newRow < size.rows && newCol >= 0 && newCol < size.cols) {
        const newEmptyIndex = newRow * size.cols + newCol;
        const newBoard = [...current.board];
        [newBoard[current.emptyIndex], newBoard[newEmptyIndex]] = [newBoard[newEmptyIndex], newBoard[current.emptyIndex]];

        if (!closedSet.has(newBoard.join(","))) {
          openSet.push({
            board: newBoard,
            moves: current.moves + 1,
            emptyIndex: newEmptyIndex,
            priority: (current.moves + 1) + getManhattanDistance(newBoard, size),
            parent: current,
          });
        }
      }
    }
  }

  return null;
};
