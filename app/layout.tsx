import type { Metadata } from "next";
import {
  Caveat,
  Patrick_Hand,
  Modak,
  Dancing_Script,
  Special_Elite,
  Permanent_Marker,
  Archivo_Black,
} from "next/font/google";
import "./globals.css";
import { SoundToggle } from "@/components/SoundToggle";

// Caveat = flowy handwritten display. Patrick Hand = neat, readable handwriting for body.
const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
});

const patrick = Patrick_Hand({
  variable: "--font-body",
  weight: "400",
  subsets: ["latin"],
});

// writing-style fonts for text elements
const modak = Modak({ variable: "--font-bubble", weight: "400", subsets: ["latin"] });
const dancing = Dancing_Script({ variable: "--font-cursive", subsets: ["latin"] });
const specialElite = Special_Elite({ variable: "--font-typewriter", weight: "400", subsets: ["latin"] });
const marker = Permanent_Marker({ variable: "--font-marker", weight: "400", subsets: ["latin"] });
const archivoBlack = Archivo_Black({ variable: "--font-cutout", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "scrapbook ♡",
  description: "a cozy little scrapbook you make by hand and share with someone you love",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${patrick.variable} ${modak.variable} ${dancing.variable} ${specialElite.variable} ${marker.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SoundToggle />
      </body>
    </html>
  );
}
