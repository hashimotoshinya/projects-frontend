"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStores, deleteStore } from "@/lib/api/stores";
import { getFuturePlans } from "@/lib/api/visitPlans";

/* =========================
   最終訪問からの日数計算
========================= */
const getDaysSinceVisit = (date?: string) => {
  if (!date) return null;

  const visitDate = new Date(date);
  const today = new Date();

  const diff = today.getTime() - visitDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return days;
};

/* =========================
   色分け
========================= */
const getVisitColor = (days: number | null) => {
  if (days === null) return "text-gray-400";

  if (days <= 20) return "text-green-600";

  if (days <= 30) return "text-yellow-600";

  return "text-red-600";
};

type Store = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  staff_name?: string;
  visits_max_visited_at?: string;
  days?: number | null;
};

type Plan = {
  id: number;
  visit_date: string;
  store: {
    id: number;
    name: string;
  };
};

export default function StoresPage() {
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [futurePlans, setFuturePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    const data = await getStores();
    setStores(data);
  };

  useEffect(() => {
    const loadStores = async () => {
      try {
        console.log("① stores取得開始");
        const data = await getStores();
        console.log("② stores取得成功", data);
        setStores(data);

        console.log("③ futurePlans取得開始");
        const future = await getFuturePlans();
        console.log("④ futurePlans取得成功", future);
        setFuturePlans(future);
      } catch (error) {
        console.error("🔥 エラー発生", error);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const handleDelete = async () => {
    if (!selectedStore) return;

    await deleteStore(selectedStore.id);

    setSelectedStore(null);
    fetchStores();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const sortedStores = [...stores]
    .map((store) => ({
      ...store,
      days: getDaysSinceVisit(store.visits_max_visited_at),
    }))
    .sort((a, b) => {
      if (a.days === null) return -1;
      if (b.days === null) return 1;
      return b.days - a.days;
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">店舗一覧</h1>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">店舗名</th>
            <th className="p-2 text-left">担当者</th>
            <th className="p-2 text-left">最終訪問</th>
            <th className="p-2 text-left">経過日数</th>
            <th className="p-2 text-left">訪問予定</th>
            <th className="p-2"></th>
          </tr>
        </thead>

        <tbody>
          {sortedStores.map((store) => {
            const today = new Date().toDateString();

            const todayPlan = futurePlans.find(
              (p) =>
                p.store.id === store.id &&
                new Date(p.visit_date).toDateString() === today,
            );

            const futurePlan = futurePlans
              .filter(
                (p) =>
                  p.store.id === store.id &&
                  new Date(p.visit_date).toDateString() !== today,
              )
              .sort(
                (a, b) =>
                  new Date(a.visit_date).getTime() -
                  new Date(b.visit_date).getTime(),
              )[0];

            return (
              <tr key={store.id} className="border-t">
                {/* 店舗名 */}
                <td
                  className="p-2 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => router.push(`/stores/${store.id}`)}
                >
                  {store.name}
                </td>

                <td className="p-2">{store.staff_name ?? "-"}</td>

                {/* 最終訪問日 */}
                <td className="p-2">
                  {store.visits_max_visited_at
                    ? new Date(store.visits_max_visited_at).toLocaleDateString()
                    : "-"}
                </td>

                {/* 経過日数 */}
                <td className="p-2">
                  {store.days === null ? (
                    "未訪問"
                  ) : (
                    <span className={getVisitColor(store.days)}>
                      {store.days}日経過
                    </span>
                  )}
                </td>

                {/* ★予定表示 */}
                <td className="p-2 text-xs">
                  {todayPlan && (
                    <p className="text-red-500 font-semibold">
                      ⚠ 本日訪問予定あり
                    </p>
                  )}

                  {!todayPlan && futurePlan && (
                    <p className="text-orange-500">
                      📅 {futurePlan.visit_date} に予定あり
                    </p>
                  )}
                </td>

                <td className="p-2 text-right">
                  <button
                    onClick={() => setSelectedStore(store)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 削除モーダル */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">本当に削除しますか？</h2>

            <div className="mb-4 text-sm">
              <p>店舗名: {selectedStore.name}</p>
              <p>住所: {selectedStore.address}</p>
              <p>担当者: {selectedStore.staff_name}</p>
              <p>電話: {selectedStore.phone}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedStore(null)}
                className="px-3 py-1 border rounded"
              >
                キャンセル
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
