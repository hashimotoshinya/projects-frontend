"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import GuestGuard from "@/components/GuestGuard";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async () => {
    // バリデーション
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上です");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      alert("ログイン成功！");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof AxiosError && err.response?.status === 401) {
        setError("メールアドレスまたはパスワードが間違っています");
      } else {
        setError("ログインに失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="p-10 max-w-md mx-auto">
        <h1 className="text-xl mb-4 font-bold">ログイン</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <input
          className="border p-2 mb-2 block w-full"
          placeholder="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <input
          className="border p-2 mb-4 block w-full"
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded font-semibold w-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "ログイン中..." : "ログイン"}
        </button>

        <p className="text-sm text-gray-600 mt-4">
          アカウントがない場合は{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            新規登録
          </a>
        </p>
      </div>
    </GuestGuard>
  );
}
