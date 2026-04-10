"use client";

import { useState } from "react";
import { createStore } from "@/lib/api/stores";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateStorePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [latLng, setLatLng] = useState("");
  const [staffName, setStaffName] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      let lat: number | null = null;
      let lng: number | null = null;

      if (latLng) {
        const parts = latLng.split(",");

        if (parts.length === 2) {
          lat = Number(parts[0].trim());
          lng = Number(parts[1].trim());
        }
      }

      await createStore({
        name,
        address,
        phone,
        lat,
        lng,
        staff_name: staffName,
      });

      toast.success("店舗を登録しました");

      setName("");
      setAddress("");
      setPhone("");
      setLatLng("");
    } catch (error) {
      console.error(error);
      toast.error("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">店舗登録</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-1">店舗名</label>
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">住所</label>
          <input
            className="w-full border p-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">位置情報（lat,lng）</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="例: 35.6971151xxxxxxx, 138.464674xxxxxxx"
            value={latLng}
            onChange={(e) => setLatLng(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">店舗担当者</label>
          <input
            className="w-full border p-2 rounded"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="例：田中（店長）"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">電話</label>
          <input
            className="w-full border p-2 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          登録
        </button>

        <button
          type="button"
          onClick={() => router.push("/stores")}
          className="ml-3 border px-4 py-2 rounded"
        >
          一覧へ戻る
        </button>
      </form>
    </div>
  );
}
