"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getCurrentUser } from "@/lib/auth/admin-auth";
import type { UserProfile } from "@/lib/auth/admin-auth";

export function AdminHeader() {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user profile on mount
  useEffect(() => {
    async function loadProfile() {
      const user = await getCurrentUser();
      if (user) {
        setProfile(user.profile);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Breadcrumb / Page Title - can be customized per page */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
          View Site
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
              {profile?.role === "admin" ? "A" : "E"}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {profile?.role || "User"}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showUserMenu ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                Profile
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
