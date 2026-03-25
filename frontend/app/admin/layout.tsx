"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, ShieldCheck, Users, UserPlus, Grid, LayoutDashboard, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true, ["ADMIN"]);
  const pathname = usePathname();

  if (loading) return null;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/grievances", label: "Operations Hub", icon: ShieldAlert },
    { href: "/admin/employees", label: "All Employees", icon: Users },
    { href: "/admin/employees/create", label: "Create Employee", icon: UserPlus },
    { href: "/admin/categories", label: "Categories", icon: Grid },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-white leading-none">System Administration</h1>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">OmniGrievance Command</p>
          </div>
        </div>
        
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-100">
             <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
                <p className="text-xs font-bold text-slate-700 truncate">{user?.token ? "System Root" : "Admin"}</p>
             </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
