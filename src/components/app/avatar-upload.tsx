"use client";

import Image from "next/image";
import { useRef } from "react";
import { Camera } from "lucide-react";

export function AvatarUpload({ src, name }: { src: string; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mx-auto mb-4 h-24 w-24">
      <Image
        alt={name}
        className="rounded-full object-cover ring-4 ring-surface"
        fill
        sizes="96px"
        src={src}
      />
      <button
        aria-label="Change avatar photo"
        className="absolute bottom-0 right-0 rounded-full bg-secondary p-2 text-on-secondary hover:bg-secondary-fixed"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <Camera size={15} />
      </button>
      <input
        accept="image/*"
        className="sr-only"
        ref={inputRef}
        type="file"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            // In production this would upload to Supabase storage
            // For now show the browser's native file picker result as confirmation
            const url = URL.createObjectURL(file);
            const img = document.querySelector<HTMLImageElement>('[data-avatar-preview]');
            if (img) img.src = url;
          }
        }}
      />
    </div>
  );
}
