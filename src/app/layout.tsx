import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Oxygen } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
});

const oxygen = Oxygen({
  variable: "--font-oxygen",
  weight: ["300", "400", "700"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "MyCardioGen · India Launch Invitation",
  description:
    "You are cordially invited to the India launch of MyCardioGen — a paradigm shift in preventive heart screening. Saturday, 28 November 2026, Le Méridien, New Delhi.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0302",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${oxygen.variable}`}>
      <body>{children}</body>
    </html>
  );
}
