import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
        className={`${inter.variable} text-text antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 border-b border-border bg-surface-1/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:gap-0 sm:px-6 sm:py-4">
              <Link
                href="/"
                className="text-base sm:text-lg font-semibold tracking-[0.35em] sm:tracking-[0.5em] uppercase flex items-center gap-2"
              >
                <span>RECIPE LAB</span>
                <Image
                  src="/icons/test-tube.svg"
                  alt="Test tube icon"
                  width={18}
                  height={40}
                  className="rotate-45 ml-2 sm:ml-3 test-tube-icon w-5 h-8 sm:w-6 sm:h-10"
                  priority
                />
              </Link>
              <nav className="flex items-center gap-4 text-xs sm:text-sm text-muted tracking-[0.01em]">
                <Link href="/recipes" className="hover:text-text transition-colors">
                  All recipes
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <div className="mx-auto max-w-5xl px-6" data-testid="app-shell">{children}</div>
          <footer className="landing-footer mt-16 border-t border-border bg-surface-1/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted text-center sm:flex-row sm:text-left">
              <span>© {new Date().getFullYear()} Lester Echem. All rights reserved.</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
