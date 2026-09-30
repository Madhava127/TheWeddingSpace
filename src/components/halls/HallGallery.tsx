'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function HallGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {images.slice(0, 4).map((img, idx) => (
          <div 
            key={idx} 
            className={`relative rounded-xl overflow-hidden cursor-pointer ${idx === 0 ? 'md:col-span-2 md:row-span-2 h-[300px] md:h-[616px]' : 'h-[300px]'}`}
            onClick={() => setSelectedIndex(idx)}
          >
            <Image
              src={img}
              alt={`Gallery image ${idx + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
            {idx === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">+{images.length - 4} More</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button 
            className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setSelectedIndex(null)}
          >
            <X size={32} />
          </button>
          
          <button 
            className="absolute left-6 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1))}
          >
            <ChevronLeft size={48} />
          </button>

          <div className="relative w-full max-w-5xl aspect-video">
            <Image
              src={images[selectedIndex]}
              alt={`Gallery image ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <button 
            className="absolute right-6 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0))}
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </>
  );
}
