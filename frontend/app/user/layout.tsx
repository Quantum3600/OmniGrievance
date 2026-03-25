"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Megaphone,
  ClipboardList,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/user/report", label: "Report Issue", icon: Megaphone },
  { href: "/user/tracker", label: "Track Status", icon: ClipboardList },
  { href: "/user/profile", label: "My Profile", icon: UserCircle },
];

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("omni_token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-[calc(100vh-180px)]">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white shrink-0">
        {/* Citizen Badge */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm leading-none">
                Citizen Portal
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                OmniGrievance
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                  isActive
                    ? "bg-orange-50 text-orange-700 shadow-sm border border-orange-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-orange-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {item.label}
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-orange-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  isActive
                    ? "text-orange-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 bg-gradient-to-br from-orange-50/30 via-white to-slate-50 lg:pb-0 pb-20">
        {children}
      </main>
    </div>
  );
}
