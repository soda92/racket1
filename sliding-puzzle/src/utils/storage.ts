import localforage from "localforage";

// Initialize localforage
localforage.config({
  name: "sliding-puzzle",
  storeName: "puzzle_data"
});

export interface LevelProgress {
  solved: boolean;
  bestMoves: number;
  bestTime: number;
}

const KEYS = {
  PROGRESS: (levelId: string) => `progress_${levelId}`,
  ASSET: (imageUrl: string) => `asset_${imageUrl}`,
  GALLERY_DOWNLOADED: (galleryId: string) => `gallery_downloaded_${galleryId}`
};

export const storage = {
  // Level Progress
  saveProgress: async (levelId: string, progress: LevelProgress) => {
    const existing = await storage.getProgress(levelId);
    if (existing) {
      const updated = {
        solved: true,
        bestMoves: Math.min(existing.bestMoves, progress.bestMoves),
        bestTime: Math.min(existing.bestTime, progress.bestTime)
      };
      return localforage.setItem(KEYS.PROGRESS(levelId), updated);
    }
    return localforage.setItem(KEYS.PROGRESS(levelId), progress);
  },

  getProgress: async (levelId: string): Promise<LevelProgress | null> => {
    return localforage.getItem<LevelProgress>(KEYS.PROGRESS(levelId));
  },

  // Assets (Offline Images)
  cacheImage: async (imageUrl: string): Promise<string> => {
    const cached = await localforage.getItem<string>(KEYS.ASSET(imageUrl));
    if (cached) return cached;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          localforage.setItem(KEYS.ASSET(imageUrl), dataUrl);
          resolve(dataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to cache image", err);
      return imageUrl; // Fallback to original URL
    }
  },

  getCachedImage: async (imageUrl: string): Promise<string> => {
    const cached = await localforage.getItem<string>(KEYS.ASSET(imageUrl));
    return cached || imageUrl;
  },

  // Gallery State
  setGalleryDownloaded: async (galleryId: string, downloaded: boolean) => {
    return localforage.setItem(KEYS.GALLERY_DOWNLOADED(galleryId), downloaded);
  },

  isGalleryDownloaded: async (galleryId: string): Promise<boolean> => {
    return (await localforage.getItem<boolean>(KEYS.GALLERY_DOWNLOADED(galleryId))) || false;
  }
};
