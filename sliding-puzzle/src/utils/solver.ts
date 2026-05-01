import type { GridSize } from "./gameLogic";

type Board = Uint8Array;

interface Node {
  board: Board;
  moves: number;
  emptyIndex: number;
  priority: number;
  parent: Node | null;
}

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
      const parentIndex = (index - 1) >> 1;
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private sinkDown() {
    let index = 0;
    while (true) {
      let smallest = index;
      const leftChild = (index << 1) + 1;
      const rightChild = (index << 1) + 2;

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

  for (let i = 0; i < board.length; i++) {
    const value = board[i];
    if (value === 255) continue; // -1 is stored as 255 in Uint8Array

    const targetRow = (value / cols) | 0;
    const targetCol = value % cols;
    const currentRow = (i / cols) | 0;
    const currentCol = i % cols;

    distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);

    // Linear Conflict (Row)
    if (targetRow === currentRow) {
      const rowEnd = (currentRow + 1) * cols;
      for (let j = i + 1; j < rowEnd; j++) {
        const value2 = board[j];
        if (value2 !== 255 && ((value2 / cols) | 0) === currentRow && (value2 % cols) < targetCol) {
          distance += 2;
        }
      }
    }

    // Linear Conflict (Col)
    if (targetCol === currentCol) {
      for (let j = i + cols; j < board.length; j += cols) {
        const value2 = board[j];
        if (value2 !== 255 && (value2 % cols) === currentCol && ((value2 / cols) | 0) < targetRow) {
          distance += 2;
        }
      }
    }
  }
  return distance;
};

// Fast board to string key
const getBoardKey = (board: Board): string => {
  return String.fromCharCode(...board);
};

export const solvePuzzle = (initialBoard: number[], size: GridSize): number[][] | null => {
  const uintBoard = new Uint8Array(initialBoard.map(v => v === -1 ? 255 : v));
  const startEmptyIndex = initialBoard.indexOf(-1);
  
  // Weighted A* (W=1.5 or 2.0) often finds solutions much faster for sliding puzzles
  const WEIGHT = 1.8; 

  const startNode: Node = {
    board: uintBoard,
    moves: 0,
    emptyIndex: startEmptyIndex,
    priority: WEIGHT * getHeuristic(uintBoard, size),
    parent: null,
  };

  const pq = new PriorityQueue<Node>((a, b) => a.priority - b.priority);
  pq.push(startNode);
  
  const closedSet = new Map<string, number>();
  closedSet.set(getBoardKey(uintBoard), 0);

  let iterations = 0;
  const MAX_ITERATIONS = size.rows > 4 ? 1000000 : 500000;

  while (pq.size() > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    const current = pq.pop()!;

    // Check if solved (all tiles in order, last is -1/255)
    let solved = true;
    for (let i = 0; i < current.board.length - 1; i++) {
      if (current.board[i] !== i) {
        solved = false;
        break;
      }
    }
    if (solved && current.board[current.board.length - 1] === 255) {
      const path: number[][] = [];
      let temp: Node | null = current;
      while (temp) {
        path.unshift(Array.from(temp.board).map(v => v === 255 ? -1 : v));
        temp = temp.parent;
      }
      return path.slice(1);
    }

    const row = (current.emptyIndex / size.cols) | 0;
    const col = current.emptyIndex % size.cols;

    const directions = [
      { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
    ];

    for (const dir of directions) {
      const newRow = row + dir.r;
      const newCol = col + dir.c;

      if (newRow >= 0 && newRow < size.rows && newCol >= 0 && newCol < size.cols) {
        const newEmptyIndex = newRow * size.cols + newCol;
        const newBoard = new Uint8Array(current.board);
        newBoard[current.emptyIndex] = newBoard[newEmptyIndex];
        newBoard[newEmptyIndex] = 255;

        const boardKey = getBoardKey(newBoard);
        const newMoves = current.moves + 1;

        if (!closedSet.has(boardKey) || closedSet.get(boardKey)! > newMoves) {
          closedSet.set(boardKey, newMoves);
          pq.push({
            board: newBoard,
            moves: newMoves,
            emptyIndex: newEmptyIndex,
            priority: newMoves + WEIGHT * getHeuristic(newBoard, size),
            parent: current,
          });
        }
      }
    }
  }

  return null;
};
