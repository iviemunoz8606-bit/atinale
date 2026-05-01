import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atínale — Quinielas Deportivas",
  description: "Únete a la quiniela, predice los partidos y gana el pozo. FIFA World Cup 2026 y Liga MX.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Atínale — Quinielas Deportivas",
    description: "Predice, compite y gana. FIFA World Cup 2026 y Liga MX.",
    url: "https://atinale-ecru.vercel.app",
    siteName: "Atínale",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "https://atinale-ecru.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Atínale — Quinielas Deportivas",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
