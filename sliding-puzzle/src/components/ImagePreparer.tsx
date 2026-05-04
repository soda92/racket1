import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Focus,
  LayoutGrid,
  RefreshCw,
  Square,
  X,
} from "lucide-react";
import type { GridSize } from "../utils/gameLogic.ts";
import { cropImage } from "../utils/imageProcessor.ts";

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface ImagePreparerProps {
  initialImageUrl: string;
  initialSize: GridSize;
  onComplete: (
    data: {
      processedImageUrl: string;
      initialImageUrl: string;
      size: GridSize;
    },
  ) => void;
  onCancel?: () => void;
}

export const ImagePreparer: React.FC<ImagePreparerProps> = (
  { initialImageUrl, initialSize, onComplete, onCancel },
) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [size, setSize] = useState<GridSize>(initialSize);
  const [crop, setCrop] = useState<CropArea>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgAspect, setImgAspect] = useState(1.5);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<
    {
      type: "move" | "resize" | null;
      handle?: "tl" | "tr" | "bl" | "br";
      startX: number;
      startY: number;
      startCrop: CropArea;
    } | null
  >(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgAspect(img.width / img.height);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate the actual playing area (inner crop)
  // To keep tiles SQUARE, the inner area aspect must be cols / rows
  const calculateInnerCrop = (
    currentCrop: CropArea,
    targetSize: GridSize,
    imageAspect: number,
  ) => {
    const targetAspect = targetSize.cols / targetSize.rows;

    // Current aspect of selection in pixels = (width_pct / height_pct) * imageAspect
    const currentAspect = (currentCrop.width / currentCrop.height) *
      imageAspect;

    let innerWidth = currentCrop.width;
    let innerHeight = currentCrop.height;
    let innerX = 0;
    let innerY = 0;

    if (currentAspect > targetAspect) {
      // Selection is wider than target aspect
      innerWidth = (currentCrop.height * targetAspect) / imageAspect;
      innerX = (currentCrop.width - innerWidth) / 2;
    } else {
      // Selection is taller than target aspect
      innerHeight = (currentCrop.width / targetAspect) * imageAspect;
      innerY = (currentCrop.height - innerHeight) / 2;
    }

    return {
      x: currentCrop.x + innerX,
      y: currentCrop.y + innerY,
      width: innerWidth,
      height: innerHeight,
      relativeX: innerX,
      relativeY: innerY,
      relativeWidth: innerWidth,
      relativeHeight: innerHeight,
    };
  };

  const innerCrop = calculateInnerCrop(crop, size, imgAspect);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRandomImage = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://picsum.photos/1200/800?t=${Date.now()}`,
      );
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const processedImageUrl = await cropImage(imageUrl, {
        x: innerCrop.x,
        y: innerCrop.y,
        width: innerCrop.width,
        height: innerCrop.height,
      });
      onComplete({
        processedImageUrl,
        initialImageUrl: imageUrl,
        size,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: "move" | "resize",
    handle?: "tl" | "tr" | "bl" | "br",
  ) => {
    e.stopPropagation();
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      type,
      handle,
      startX: clientX,
      startY: clientY,
      startCrop: { ...crop },
    });
  };

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState || !containerRef.current) return;

    // Prevent scrolling when dragging on mobile
    if (e.type === "touchmove") {
      e.preventDefault();
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((clientX - dragState.startX) / rect.width) * 100;
    const dy = ((clientY - dragState.startY) / rect.height) * 100;

    const newCrop = { ...dragState.startCrop };

    if (dragState.type === "move") {
      newCrop.x = Math.max(
        0,
        Math.min(100 - newCrop.width, dragState.startCrop.x + dx),
      );
      newCrop.y = Math.max(
        0,
        Math.min(100 - newCrop.height, dragState.startCrop.y + dy),
      );
    } else if (dragState.type === "resize") {
      const h = dragState.handle;
      if (h === "br") {
        newCrop.width = Math.max(
          10,
          Math.min(100 - dragState.startCrop.x, dragState.startCrop.width + dx),
        );
        newCrop.height = Math.max(
          10,
          Math.min(
            100 - dragState.startCrop.y,
            dragState.startCrop.height + dy,
          ),
        );
      } else if (h === "tl") {
        const newX = Math.max(
          0,
          Math.min(
            dragState.startCrop.x + dragState.startCrop.width - 10,
            dragState.startCrop.x + dx,
          ),
        );
        newCrop.width = dragState.startCrop.width +
          (dragState.startCrop.x - newX);
        newCrop.x = newX;
        const newY = Math.max(
          0,
          Math.min(
            dragState.startCrop.y + dragState.startCrop.height - 10,
            dragState.startCrop.y + dy,
          ),
        );
        newCrop.height = dragState.startCrop.height +
          (dragState.startCrop.y - newY);
        newCrop.y = newY;
      } else if (h === "tr") {
        newCrop.width = Math.max(
          10,
          Math.min(100 - dragState.startCrop.x, dragState.startCrop.width + dx),
        );
        const newY = Math.max(
          0,
          Math.min(
            dragState.startCrop.y + dragState.startCrop.height - 10,
            dragState.startCrop.y + dy,
          ),
        );
        newCrop.height = dragState.startCrop.height +
          (dragState.startCrop.y - newY);
        newCrop.y = newY;
      } else if (h === "bl") {
        const newX = Math.max(
          0,
          Math.min(
            dragState.startCrop.x + dragState.startCrop.width - 10,
            dragState.startCrop.x + dx,
          ),
        );
        newCrop.width = dragState.startCrop.width +
          (dragState.startCrop.x - newX);
        newCrop.x = newX;
        newCrop.height = Math.max(
          10,
          Math.min(
            100 - dragState.startCrop.y,
            dragState.startCrop.height + dy,
          ),
        );
      }
    }

    setCrop(newCrop);
  }, [dragState]);

  const onEnd = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      globalThis.addEventListener("mousemove", onMove);
      globalThis.addEventListener("mouseup", onEnd);
      globalThis.addEventListener("touchmove", onMove, { passive: false });
      globalThis.addEventListener("touchend", onEnd);
    }
    return () => {
      globalThis.removeEventListener("mousemove", onMove);
      globalThis.removeEventListener("mouseup", onEnd);
      globalThis.removeEventListener("touchmove", onMove);
      globalThis.removeEventListener("touchend", onEnd);
    };
  }, [dragState, onMove, onEnd]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto select-none">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between px-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Square className="w-4 h-4" /> Frame Selection
          </label>
          <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-black uppercase tracking-widest">
            <Focus className="w-3 h-3" /> Square tiles guaranteed
          </div>
        </div>

        <div className="relative aspect-video bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group touch-none">
          <div
            ref={containerRef}
            className="relative shadow-2xl"
            style={{
              aspectRatio: imgAspect,
              maxHeight: "100%",
              maxWidth: "100%",
            }}
          >
            <img
              src={imageUrl}
              alt="Setup"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />

            <div
              className={`absolute border border-white/30 bg-white/5 transition-shadow cursor-move ${
                dragState?.type === "move" ? "bg-white/10" : ""
              }`}
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
              onMouseDown={(e) => onStart(e, "move")}
              onTouchStart={(e) => onStart(e, "move")}
            >
              {/* Aspect-Correct Result Overlay */}
              <div
                className="absolute border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-black/10 pointer-events-none overflow-hidden"
                style={{
                  left: `${(innerCrop.relativeX / crop.width) * 100}%`,
                  top: `${(innerCrop.relativeY / crop.height) * 100}%`,
                  width: `${(innerCrop.relativeWidth / crop.width) * 100}%`,
                  height: `${(innerCrop.relativeHeight / crop.height) * 100}%`,
                }}
              >
                <div
                  className="absolute"
                  style={{
                    left: `${-(innerCrop.x / innerCrop.width) * 100}%`,
                    top: `${-(innerCrop.y / innerCrop.height) * 100}%`,
                    width: `${(100 / innerCrop.width) * 100}%`,
                    height: `${(100 / innerCrop.height) * 100}%`,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-100"
                  />
                </div>

                <div
                  className="absolute inset-0 grid z-10"
                  style={{
                    gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${size.rows}, 1fr)`,
                  }}
                >
                  {Array.from({ length: size.rows * size.cols }).map((_, i) => (
                    <div
                      key={i}
                      className="border-[0.5px] border-indigo-400/30"
                    />
                  ))}
                </div>
              </div>

              <div
                className="absolute -top-2 -left-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nwse-resize border-2 border-white shadow-lg active:scale-125 transition-transform z-20"
                onMouseDown={(e) => onStart(e, "resize", "tl")}
                onTouchStart={(e) => onStart(e, "resize", "tl")}
              />
              <div
                className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nesw-resize border-2 border-white shadow-lg active:scale-125 transition-transform z-20"
                onMouseDown={(e) => onStart(e, "resize", "tr")}
                onTouchStart={(e) => onStart(e, "resize", "tr")}
              />
              <div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nesw-resize border-2 border-white shadow-lg active:scale-125 transition-transform z-20"
                onMouseDown={(e) => onStart(e, "resize", "bl")}
                onTouchStart={(e) => onStart(e, "resize", "bl")}
              />
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nwse-resize border-2 border-white shadow-lg active:scale-125 transition-transform z-20"
                onMouseDown={(e) => onStart(e, "resize", "br")}
                onTouchStart={(e) => onStart(e, "resize", "br")}
              />
            </div>
          </div>

          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
              <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-87.5 space-y-8">
        <section className="space-y-6">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Grid Resolution
          </label>
          <div className="space-y-8 p-6 bg-white/5 rounded-4xl border border-white/10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Rows
                </span>
                <span className="text-2xl font-black text-indigo-400 leading-none">
                  {size.rows}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                value={size.rows}
                onChange={(e) =>
                  setSize({ ...size, rows: parseInt(e.target.value) })}
                className="w-full h-2 bg-indigo-500/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Columns
                </span>
                <span className="text-2xl font-black text-purple-400 leading-none">
                  {size.cols}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                value={size.cols}
                onChange={(e) =>
                  setSize({ ...size, cols: parseInt(e.target.value) })}
                className="w-full h-2 bg-purple-500/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase text-center px-4 leading-relaxed">
            The indigo grid shows the actual puzzle area.<br />Tiles are always
            perfect squares.
          </p>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Camera className="w-4 h-4" /> Media Source
          </label>
          <div className="flex flex-col gap-3">
            <label className="relative flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest">
                Upload Image
              </span>
            </label>
            <button
              type="button"
              onClick={handleRandomImage}
              className="py-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all text-xs font-black uppercase tracking-widest"
            >
              Random Artwork
            </button>
          </div>
        </section>

        <div className="pt-4 flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-3 bg-linear-to-r from-indigo-500 to-purple-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Generate Puzzle
          </button>
        </div>
      </div>
    </div>
  );
};
