export type GridSize = { rows: number; cols: number };

export const getInversions = (arr: number[]): number => {
  let inversions = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] !== -1 && arr[j] !== -1 && arr[i] > arr[j]) {
        inversions++;
      }
    }
  }
  return inversions;
};

export const isSolvable = (grid: number[], size: GridSize): boolean => {
  const inversions = getInversions(grid);
  const emptyIndex = grid.indexOf(-1);
  const emptyRowFromBottom = size.rows - Math.floor(emptyIndex / size.cols);

  if (size.cols % 2 !== 0) {
    // If width is odd, solvable if inversions is even
    return inversions % 2 === 0;
  } else {
    // If width is even:
    // If empty is on odd row from bottom, solvable if inversions is even
    // If empty is on even row from bottom, solvable if inversions is odd
    if (emptyRowFromBottom % 2 !== 0) {
      return inversions % 2 === 0;
    } else {
      return inversions % 2 !== 0;
    }
  }
};

export const shuffleGrid = (size: GridSize): number[] => {
  const total = size.rows * size.cols;
  let grid: number[];
  do {
    grid = Array.from({ length: total }, (_, i) => (i === total - 1 ? -1 : i));
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
  } while (!isSolvable(grid, size) || isSolved(grid));

  return grid;
};

export const isSolved = (grid: number[]): boolean => {
  for (let i = 0; i < grid.length - 1; i++) {
    if (grid[i] !== i) return false;
  }
  return grid[grid.length - 1] === -1;
};

export const canMove = (index: number, emptyIndex: number, size: GridSize): boolean => {
  const row = Math.floor(index / size.cols);
  const col = index % size.cols;
  const emptyRow = Math.floor(emptyIndex / size.cols);
  const emptyCol = emptyIndex % size.cols;

  return (
    (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
    (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  );
};
