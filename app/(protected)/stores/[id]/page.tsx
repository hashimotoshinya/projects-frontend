"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStore, updateStore } from "@/lib/api/stores";
import { getVisits } from "@/lib/api/visits";

type Store = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  memo?: string;
  lat?: number | null;
  lng?: number | null;
  staff_name?: string;
};

type Visit = {
  id: number;
  memo?: string;
  visited_at: string;
  visitPlan?: {
    id: number;
    memo?: string;
  } | null;
};

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    phone: "",
    staff_name: "",
  });

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      const storeData = await getStore(Number(params.id));
      setStore(storeData);

      const visitData = await getVisits(Number(params.id));
      setVisits(visitData);
    };

    loadData();
  }, [params.id]);

  if (!store) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* 店舗情報 */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">店舗情報</h2>
        <h1 className="text-2xl font-bold">{store.name}</h1>
        <p>住所：{store.address ?? "-"}</p>
        <p>担当者：{store.staff_name ?? "-"}</p>
        <p>電話：{store.phone ?? "-"}</p>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditForm({
                name: store.name,
                address: store.address || "",
                phone: store.phone || "",
                staff_name: store.staff_name || "",
              });
              setIsEditModalOpen(true);
            }}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            編集
          </button>

          {!store.lat || !store.lng ? (
            <p className="text-sm text-gray-400">位置情報なし</p>
          ) : (
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${store.lat},${store.lng}`,
                  "_blank",
                )
              }
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              地図で見る
            </button>
          )}
        </div>
      </div>

      {/* 訪問履歴 */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-4">訪問履歴</h2>

        {visits.length === 0 && (
          <p className="text-gray-500">訪問履歴はまだありません</p>
        )}

        {visits.map((visit) => (
          <div key={visit.id} className="border-b py-2">
            <p className="text-sm text-gray-500">
              {new Date(visit.visited_at).toLocaleDateString()}
            </p>

            <p>予定メモ：{visit.visitPlan?.memo ?? "-"}</p>
            <p>訪問メモ：{visit.memo ?? "-"}</p>
          </div>
        ))}
      </div>

      {/* 編集モーダル */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">店舗編集</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updatedStore = await updateStore(store!.id, editForm);
                  setStore(updatedStore);
                  setIsEditModalOpen(false);
                } catch (error) {
                  console.error("Update failed", error);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">店舗名</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">住所</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">担当者</label>
                <input
                  type="text"
                  value={editForm.staff_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, staff_name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">電話</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  更新
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
