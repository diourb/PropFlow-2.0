import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PropFlow 2.0",
    template: "%s - PropFlow",
  },
  description:
    "A full-stack property operations platform for mixed rental portfolios.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b2545",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
