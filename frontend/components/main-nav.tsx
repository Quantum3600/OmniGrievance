"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Menu } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  // Hide the nav action buttons on these specific routes
  const hideActionButtons = pathname === "/login" || pathname === "/register";

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <ShieldAlert className="h-5 w-5 text-blue-900" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                  OmniGrievance
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-none mt-0.5">
                  Digital Nervous System
                </span>
              </div>
            </Link>
          </div>

          {!hideActionButtons && (
            <>
              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  Home
                </Link>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow-md transition-all"
                >
                  Login / Register
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
