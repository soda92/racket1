export interface Level {
  id: string;
  title: string;
  imageUrl: string;
  defaultSize: { rows: number; cols: number };
}

export interface Gallery {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  levels: Level[];
}

export const GALLERIES: Gallery[] = [
  {
    id: "pixel-landscapes",
    name: "Pixel Landscapes",
    description: "Serene environments rendered in beautiful pixels.",
    coverUrl: "https://picsum.photos/id/10/800/600",
    levels: [
      {
        id: "mountains-1",
        title: "Purple Peaks",
        imageUrl: "https://picsum.photos/id/10/1200/800",
        defaultSize: { rows: 3, cols: 3 },
      },
      {
        id: "forest-1",
        title: "Eternal Grove",
        imageUrl: "https://picsum.photos/id/28/1200/800",
        defaultSize: { rows: 3, cols: 3 },
      },
      {
        id: "lake-1",
        title: "Mirror Lake",
        imageUrl: "https://picsum.photos/id/46/1200/800",
        defaultSize: { rows: 4, cols: 4 },
      },
    ],
  },
  {
    id: "natures-patterns",
    name: "Nature's Patterns",
    description: "The intricate geometry of the natural world.",
    coverUrl: "https://picsum.photos/id/11/800/600",
    levels: [
      {
        id: "leaf-1",
        title: "Veins of Life",
        imageUrl: "https://picsum.photos/id/11/1200/800",
        defaultSize: { rows: 3, cols: 3 },
      },
      {
        id: "stone-1",
        title: "Crystalline Path",
        imageUrl: "https://picsum.photos/id/12/1200/800",
        defaultSize: { rows: 4, cols: 4 },
      },
      {
        id: "water-1",
        title: "Ripple Theory",
        imageUrl: "https://picsum.photos/id/15/1200/800",
        defaultSize: { rows: 5, cols: 5 },
      },
    ],
  },
];
