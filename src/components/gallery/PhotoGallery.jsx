import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function PhotoGallery({ images, titles, currentIndex = 0, onClose }) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images]);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[activeIndex]}
          alt={titles?.[activeIndex] || `Immagine ${activeIndex + 1}`}
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />

        <button onClick={onClose} className="absolute -top-4 -right-4 md:top-2 md:right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-0 md:-left-16 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={nextImage} className="absolute right-0 md:-right-16 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}