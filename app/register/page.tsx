"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import GuestGuard from "@/components/GuestGuard";

type ValidationError = {
  message: string;
  errors: Record<string, string[]>;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    // バリデーション
    if (!name || !email || !password) {
      setError("全て項目を入力してください");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上です");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await register(name, email, password);

      alert("登録成功！");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof AxiosError && err.response?.status === 422) {
        const data = err.response.data as ValidationError;

        const messages = Object.values(data.errors).flat().join("\n");

        setError(messages);
      } else {
        setError("登録に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="p-10 max-w-md mx-auto">
        <h1 className="text-xl mb-4 font-bold">登録</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <input
          className="border p-2 block mb-2 w-full"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />

        <input
          className="border p-2 block mb-2 w-full"
          placeholder="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <input
          className="border p-2 block mb-4 w-full"
          type="password"
          placeholder="パスワード（8文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <button
          className={`bg-green-500 text-white px-4 py-2 rounded font-semibold w-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
          }`}
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? "登録中..." : "登録"}
        </button>

        <p className="text-sm text-gray-600 mt-4">
          既にアカウントがある場合は{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            ログイン
          </a>
        </p>
      </div>
    </GuestGuard>
  );
}
