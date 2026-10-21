"use client";

import { useState } from "react";
import Image from "next/image";

export default function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden bg-charcoal-dark">
        <Image
          key={images[active]}
          src={images[active]}
          alt={`${title} — image ${active + 1} of ${images.length}`}
          fill
          priority={active === 0}
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto" role="tablist" aria-label="Gallery">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative h-20 w-32 shrink-0 overflow-hidden transition-opacity ${i === active ? "opacity-100 outline outline-1 outline-winter" : "opacity-60 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="128px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
