"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuth(requireAuth = true, allowedRoles?: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ token: string; role: string; isProfileComplete: boolean } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("omni_token");
    const isProfileCompleteStr = localStorage.getItem("omni_profile_complete");
    const roleStr = localStorage.getItem("omni_role");

    if (!token) {
      if (requireAuth) {
        router.push("/login");
      } else {
        setLoading(false);
      }
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));
      
      // Check expiry
      if (payload.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      const role = payload.role || roleStr;
      const isProfileComplete = isProfileCompleteStr === "true";

      setUser({ token, role, isProfileComplete });

      if (requireAuth) {
        if (allowedRoles && !allowedRoles.includes(role)) {
          // Wrong role
          router.push("/login");
          return;
        }

        if (!isProfileComplete && !pathname.includes("/profile-setup")) {
          // Redirect to profile setup
          if (role === "EMPLOYEE") {
            router.push("/employee/profile-setup");
          } else if (role === "CITIZEN") {
            router.push("/user/profile-setup");
          }
          return;
        }

        if (isProfileComplete && pathname.includes("/profile-setup")) {
           if (role === "EMPLOYEE") router.push("/employee/dashboard");
           if (role === "CITIZEN") router.push("/user/report");
           return;
        }
      }
      
      setLoading(false);
    } catch (err) {
      // Invalid token
      localStorage.removeItem("omni_token");
      localStorage.removeItem("omni_profile_complete");
      localStorage.removeItem("omni_role");
      if (requireAuth) router.push("/login");
      else setLoading(false);
    }
  }, [requireAuth, JSON.stringify(allowedRoles), pathname, router]);

  const logout = () => {
    localStorage.removeItem("omni_token");
    localStorage.removeItem("omni_profile_complete");
    localStorage.removeItem("omni_role");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout };
}
