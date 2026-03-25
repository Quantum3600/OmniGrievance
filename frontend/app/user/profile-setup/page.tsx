"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { UserRound, Phone, MapPin, Hash, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CitizenProfileSetup() {
  const { user, loading: authLoading } = useAuth(true, ["CITIZEN"]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pin: "",
    district: "",
    state: "",
  });

  if (authLoading) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient("/auth/citizen/complete-profile", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      localStorage.setItem("omni_profile_complete", "true");
      router.push("/user/report");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 flex z-10">
          <div className="flex-1 bg-orange-500"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-green-500"></div>
        </div>

        <div className="p-8 sm:p-10 relative z-0">
          <div className="text-center mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-2xl font-extrabold text-slate-800">Complete Citizen Profile</h3>
            <p className="text-sm text-slate-500 mt-2">To submit and track grievances securely, please complete your demographic profile.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <UserRound className="w-4 h-4 mr-1.5 text-slate-400" /> Full Name
                </label>
                <input name="name" type="text" required onChange={handleChange} className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <Phone className="w-4 h-4 mr-1.5 text-slate-400" /> Phone Number
                </label>
                <input name="phone" type="tel" required onChange={handleChange} className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> Complete Address
              </label>
              <textarea name="address" required onChange={handleChange} className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 min-h-[80px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center">District</label>
                <input name="district" type="text" required onChange={handleChange} className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center">State</label>
                <input name="state" type="text" required onChange={handleChange} className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center">Pincode</label>
                <input name="pin" type="text" required onChange={handleChange} className="w-full rounded-xl border-2 border-slate-200 py-2.5 px-4 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">{error}</div>}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-4 text-base font-black text-white shadow-lg hover:-translate-y-0.5 transition-all">
              {loading ? "Saving Profile..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
