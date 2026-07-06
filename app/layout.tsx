import type { Metadata } from "next";
import { Caveat, Patrick_Hand } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className={`${caveat.variable} ${patrick.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
