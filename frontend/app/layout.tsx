import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { Globe, Accessibility } from "lucide-react";
import { MainNav } from "@/components/main-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniGrievance — Zero-Friction Civic Resolution Platform",
  description:
    "AI-native Digital Nervous System for zero-friction civic grievance resolution. Report issues via text, voice, or photo — no forms, no dropdowns.",
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
      <body className="min-h-full flex flex-col bg-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* ═══ Global National Flag Background (Subtle Watermark) ═══ */}
          <div 
            className="fixed inset-0 z-[-1] opacity-[0.12] pointer-events-none select-none"
            style={{
              backgroundImage: "url('https://cdn.pixabay.com/photo/2022/08/13/04/56/indian-flag-7382909_1280.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />

          {/* ═══ Tricolor Top Bar (MyGov.in inspired) ═══ */}
          <div className="flex h-1.5 w-full">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-green-600" />
          </div>

          {/* ═══ Government Header Strip ═══ */}
          <div className="bg-slate-800 text-slate-300 text-xs py-1.5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <span className="font-medium hidden sm:inline">
                Government of India — Digital Initiative
              </span>
              <span className="font-medium sm:hidden text-[11px]">
                🇮🇳 Govt of India
              </span>
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  aria-label="Accessibility options"
                >
                  <Accessibility className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Accessibility</span>
                </button>
                <button
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  aria-label="Language selector"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>English</span>
                </button>
              </div>
            </div>
          </div>

          {/* ═══ Official Ministry Header ═══ */}
          <div className="bg-white border-b border-slate-200 py-3 sm:py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                  alt="National Emblem of India" 
                  className="h-14 sm:h-20 w-auto"
                />
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <span>भारत सरकार</span>
                    <span className="text-slate-300">|</span>
                    <span>Government of India</span>
                  </div>
                  <div className="text-sm sm:text-[22px] font-extrabold text-[#660033] leading-tight sm:leading-snug mt-1">
                    Ministry of Public Grievances & Digital Governance
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                    Department of Administrative Reforms
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Main Navigation Bar ═══ */}
          <MainNav />

          {/* ═══ Main Content ═══ */}
          <main className="flex-grow">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
