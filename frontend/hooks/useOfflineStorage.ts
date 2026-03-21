"use client";

import { useState, useEffect } from "react";

export function useOfflineStorage(key: string, initialValue: string = "") {
  const [value, setValue] = useState<string>(initialValue);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const savedValue = localStorage.getItem(key);
    if (savedValue) {
      setValue(savedValue);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [key]);

  const setStoredValue = (newValue: string) => {
    setValue(newValue);
    localStorage.setItem(key, newValue);
  };

  const clearStorage = () => {
    setValue(initialValue);
    localStorage.removeItem(key);
  };

  return { value, setStoredValue, isOffline, clearStorage };
}
