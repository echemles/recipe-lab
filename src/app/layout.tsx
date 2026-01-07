import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  title: "Recipe Lab",
  description: "Pantry-first cooking with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-bg text-text antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b border-border bg-surface-1/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <Link href="/recipes" className="text-lg font-semibold">
                Recipe Lab
              </Link>
              <nav className="flex items-center gap-6 text-sm text-muted">
                <Link href="/recipes" className="hover:text-text transition-colors">
                  All recipes
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <div className="mx-auto max-w-5xl px-6">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
