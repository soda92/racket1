import type { GridSize } from "./gameLogic";

export const sliceImage = async (
  imageSrc: string,
  size: GridSize
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS for random images
    img.onload = () => {
      const { rows, cols } = size;
      const tileWidth = img.width / cols;
      const tileHeight = img.height / rows;
      const tiles: string[] = [];

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = tileWidth;
      canvas.height = tileHeight;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.clearRect(0, 0, tileWidth, tileHeight);
          ctx.drawImage(
            img,
            c * tileWidth,
            r * tileHeight,
            tileWidth,
            tileHeight,
            0,
            0,
            tileWidth,
            tileHeight
          );
          tiles.push(canvas.toDataURL());
        }
      }
      resolve(tiles);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};
