"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/novels", label: "Novels", icon: "📚" },
  { href: "/admin/chapters", label: "Chapters", icon: "📄" },
  { href: "/admin/genres", label: "Genres", icon: "🏷️" },
  { href: "/admin/authors", label: "Authors", icon: "✍️" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white fixed left-0 top-0 h-screen flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span style={{ color: "#ffe300" }}>Novel</span>
            <span style={{ color: "#ee2737" }}>Viet</span>
          </span>
          <span className="text-xs text-gray-400 ml-2">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        Admin CMS v1.0
      </div>
    </aside>
  );
}
