"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menu = [
    { name: "店舗一覧", path: "/stores" },
    { name: "店舗登録", path: "/stores/create" },
    { name: "営業カレンダー", path: "/calendar" },
    { name: "本日の予定", path: "/calendar/today" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        店舗管理
      </div>

      <nav className="p-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-4 py-2 rounded mb-1 ${
              pathname === item.path ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="mb-2 text-sm text-gray-300">{user?.name}</div>

        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-sm"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}
