"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  UserCircle,
  Camera,
  Phone,
  MapPin,
  CheckCircle2,
  Loader2,
  Mail,
  Hash,
  UserRound,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Data matching the Registration Form exactly
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    aadhaar: "",
    address: "",
    pincode: "",
  });

  // Load profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiClient("/auth/citizen/profile");
        setFormData({
          fullName: data.name || "",
          email: data.email || "",
          mobile: data.phone || "",
          aadhaar: "", // Not supported by backend
          address: data.address || "",
          pincode: data.pin || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setSaved(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSaved(false);
  };

  const isValid =
    formData.fullName.trim().length >= 2 &&
    formData.mobile.trim().length === 10 &&
    formData.email.trim().includes("@") &&
    formData.address.trim().length >= 5 &&
    formData.pincode.trim().length === 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await apiClient("/auth/citizen/complete-profile", {
        method: "POST",
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.mobile,
          address: formData.address,
          pin: formData.pincode,
          district: "Dynamic", // Placeholder or derived from pincode in real app
          state: "Dynamic",    // Placeholder
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 lg:py-12">
      <Card className="shadow-xl border-slate-200 overflow-hidden">
        {/* Tricolor accent */}
        <div className="h-1.5 flex">
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-green-500" />
        </div>

        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-orange-600" />
              </div>
              My Profile
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              Verified Citizen
            </div>
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium text-base mt-2">
            View and update your registered account details.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden group-hover:shadow-xl transition-shadow">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform cursor-pointer">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </button>
              <p className="text-xs text-slate-400 font-medium">
                Change Profile Photo
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                aria-label="Upload profile photo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <UserRound className="w-4 h-4 text-slate-400" /> Full Name <span className="text-red-500">*</span>
                </Label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4 text-slate-400" /> Email Address <span className="text-red-500">*</span>
                </Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="mobile"
                  className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-slate-400" /> Mobile Number <span className="text-red-500">*</span>
                </Label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium tracking-wider"
                />
              </div>

              {/* Aadhaar Digits */}
              <div className="space-y-2">
                <Label
                  htmlFor="aadhaar"
                  className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Hash className="w-4 h-4 text-slate-400" /> Aadhaar Digits 
                </Label>
                <input
                  id="aadhaar"
                  name="aadhaar"
                  type="text"
                  value={formData.aadhaar}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium tracking-wider"
                />
              </div>
            </div>

            {/* Complete Address */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-slate-400" /> Complete Address{" "}
                <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium min-h-[80px]"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-2 w-full sm:w-1/2">
              <Label
                htmlFor="pincode"
                className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-slate-400" /> Postal Pincode{" "}
                <span className="text-red-500">*</span>
              </Label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium tracking-widest"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              {saved ? (
                <div className="text-emerald-600 font-bold flex items-center gap-2 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-5 h-5" /> Profile details saved successfully!
                </div>
              ) : (
                <div className="text-sm text-slate-500 font-medium">
                  Ensure your details match your government ID.
                </div>
              )}
              
              <Button
                type="submit"
                disabled={!isValid || loading}
                className="w-full sm:w-auto py-6 px-8 text-base font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
