"use client";

import { useState, useEffect, useCallback } from "react";

interface SearchInputProps {
  initialValue: string;
  onSearch: (value: string) => void;
  placeholder: string;
}

export function SearchInput({
  initialValue,
  onSearch,
  placeholder,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== initialValue) {
        onSearch(value);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, initialValue, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-12 border border-brown/20 bg-paper text-brown placeholder-brown-light rounded-lg focus:outline-none focus:ring-2 focus:ring-clay focus:border-transparent"
      />
      <svg
        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-light"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
