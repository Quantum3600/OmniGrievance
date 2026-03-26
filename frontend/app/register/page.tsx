"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ShieldAlert, ArrowLeft, Mail, KeyRound, UserRound, Phone, MapPin, Hash, Home } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
      router.push("/user/report"); // Redirect to citizen portal
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
        <div className="flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm group">
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" /> Home
          </Link>
          <Link
            href="/login"
            className="text-slate-500 hover:text-blue-600 font-bold transition-colors"
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
            Join OmniGrievance — The Zero-Friction Civic Resolution Platform. Complete your registration below.
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
            
            {(
              // Citizen Registration Form
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-8 pb-4 border-b border-slate-100">
                  <h3 className="text-2xl font-extrabold text-slate-800">Citizen Registration</h3>
                  <p className="text-sm text-slate-500 mt-1">Please provide the details below required for platform security.</p>
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
