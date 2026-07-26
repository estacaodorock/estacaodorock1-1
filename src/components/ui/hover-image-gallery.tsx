"use client";
import { useState } from "react";

interface HoverImageGalleryProps {
  images?: string[];
}

export function HoverImageGallery({
  images = [],
}: HoverImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const getIndexFromPosition = (x: number, width: number) => {
    if (width <= 0 || images.length === 0) return 0;
    const imageIndex = Math.floor((x / width) * images.length);
    return Math.max(0, Math.min(images.length - 1, imageIndex));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    const nextIndex = getIndexFromPosition(x, rect.width);
    setCurrentImageIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const nextIndex = getIndexFromPosition(x, rect.width);
    setCurrentImageIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const nextIndex = getIndexFromPosition(x, rect.width);
    setCurrentImageIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setCurrentImageIndex((i) => Math.min(images.length - 1, i + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrentImageIndex((i) => Math.max(0, i - 1));
    }
  };

  if (images.length === 0) return null;

  return (
    <div className="relative group">
      <div
        className="relative w-[92vw] sm:w-[90vw] max-w-[560px] aspect-square overflow-hidden rounded-lg shadow-lg bg-black/40 z-10 touch-pan-y"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        role="region"
        aria-label={`Galeria interativa: toque e arraste (mobile) ou mova o mouse (desktop) para navegar por ${images.length} imagens.`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <img
          src={images[currentImageIndex]}
          alt={`Imagem da galeria ${currentImageIndex + 1} de ${images.length}`}
          className="w-full h-full object-cover select-none"
          loading="lazy"
          decoding="async"
          draggable={false}
        />

        {isHovering && (
          <div
            className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: mousePosition.x, top: mousePosition.y }}
            aria-hidden="true"
          >
            <div className="bg-white/20 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/30 w-12 h-12 flex items-center justify-center">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
