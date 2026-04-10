"use client";

import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "react-hot-toast";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex">
        {/* sidebar */}
        <Sidebar />

        {/* main */}
        <main className="flex-1 p-6 bg-gray-100 min-h-screen">{children}</main>
      </div>
      <Toaster position="top-right" />
    </AuthGuard>
  );
}
