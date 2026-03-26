"use client";

import { useEffect, useState } from "react";

export function useIndexedDB(dbName: string, storeName: string) {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = (event: any) => {
      setDb(event.target.result);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
    };
  }, [dbName, storeName]);

  const setItem = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB not initialized");
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const getItem = (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB not initialized");
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const removeItem = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject("DB not initialized");
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  return { setItem, getItem, removeItem, isReady: !!db };
}
