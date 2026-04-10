"use client";

import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-10">
      <h1 className="text-xl mb-4">Dashboard</h1>

      {user && <p>Welcome {user.name}</p>}
    </div>
  );
}
