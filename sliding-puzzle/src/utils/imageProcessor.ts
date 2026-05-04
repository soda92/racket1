import type { GridSize } from "./gameLogic.ts";

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const cropImage = (
  imageSrc: string,
  crop: CropArea,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const sourceX = (crop.x / 100) * img.width;
      const sourceY = (crop.y / 100) * img.height;
      const sourceWidth = (crop.width / 100) * img.width;
      const sourceHeight = (crop.height / 100) * img.height;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight,
      );
      resolve(canvas.toDataURL("image/webp", 0.9));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

export const sliceImage = (
  imageSrc: string,
  size: GridSize,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { rows, cols } = size;

      const sourceX = 0;
      const sourceY = 0;
      const sourceWidth = img.width;
      const sourceHeight = img.height;

      const tileWidth = sourceWidth / cols;
      const tileHeight = sourceHeight / rows;
      const tiles: string[] = [];

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const targetTileSize = 300;
      canvas.width = targetTileSize;
      canvas.height = targetTileSize * (tileHeight / tileWidth);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            img,
            sourceX + c * tileWidth,
            sourceY + r * tileHeight,
            tileWidth,
            tileHeight,
            0,
            0,
            canvas.width,
            canvas.height,
          );
          tiles.push(canvas.toDataURL("image/webp", 0.9));
        }
      }
      resolve(tiles);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};
