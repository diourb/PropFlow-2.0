import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PropFlow 2.0",
    short_name: "PropFlow",
    description: "Property operations, booking, cleaning, and maintenance workflows.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8ff",
    theme_color: "#0b2545",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
