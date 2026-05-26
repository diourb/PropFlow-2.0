"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

export function AvatarUpload({
  src,
  name,
  userId,
  hasStorage,
}: {
  src: string;
  name: string;
  userId?: string;
  hasStorage?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(src);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!hasStorage || !userId) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("userId", userId);

      const res = await fetch("/api/storage/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Upload failed.");
      }

      const { signedUrl } = (await res.json()) as { signedUrl: string };
      setPreview(signedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative mx-auto mb-4 h-24 w-24">
      <Image
        alt={name}
        className="rounded-full object-cover ring-4 ring-surface"
        data-avatar-preview
        fill
        sizes="96px"
        src={preview}
      />
      <button
        aria-label="Change avatar photo"
        className="absolute bottom-0 right-0 rounded-full bg-secondary p-2 text-on-secondary hover:bg-secondary-fixed disabled:opacity-60"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {uploading ? <Loader2 className="animate-spin" size={15} /> : <Camera size={15} />}
      </button>
      <input
        accept="image/*"
        className="sr-only"
        ref={inputRef}
        type="file"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {!hasStorage && userId ? (
        <p className="absolute -bottom-8 left-1/2 w-48 -translate-x-1/2 text-center text-xs text-on-surface-variant">
          Storage requires Supabase configuration
        </p>
      ) : null}
      {error ? (
        <p className="absolute -bottom-8 left-1/2 w-48 -translate-x-1/2 text-center text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
