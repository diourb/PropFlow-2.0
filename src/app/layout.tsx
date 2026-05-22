import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
