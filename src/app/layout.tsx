import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { Caveat } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Recipe Lab",
  description: "Pantry-first cooking with AI assistance",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${caveat.variable} text-text antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 bg-surface-1/80 backdrop-blur-sm border-b border-border">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:gap-0 sm:px-6 sm:py-4">
              <Link
                href="/"
                className="font-caveat font-semibold tracking-normal normal-case flex items-center gap-1 sm:gap-2 text-3xl sm:text-5xl md:text-6xl"
                style={{ letterSpacing: '-0.15rem' }}
              >
                <span className="whitespace-nowrap">Recipe Lab</span>
                <Image
                  src="/orange-bag.png"
                  alt="Orange bag icon"
                  width={72}
                  height={72}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18"
                  priority
                />
              </Link>
              <nav className="flex items-center gap-4 text-xs sm:text-sm text-muted tracking-[0.01em]">
                <Link href="/recipes" className="hover:text-text transition-colors">
                  All recipes
                </Link>
                <Link href="/grocery" className="hover:text-text transition-colors">
                  Grocery list
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <div className="mx-auto max-w-5xl px-4 sm:px-6" data-testid="app-shell">{children}</div>
          <footer className="landing-footer border-t border-border bg-surface-1/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted text-center sm:flex-row sm:text-left">
              <span>© {new Date().getFullYear()} Lester Echem. All rights reserved.</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
