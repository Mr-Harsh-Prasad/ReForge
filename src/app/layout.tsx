import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Reforge — Reforge Yourself. One Day at a Time.",
    template: "%s | Reforge",
  },
  description:
    "Reforge is your premium personal growth platform. Track daily missions, achieve goals, and build unstoppable momentum with gamified habits.",
  keywords: ["habit tracker", "goal setting", "personal growth", "productivity", "daily missions"],
  authors: [{ name: "Reforge" }],
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Reforge — Reforge Yourself. One Day at a Time.",
    description: "Your premium personal growth platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
