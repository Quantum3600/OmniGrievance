"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ShieldAlert, ArrowLeft, User, Shield, Briefcase, Mail, KeyRound, UserRound, Phone, MapPin, Hash, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get("role");
    if (urlRole === "CITIZEN") {
      setRole("CITIZEN");
    }
  }, []);

  // Intelligent fields for Citizen Registration
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    aadhaar: "",
    address: "",
    pincode: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
  };

  const handleRegisterCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient("/auth/register-citizen", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      localStorage.setItem("omni_token", res.access_token);
      router.push("/dashboard"); // Redirect to citizen dashboard
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Back to Home / Login */}
        <div className="flex justify-between items-center text-sm font-medium">
          <Link
            href="/"
            className="inline-flex items-center text-slate-500 hover:text-orange-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <Link
            href="/login"
            className="text-slate-500 hover:text-blue-600 transition-colors"
          >
            Already have an account? Login
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
            Create an Account
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mb-2">
            {!role ? "Join OmniGrievance — The Zero-Friction Civic Resolution Platform. Please select your role below to begin." : "Complete your registration to access the platform."}
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
                  <h3 className="text-lg font-bold text-slate-800">Who are you registering as?</h3>
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
                    <span className="text-xs text-slate-500 text-center mt-2 group-hover:text-orange-600">Register to report issues</span>
                  </button>
                  
                  <button
                    onClick={() => handleRoleSelection("ADMIN")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-blue-200 flex items-center justify-center mb-4 transition-colors">
                      <Shield className="w-7 h-7 text-slate-600 group-hover:text-blue-700" />
                    </div>
                    <span className="font-bold text-slate-800 group-hover:text-blue-800">Administrator</span>
                    <span className="text-xs text-slate-500 text-center mt-2 group-hover:text-blue-600">Global oversight portal</span>
                  </button>

                  <button
                    onClick={() => handleRoleSelection("EMPLOYEE")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 hover:shadow-lg transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-green-200 flex items-center justify-center mb-4 transition-colors">
                      <Briefcase className="w-7 h-7 text-slate-600 group-hover:text-green-700" />
                    </div>
                    <span className="font-bold text-slate-800 group-hover:text-green-800">Govt Employee</span>
                    <span className="text-xs text-slate-500 text-center mt-2 group-hover:text-green-600">Field officer dashboard</span>
                  </button>
                </div>
              </div>
            ) : role !== "CITIZEN" ? (
              // Non-Citizen Registration Blocker
              <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-800 mb-4">Internal Accounts Only</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Administrator and Government Employee accounts are provisioned internally by the state IT department. 
                  Direct registration is disabled for security reasons.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setRole(null)}
                    className="px-6 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Go Back
                  </button>
                  <Link href="/login">
                    <button className="px-6 py-2 bg-blue-600 rounded-xl font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all">
                      Login
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              // Step 2: Intelligent Citizen Registration
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-800">Citizen Registration</h3>
                    <p className="text-sm text-slate-500 mt-1">Please provide the details below intelligently required for platform security.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setRole(null)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" /> Change Role
                  </button>
                </div>

                <form className="space-y-6" onSubmit={handleRegisterCitizen}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <UserRound className="w-4 h-4 mr-1.5 text-slate-400" /> Full Name
                      </label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <Mail className="w-4 h-4 mr-1.5 text-slate-400" /> Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                        placeholder="citizen@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <Phone className="w-4 h-4 mr-1.5 text-slate-400" /> Mobile Number
                      </label>
                      <input
                        name="mobile"
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                        placeholder="10 digit number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Aadhaar */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <Hash className="w-4 h-4 mr-1.5 text-slate-400" /> Aadhaar Digits <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-2 font-normal">Optional</span>
                      </label>
                      <input
                        name="aadhaar"
                        type="text"
                        pattern="[0-9]{12}"
                        className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                        placeholder="12 digit number"
                        value={formData.aadhaar}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <KeyRound className="w-4 h-4 mr-1.5 text-slate-400" /> Create Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Address spanning 2 cols */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> Complete Address
                      </label>
                      <textarea
                        name="address"
                        required
                        className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium min-h-[60px]"
                        placeholder="Street, City, District"
                        value={formData.address}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    {/* Pincode */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> Pincode
                      </label>
                      <input
                        name="pincode"
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        className="w-full h-[60px] rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                        placeholder="6-digit"
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-4 text-base font-black text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
                  >
                    {loading ? "Registering profile..." : "Register Securely"}
                  </button>
                  <p className="text-center text-xs text-slate-400 font-medium">
                    By registering, you agree to the Digital Governance Terms & Conditions.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
