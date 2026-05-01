import type { GridSize } from "./gameLogic";

export const sliceImage = async (
  imageSrc: string,
  size: GridSize
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { rows, cols } = size;
      
      // Calculate aspect ratios
      const imgAspect = img.width / img.height;
      const targetAspect = cols / rows;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      // Center crop logic
      if (imgAspect > targetAspect) {
        // Image is wider than target - crop sides
        sourceWidth = img.height * targetAspect;
        sourceX = (img.width - sourceWidth) / 2;
      } else if (imgAspect < targetAspect) {
        // Image is taller than target - crop top/bottom
        sourceHeight = img.width / targetAspect;
        sourceY = (img.height - sourceHeight) / 2;
      }

      const tileWidth = sourceWidth / cols;
      const tileHeight = sourceHeight / rows;
      const tiles: string[] = [];

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Output tiles at a fixed high-ish resolution for quality
      canvas.width = 300; 
      canvas.height = 300 * (tileHeight / tileWidth);

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
            canvas.height
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
