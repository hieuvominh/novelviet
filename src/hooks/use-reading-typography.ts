"use client";

import { useState, useEffect } from "react";

export type LineHeight = 1.4 | 1.7 | 2.0 | 2.3;

export interface LineHeightConfig {
  value: LineHeight;
  label: string;
  name: string;
}

export const LINE_HEIGHT_OPTIONS: LineHeightConfig[] = [
  { value: 1.4, label: "1.4x", name: "Chặt" },
  { value: 1.7, label: "1.7x", name: "Bình thường" },
  { value: 2.0, label: "2.0x", name: "Rộng" },
  { value: 2.3, label: "2.3x", name: "Rất rộng" },
];

const STORAGE_KEY = "reader-line-height";

export function useReadingTypography() {
  // Initialize with default, will be updated from localStorage in useEffect
  const [lineHeight, setLineHeightState] = useState<LineHeight>(1.7);
  const [isReady, setIsReady] = useState(false);

  // Load line height from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if ([1.4, 1.7, 2.0, 2.3].includes(parsed)) {
        setLineHeightState(parsed as LineHeight);
      }
    }
    setIsReady(true);
  }, []);

  // Persist line height changes to localStorage
  const setLineHeight = (value: LineHeight) => {
    setLineHeightState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value.toString());
      // Notify other components
      window.dispatchEvent(new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: value.toString(),
        storageArea: localStorage,
      }));
    }
  };

  // Listen for line height changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const parsed = parseFloat(e.newValue);
        if ([1.4, 1.7, 2.0, 2.3].includes(parsed)) {
          setLineHeightState(parsed as LineHeight);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    lineHeight,
    setLineHeight,
    options: LINE_HEIGHT_OPTIONS,
    isReady,
  };
}
