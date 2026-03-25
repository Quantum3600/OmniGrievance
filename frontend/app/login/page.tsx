"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ShieldAlert, Mail, KeyRound, ArrowLeft, User, Shield, Briefcase, Hash } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [role, setRole] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
    setIdentifier("");
    setPassword("");
    setError("");
  };

  const decodeJWTAndRoute = (token: string) => {
    localStorage.setItem("omni_token", token);
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    
    if (payload.role === "EMPLOYEE") {
      router.push("/employee/dashboard");
    } else if (payload.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/user/report");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setError("");
    try {
      const res = await apiClient("/auth/login-password", {
        method: "POST",
        body: JSON.stringify({ role, identifier, password }),
      });
      decodeJWTAndRoute(res.access_token);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperLogin = async (role: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient("/auth/developer-guest-login", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      decodeJWTAndRoute(res.access_token);
    } catch (err: any) {
      console.warn("Backend unavailable, using mock developer login:", err);
      // Fallback for UI prototyping when backend is down
      const mockToken = "mock." + btoa(JSON.stringify({ role })) + ".mock";
      decodeJWTAndRoute(mockToken);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic labels and icons based on role
  const getIdentifierConfig = () => {
    switch (role) {
      case "CITIZEN":
        return { label: "Email ID", icon: Mail, type: "email", placeholder: "citizen@example.com" };
      case "ADMIN":
        return { label: "Admin ID", icon: Shield, type: "text", placeholder: "ADM-1234" };
      case "EMPLOYEE":
        return { label: "Employee ID", icon: Briefcase, type: "text", placeholder: "EMP-5678" };
      default:
        return { label: "Identifier", icon: Mail, type: "text", placeholder: "" };
    }
  };

  const idConfig = getIdentifierConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Back to Home / Register */}
        <div className="flex justify-between items-center text-sm font-medium">
          <Link
            href="/"
            className="inline-flex items-center text-slate-500 hover:text-orange-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <Link href="/register?role=CITIZEN">
            <button className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              New Citizen? Register
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-orange-400 via-white to-green-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-500">
                <ShieldAlert className="h-8 w-8 text-blue-900" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Secure Portal Login
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-2">
            {!role ? "Select your authorization group to continue to the OmniGrievance network." : `Authenticating as ${role.charAt(0) + role.slice(1).toLowerCase()}. Please enter your credentials.`}
          </p>
        </div>

        {/* Dynamic View Area */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
          
          {/* Top Tricolor Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex z-10">
            <div className="flex-1 bg-orange-500"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-green-500"></div>
          </div>

          <div className="p-8 sm:p-10 relative z-0">
            
            {!role ? (
              // Step 1: Role Selection
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Select Login Role</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <button
                    onClick={() => handleRoleSelection("CITIZEN")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 hover:shadow-lg transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-orange-200 flex items-center justify-center mb-4 transition-colors">
                      <User className="w-7 h-7 text-slate-600 group-hover:text-orange-700" />
                    </div>
                    <span className="font-bold text-slate-800 group-hover:text-orange-800">Citizen (User)</span>
                    <span className="text-xs text-slate-500 text-center mt-2 group-hover:text-orange-600">Track resolving issues</span>
                  </button>
                  
                  <button
                    onClick={() => handleRoleSelection("ADMIN")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
                      <Shield className="w-7 h-7 text-slate-600 group-hover:text-blue-700" />
                    </div>
                    <span className="font-bold text-slate-800 group-hover:text-blue-800">Administrator</span>
                    <span className="text-xs text-slate-500 text-center mt-2 group-hover:text-blue-600">System oversight portal</span>
                  </button>

                  <button
                    onClick={() => handleRoleSelection("EMPLOYEE")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 hover:shadow-lg transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-green-200 flex items-center justify-center mb-4 transition-colors">
                      <Briefcase className="w-7 h-7 text-slate-600 group-hover:text-green-700" />
                    </div>
                    <span className="font-bold text-slate-800 group-hover:text-green-800">Govt Employee</span>
                    <span className="text-xs text-slate-500 text-center mt-2 group-hover:text-green-600">Officer resolution dashboard</span>
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Identification and Password
              <div className="animate-in fade-in zoom-in-95 duration-500 w-full max-w-md mx-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${role === 'CITIZEN' ? 'bg-orange-100 text-orange-600' : role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {role === 'CITIZEN' ? <User className="w-5 h-5"/> : role === 'ADMIN' ? <Shield className="w-5 h-5"/> : <Briefcase className="w-5 h-5"/>}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800">{role.charAt(0) + role.slice(1).toLowerCase()} Login</h3>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setRole(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" /> Change Role
                  </button>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  {/* Dynamic Identifier Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <idConfig.icon className="w-4 h-4 mr-1.5 text-slate-400" /> {idConfig.label}
                    </label>
                    <input
                      name="identifier"
                      type={idConfig.type}
                      required
                      className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      placeholder={idConfig.placeholder}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <KeyRound className="w-4 h-4 mr-1.5 text-slate-400" /> Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium tracking-[0.2em]"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-xl py-4 px-4 text-base font-black text-white shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-0.5
                      ${role === 'CITIZEN' ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/30 hover:shadow-orange-500/50 focus-visible:outline-orange-600' : 
                        role === 'ADMIN' ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50 focus-visible:outline-blue-600' : 
                        'bg-gradient-to-r from-green-600 to-green-700 shadow-green-500/30 hover:shadow-green-500/50 focus-visible:outline-green-600'
                      }`}
                  >
                    {loading ? "Verifying..." : `Login as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Developer Bypass */}
        <div className="bg-slate-50/80 rounded-3xl border border-dashed border-slate-300 p-8">
          <h3 className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest mb-6">
            Developer Operations (Bypass Login)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleDeveloperLogin("CITIZEN")}
              disabled={loading}
              className="py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all shadow-sm hover:shadow-md"
            >
              👤 Citizen Guest
            </button>
            <button
              onClick={() => handleDeveloperLogin("ADMIN")}
              disabled={loading}
              className="py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              ⚙️ Admin Guest
            </button>
            <button
              onClick={() => handleDeveloperLogin("EMPLOYEE")}
              disabled={loading}
              className="py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all shadow-sm hover:shadow-md"
            >
              🏛️ Employee Guest
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
