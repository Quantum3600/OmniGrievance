"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ShieldAlert, Mail, KeyRound, ArrowLeft, User, Shield, Briefcase, Home } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [role, setRole] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
    setIdentifier("");
    setPassword("");
    setOtp("");
    setOtpSent(false);
    setError("");
  };

  const finalizeLogin = (token: string, isProfileComplete: boolean, roleValue: string) => {
    localStorage.setItem("omni_token", token);
    localStorage.setItem("omni_profile_complete", isProfileComplete ? "true" : "false");
    localStorage.setItem("omni_role", roleValue);
    
    if (!isProfileComplete) {
      if (roleValue === "EMPLOYEE") router.push("/employee/profile-setup");
      else if (roleValue === "CITIZEN") router.push("/user/profile-setup");
    } else {
      if (roleValue === "EMPLOYEE") router.push("/employee/dashboard");
      else if (roleValue === "ADMIN") router.push("/admin");
      else router.push("/user/report");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setError("");
    try {
      if (role === "CITIZEN") {
        if (!otpSent) {
          await apiClient("/auth/citizen/request-otp", {
            method: "POST",
            body: JSON.stringify({ email: identifier }),
          });
          setOtpSent(true);
        } else {
          const res = await apiClient("/auth/citizen/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email: identifier, otp }),
          });
          finalizeLogin(res.access_token, res.is_profile_complete, "CITIZEN");
        }
      } else if (role === "ADMIN") {
        const res = await apiClient("/auth/admin/login", {
          method: "POST",
          body: JSON.stringify({ login_id: identifier, password }),
        });
        finalizeLogin(res.access_token, res.is_profile_complete, "ADMIN");
      } else if (role === "EMPLOYEE") {
        const res = await apiClient("/auth/employee/login", {
          method: "POST",
          body: JSON.stringify({ login_id: identifier, password }),
        });
        finalizeLogin(res.access_token, res.is_profile_complete, "EMPLOYEE");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const idConfig = (() => {
    switch (role) {
      case "CITIZEN": return { label: "Email ID", icon: Mail, type: "email", placeholder: "citizen@example.com" };
      case "ADMIN": return { label: "Admin ID", icon: Shield, type: "text", placeholder: "ADM-1234" };
      case "EMPLOYEE": return { label: "Employee ID", icon: Briefcase, type: "text", placeholder: "EMP-5678" };
      default: return { label: "Identifier", icon: Mail, type: "text", placeholder: "" };
    }
  })();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="w-full max-w-2xl space-y-8">
        
        <div className="flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm group">
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" /> Home
          </Link>
          <button onClick={() => handleRoleSelection("CITIZEN")} className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md focus:outline-none">
            New Citizen? Register
          </button>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-orange-400 via-white to-green-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-500">
                <ShieldAlert className="h-8 w-8 text-blue-900" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Secure Portal Login</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 flex z-10">
            <div className="flex-1 bg-orange-500"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-green-500"></div>
          </div>

          <div className="p-8 sm:p-10 relative z-0">
            {!role ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Select Login Role</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <button onClick={() => handleRoleSelection("CITIZEN")} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-orange-200 flex items-center justify-center mb-4"><User className="w-7 h-7 text-slate-600 group-hover:text-orange-700" /></div>
                    <span className="font-bold text-slate-800 group-hover:text-orange-800">Citizen (User)</span>
                  </button>
                  <button onClick={() => handleRoleSelection("ADMIN")} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-blue-200 flex items-center justify-center mb-4"><Shield className="w-7 h-7 text-slate-600 group-hover:text-blue-700" /></div>
                    <span className="font-bold text-slate-800 group-hover:text-blue-800">Administrator</span>
                  </button>
                  <button onClick={() => handleRoleSelection("EMPLOYEE")} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-green-200 flex items-center justify-center mb-4"><Briefcase className="w-7 h-7 text-slate-600 group-hover:text-green-700" /></div>
                    <span className="font-bold text-slate-800 group-hover:text-green-800">Govt Employee</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500 w-full max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800">{role.charAt(0) + role.slice(1).toLowerCase()} Login</h3>
                    </div>
                  </div>
                  <button type="button" onClick={() => setRole(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center transition-colors">
                    <ArrowLeft className="w-3 h-3 mr-1" /> Change Role
                  </button>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center"><idConfig.icon className="w-4 h-4 mr-1.5 text-slate-400" /> {idConfig.label}</label>
                    <input name="identifier" type={idConfig.type} required disabled={otpSent && role === "CITIZEN"} className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 transition-all font-medium" placeholder={idConfig.placeholder} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                  </div>

                  {role === "CITIZEN" ? (
                    otpSent && (
                      <div className="space-y-2 animate-in fade-in">
                        <label className="text-sm font-bold text-slate-700 flex items-center"><KeyRound className="w-4 h-4 mr-1.5 text-slate-400" /> OTP</label>
                        <input name="otp" type="text" required className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium tracking-widest text-center text-xl" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} />
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center"><KeyRound className="w-4 h-4 mr-1.5 text-slate-400" /> Password</label>
                      <input name="password" type="password" required className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium tracking-[0.2em]" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  )}

                  {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">{error}</div>}

                  <button type="submit" disabled={loading} className={`w-full rounded-xl py-4 px-4 text-base font-black text-white shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50
                      ${role === 'CITIZEN' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : role === 'ADMIN' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
                    {loading ? "Processing..." : (role === "CITIZEN" && !otpSent ? "Send Login OTP" : `Login as ${role.charAt(0) + role.slice(1).toLowerCase()}`)}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
