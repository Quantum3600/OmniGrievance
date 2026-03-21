import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { ShieldAlert, Menu } from "lucide-react";const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniGrievance Platform",
  description: "The Zero-Friction Digital Nervous System for Civic Issue Resolution",
  manifest: "/manifest.json",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          
          {/* Global Navigation Bar */}
          <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <ShieldAlert className="h-8 w-8 text-blue-600 dark:text-blue-500 mr-2" />
                    <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">OmniGrievance</span>
                  </div>
                  <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                    <Link href="/report" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                      Report Issue
                    </Link>
                    <Link href="/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                      Track Status
                    </Link>
                    <Link href="/transparency" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                      Public Transparency
                    </Link>
                  </div>
                </div>
                {/* Mobile menu button mock styling */}
                <div className="sm:hidden flex items-center">
                  <button type="button" className="text-slate-500 hover:text-slate-600 dark:text-slate-400 p-2">
                    <Menu className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-grow">
            {children}
          </main>
          
        </ThemeProvider>
      </body>
    </html>
  );
}
