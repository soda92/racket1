# Asset Gallery & Offline Progression Plan

## Goals

Implement an "Asset Gallery" feature allowing users to browse curated image
sets, download them for offline play, track solved puzzles, and progress through
levels smoothly.

## 1. Setup & Dependencies

- **Storage:** Install `localforage` for simple, robust IndexedDB interactions
  to store large image blobs and user progress.
- **PWA / Offline Shell:** Install `vite-plugin-pwa` and configure
  `vite.config.ts` to enable service worker generation, ensuring the app shell
  (HTML/JS/CSS) works offline.

## 2. Data Architecture

- **Gallery Definitions:** Create `src/data/galleries.ts` to define static,
  curated galleries.
  - `Gallery` Interface: `id`, `name`, `description`, `coverUrl`,
    `levels: Level[]`.
  - `Level` Interface: `id`, `title`, `imageUrl`, `defaultSize` (e.g., 3x3,
    4x4).
- **Storage Layer (`src/utils/storage.ts`):**
  - Manage IndexedDB via `localforage`.
  - Keys for Progress: `progress_<levelId>` ->
    `{ solved: boolean, bestMoves: number, bestTime: number }`.
  - Keys for Assets: `asset_<galleryId>_<levelId>` -> `Blob` or `DataURL`.
  - Keys for Gallery State: `gallery_downloaded_<galleryId>` -> `boolean`.

## 3. Progression Logic (Flexible / Tracking Only)

- All levels within a gallery are immediately accessible to the user.
- The UI will track and display which levels have been "solved" (e.g., showing a
  checkmark or revealing the full uncropped image thumbnail instead of a
  blurred/grayscale version).
- **Next Level Flow:** Upon solving a puzzle (`WinOverlay`), if the user is
  playing a gallery level, a "Next Level" button will be provided to seamlessly
  load the next puzzle in the sequence.

## 4. UI/UX Enhancements

- **Main Navigation:** Update the root `App.tsx` or `SlidingPuzzle.tsx` to
  handle routing/state between the "Main Menu / Setup", "Gallery Browser", and
  "Active Game".
- **Gallery Browser (`GalleryList.tsx`):** A view displaying all available
  galleries.
- **Gallery Detail (`GalleryDetail.tsx`):**
  - Displays all levels within the selected gallery.
  - Includes a "Download for Offline Play" button that fetches and stores all
    level images into IndexedDB.
  - Shows solved status for each level.
- **Game Integration:** Modify `SlidingPuzzle` to accept a `Level` object. If
  provided, it loads the image (preferring the local IndexedDB cache if
  downloaded) and hooks into the "Next Level" progression upon winning.

## Implementation Steps

1. Install `localforage` and `vite-plugin-pwa`.
2. Configure PWA in Vite.
3. Build the data models and `localforage` storage utility.
4. Implement the `GalleryList` and `GalleryDetail` UI components.
5. Integrate gallery state into `SlidingPuzzle` and update `WinOverlay` for the
   "Next Level" action.
6. Test downloading, offline capability, and progression flow.
