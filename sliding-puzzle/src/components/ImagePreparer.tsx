import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, LayoutGrid, Check, X, RefreshCw, Move, Square } from "lucide-react";
import type { GridSize } from "../utils/gameLogic";
import { cropImage } from "../utils/imageProcessor";

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface ImagePreparerProps {
  initialImageUrl: string;
  initialSize: GridSize;
  onComplete: (data: { processedImageUrl: string; size: GridSize }) => void;
  onCancel?: () => void;
}

export const ImagePreparer: React.FC<ImagePreparerProps> = ({ initialImageUrl, initialSize, onComplete, onCancel }) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [size, setSize] = useState<GridSize>(initialSize);
  const [crop, setCrop] = useState<CropArea>({ x: 10, y: 10, width: 80, height: 80 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    type: "move" | "resize" | null;
    handle?: "tl" | "tr" | "bl" | "br";
    startX: number;
    startY: number;
    startCrop: CropArea;
  } | null>(null);

  // Maintain aspect ratio when size changes
  useEffect(() => {
    const targetAspect = size.cols / size.rows;
    const currentAspect = crop.width / crop.height;
    
    // We only adjust if the difference is significant to avoid infinite loops or jitter
    if (Math.abs(targetAspect - currentAspect) > 0.01) {
      const newCrop = { ...crop };
      if (targetAspect > 1) {
        // Wider than tall
        newCrop.width = Math.min(100 - newCrop.x, 80);
        newCrop.height = newCrop.width / targetAspect;
      } else {
        // Taller than wide
        newCrop.height = Math.min(100 - newCrop.y, 80);
        newCrop.width = newCrop.height * targetAspect;
      }
      setCrop(newCrop);
    }
  }, [size.rows, size.cols]);

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
      const response = await fetch(`https://picsum.photos/1200/800?t=${Date.now()}`);
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
      const processedImageUrl = await cropImage(imageUrl, crop);
      onComplete({ processedImageUrl, size });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onMouseDown = (e: React.MouseEvent, type: "move" | "resize", handle?: "tl" | "tr" | "bl" | "br") => {
    e.stopPropagation();
    setDragState({
      type,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop }
    });
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragState.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragState.startY) / rect.height) * 100;

    const newCrop = { ...dragState.startCrop };
    const targetAspect = size.cols / size.rows;

    if (dragState.type === "move") {
      newCrop.x = Math.max(0, Math.min(100 - newCrop.width, dragState.startCrop.x + dx));
      newCrop.y = Math.max(0, Math.min(100 - newCrop.height, dragState.startCrop.y + dy));
    } else if (dragState.type === "resize") {
      const h = dragState.handle;
      
      // Calculate changes while maintaining aspect ratio
      if (h === "br") {
        const potentialWidth = Math.max(10, Math.min(100 - dragState.startCrop.x, dragState.startCrop.width + dx));
        const potentialHeight = potentialWidth / targetAspect;
        
        if (dragState.startCrop.y + potentialHeight <= 100) {
          newCrop.width = potentialWidth;
          newCrop.height = potentialHeight;
        } else {
          newCrop.height = 100 - dragState.startCrop.y;
          newCrop.width = newCrop.height * targetAspect;
        }
      } else if (h === "tl") {
        const potentialWidth = Math.max(10, Math.min(dragState.startCrop.x + dragState.startCrop.width, dragState.startCrop.width - dx));
        const potentialHeight = potentialWidth / targetAspect;
        const potentialX = dragState.startCrop.x + dragState.startCrop.width - potentialWidth;
        const potentialY = dragState.startCrop.y + dragState.startCrop.height - potentialHeight;

        if (potentialX >= 0 && potentialY >= 0) {
          newCrop.width = potentialWidth;
          newCrop.height = potentialHeight;
          newCrop.x = potentialX;
          newCrop.y = potentialY;
        }
      } else if (h === "tr") {
        const potentialWidth = Math.max(10, Math.min(100 - dragState.startCrop.x, dragState.startCrop.width + dx));
        const potentialHeight = potentialWidth / targetAspect;
        const potentialY = dragState.startCrop.y + dragState.startCrop.height - potentialHeight;

        if (potentialY >= 0) {
          newCrop.width = potentialWidth;
          newCrop.height = potentialHeight;
          newCrop.y = potentialY;
        }
      } else if (h === "bl") {
        const potentialWidth = Math.max(10, Math.min(dragState.startCrop.x + dragState.startCrop.width, dragState.startCrop.width - dx));
        const potentialHeight = potentialWidth / targetAspect;
        const potentialX = dragState.startCrop.x + dragState.startCrop.width - potentialWidth;

        if (potentialX >= 0 && dragState.startCrop.y + potentialHeight <= 100) {
          newCrop.width = potentialWidth;
          newCrop.height = potentialHeight;
          newCrop.x = potentialX;
        }
      }
    }

    setCrop(newCrop);
  }, [dragState, size.rows, size.cols]);

  const onMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState, onMouseMove, onMouseUp]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto select-none">
      {/* Left side: Visual Cropper */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between px-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Square className="w-4 h-4" /> Area Selector (Locked to {size.cols}:{size.rows})
          </label>
          <span className="text-[10px] text-slate-600 font-bold uppercase">Maintains grid aspect ratio</span>
        </div>
        
        <div 
          ref={containerRef}
          className="relative aspect-video bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group touch-none"
        >
          <img src={imageUrl} alt="Setup" className="max-w-full max-h-full object-contain opacity-40 transition-opacity pointer-events-none" />
          
          {/* Interactive Crop Box */}
          <div 
            className={`absolute border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-indigo-500/5 transition-shadow cursor-move ${dragState?.type === 'move' ? 'shadow-[0_0_50px_rgba(99,102,241,0.6)]' : ''}`}
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`
            }}
            onMouseDown={(e) => onMouseDown(e, "move")}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 grid pointer-events-none" style={{
              gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
              gridTemplateRows: `repeat(${size.rows}, 1fr)`,
            }}>
              {Array.from({ length: size.rows * size.cols }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-indigo-500/30" />
              ))}
            </div>

            {/* Resize Handles */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nwse-resize border-2 border-white shadow-lg active:scale-125 transition-transform" onMouseDown={(e) => onMouseDown(e, "resize", "tl")} />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nesw-resize border-2 border-white shadow-lg active:scale-125 transition-transform" onMouseDown={(e) => onMouseDown(e, "resize", "tr")} />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nesw-resize border-2 border-white shadow-lg active:scale-125 transition-transform" onMouseDown={(e) => onMouseDown(e, "resize", "bl")} />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full cursor-nwse-resize border-2 border-white shadow-lg active:scale-125 transition-transform" onMouseDown={(e) => onMouseDown(e, "resize", "br")} />
          </div>

          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
              <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Right side: Config */}
      <div className="w-full lg:w-[350px] space-y-8">
        <section className="space-y-6">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Grid Resolution
          </label>
          <div className="space-y-8 p-6 bg-white/5 rounded-[2rem] border border-white/10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rows</span>
                <span className="text-2xl font-black text-indigo-400 leading-none">{size.rows}</span>
              </div>
              <input 
                type="range" min="2" max="5" value={size.rows} 
                onChange={(e) => setSize({ ...size, rows: parseInt(e.target.value) })} 
                className="w-full h-2 bg-indigo-500/20 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Columns</span>
                <span className="text-2xl font-black text-purple-400 leading-none">{size.cols}</span>
              </div>
              <input 
                type="range" min="2" max="5" value={size.cols} 
                onChange={(e) => setSize({ ...size, cols: parseInt(e.target.value) })} 
                className="w-full h-2 bg-purple-500/20 rounded-lg appearance-none cursor-pointer accent-purple-500" 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Camera className="w-4 h-4" /> Media Source
          </label>
          <div className="flex flex-col gap-3">
            <label className="relative flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest">Upload Image</span>
            </label>
            <button onClick={handleRandomImage} className="py-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all text-xs font-black uppercase tracking-widest">
              Random Artwork
            </button>
          </div>
        </section>

        <div className="pt-4 flex gap-3">
          {onCancel && (
            <button onClick={onCancel} className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Generate Puzzle
          </button>
        </div>
      </div>
    </div>
  );
};
