'use client'

import React, { useState } from "react"
import { Building2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface PropertyImageGalleryProps {
  images: string[]
  coverImage?: string | null
}

export function PropertyImageGallery({ images, coverImage }: PropertyImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  const allImages = images.length > 0 ? images : []
  const currentImage = allImages[selectedImage]

  return (
    <div className="space-y-4">
      <div className=" aspect-3/2 max-h-[70vh] bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
        {currentImage ? (
          <Image
            src={currentImage}
            alt="Property featured image"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Building2 className="w-16 h-16 text-slate-200" />
            <p className="text-slate-400 font-medium">No images available</p>
          </div>
        )}
      </div>

      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "w-24 h-20 rounded-xl bg-slate-100 shrink-0 border-2 transition-all flex items-center justify-center relative overflow-hidden shadow-sm",
                selectedImage === idx ? "border-emerald-500 ring-2 ring-emerald-50" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`Property thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
