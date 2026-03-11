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
  title: "Evercreate",
  description: "We build your company's custom platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-950 text-white antialiased`}
      >
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4">
          <a href="/" className="text-sm font-semibold tracking-tight text-white">
            Evercreate
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}
