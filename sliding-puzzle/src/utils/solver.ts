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

// Simple Binary Heap implementation for Priority Queue
class PriorityQueue<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}

  push(item: T) {
    this.heap.push(item);
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.size() > 0) {
      this.heap[0] = bottom;
      this.sinkDown();
    }
    return top;
  }

  size() {
    return this.heap.length;
  }

  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private sinkDown() {
    let index = 0;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.heap.length && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
        smallest = rightChild;
      }

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

const getHeuristic = (board: Board, size: GridSize): number => {
  let distance = 0;
  const { rows, cols } = size;

  // Manhattan Distance
  for (let i = 0; i < board.length; i++) {
    const value = board[i];
    if (value !== -1) {
      const targetRow = Math.floor(value / cols);
      const targetCol = value % cols;
      const currentRow = Math.floor(i / cols);
      const currentCol = i % cols;
      distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
    }
  }

  // Linear Conflict
  // Rows
  for (let r = 0; r < rows; r++) {
    for (let c1 = 0; c1 < cols; c1++) {
      for (let c2 = c1 + 1; c2 < cols; c2++) {
        const v1 = board[r * cols + c1];
        const v2 = board[r * cols + c2];
        if (v1 !== -1 && v2 !== -1) {
          const t1r = Math.floor(v1 / cols);
          const t2r = Math.floor(v2 / cols);
          const t1c = v1 % cols;
          const t2c = v2 % cols;
          if (t1r === r && t2r === r && t1c > t2c) {
            distance += 2;
          }
        }
      }
    }
  }

  // Columns
  for (let c = 0; c < cols; c++) {
    for (let r1 = 0; r1 < rows; r1++) {
      for (let r2 = r1 + 1; r2 < rows; r2++) {
        const v1 = board[r1 * cols + c];
        const v2 = board[r2 * cols + c];
        if (v1 !== -1 && v2 !== -1) {
          const t1c = v1 % cols;
          const t2c = v2 % cols;
          const t1r = Math.floor(v1 / cols);
          const t2r = Math.floor(v2 / cols);
          if (t1c === c && t2c === c && t1r > t2r) {
            distance += 2;
          }
        }
      }
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
    priority: getHeuristic(initialBoard, size),
    parent: null,
  };

  const pq = new PriorityQueue<Node>((a, b) => a.priority - b.priority);
  pq.push(startNode);
  
  const closedSet = new Map<string, number>();
  closedSet.set(initialBoard.join(","), 0);

  let iterations = 0;
  // Increase limit for larger grids, but keep a safety bound
  const MAX_ITERATIONS = size.rows > 3 ? 150000 : 50000;

  while (pq.size() > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    const current = pq.pop()!;

    if (isSolved(current.board)) {
      const path: Board[] = [];
      let temp: Node | null = current;
      while (temp) {
        path.unshift(temp.board);
        temp = temp.parent;
      }
      return path.slice(1);
    }

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

        const boardKey = newBoard.join(",");
        const newMoves = current.moves + 1;

        if (!closedSet.has(boardKey) || closedSet.get(boardKey)! > newMoves) {
          closedSet.set(boardKey, newMoves);
          pq.push({
            board: newBoard,
            moves: newMoves,
            emptyIndex: newEmptyIndex,
            priority: newMoves + getHeuristic(newBoard, size),
            parent: current,
          });
        }
      }
    }
  }

  return null;
};
