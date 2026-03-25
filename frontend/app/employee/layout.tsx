"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, Briefcase } from "lucide-react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true, ["EMPLOYEE"]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 leading-none">Employee Portal</h1>
            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">OmniGrievance Node</p>
          </div>
        </div>

        {/* Logout is handled by the Global MainNav */}
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

