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
          <header className="border-b border-border bg-surface-1/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              <Link
                href="/recipes"
                className="text-lg font-semibold tracking-[0.5rem] uppercase flex items-center gap-2"
              >
                <span>RECIPE LAB</span>
                <Image
                  src="/icons/test-tube.svg"
                  alt="Test tube icon"
                  width={20}
                  height={45}
                  className="rotate-45 ml-3 test-tube-icon"
                  priority
                />
              </Link>
              <nav className="flex items-center gap-6 text-sm text-muted tracking-[0.005em]">
                <Link href="/recipes" className="hover:text-text transition-colors">
                  All recipes
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <div className="mx-auto max-w-5xl px-6" data-testid="app-shell">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
