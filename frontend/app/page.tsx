"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      console.log("Mock OTP for testing:", res.mock_otp);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const decodeJWTAndRoute = (token: string) => {
    localStorage.setItem("omni_token", token);
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    
    if (payload.role === "EMPLOYEE") {
      router.push("/tasks");
    } else if (payload.role === "ADMIN") {
      router.push("/transparency");
    } else {
      router.push("/dashboard");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone_number: phoneNumber, otp }),
      });
      decodeJWTAndRoute(res.access_token);
    } catch (err: any) {
      setError(err.message);
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
      setError(`Developer Login Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">
            OmniGrievance Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Zero-Friction Civic Service Portal
          </p>
        </div>
        {!otpSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                <input
                  id="phone-number"
                  name="phone"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Phone Number (e.g. +19999999999)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : "Request OTP securely"}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="otp" className="sr-only">OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 tracking-widest text-center text-lg"
                  placeholder="Enter 6-digit PIN"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Verifying Identity..." : "Sign In to Portal"}
              </button>
            </div>
          </form>
        )}

        {/* Developer Bypass UI */}
        <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8">
          <h3 className="text-xs font-bold text-slate-500 text-center uppercase tracking-widest mb-4">
            Developer Operations (Bypass OTP)
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleDeveloperLogin("CITIZEN")}
              disabled={loading}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Login as Citizen Guest
            </button>
            <button
              onClick={() => handleDeveloperLogin("EMPLOYEE")}
              disabled={loading}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Login as Govt Employee Guest
            </button>
            <button
              onClick={() => handleDeveloperLogin("ADMIN")}
              disabled={loading}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Login as Admin Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
