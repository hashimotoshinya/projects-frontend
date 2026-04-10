"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStores } from "@/lib/api/stores";
import {
  createVisitPlan,
  getVisitPlansByDate,
  updateVisitPlan,
  deleteVisitPlan,
} from "@/lib/api/visitPlans";
import { getFuturePlans } from "@/lib/api/visitPlans";

type Store = {
  id: number;
  name: string;
  last_visit?: string | null;
  days_since_visit?: number | null;
  visits_max_visited_at?: string | null;
};

type Plan = {
  id: number;
  visit_date: string;
  memo?: string;
  store: {
    id: number;
    name: string;
  };
};

export default function VisitPlanPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;

  const [stores, setStores] = useState<Store[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);
  const [memo, setMemo] = useState("");
  const [search, setSearch] = useState("");

  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingMemo, setEditingMemo] = useState("");

  const [futurePlans, setFuturePlans] = useState<Plan[]>([]);

  const fetchPlans = async () => {
    const planData = await getVisitPlansByDate(date);
    setPlans(planData);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const storeData = await getStores();
        setStores(storeData);
        console.log("stores loaded:", storeData);

        const planData = await getVisitPlansByDate(date);
        setPlans(planData);
        console.log("plans loaded for date:", date, planData);

        const future = await getFuturePlans();
        console.log("getFuturePlans response:", future);
        setFuturePlans(future);
      } catch (error) {
        console.error("init error:", error);
      }
    };

    console.log("useEffect triggered for date:", date);
    init();
  }, [date]);

  // 店舗選択
  const toggleStore = (store: Store) => {
    const exists = selectedStores.find((s) => s.id === store.id);

    if (exists) {
      setSelectedStores(selectedStores.filter((s) => s.id !== store.id));
    } else {
      setSelectedStores([...selectedStores, store]);
    }
  };

  // 予定登録
  const handleCreate = async () => {
    if (selectedStores.length === 0) return;

    for (const store of selectedStores) {
      await createVisitPlan(store.id, date, memo);
    }

    await fetchPlans();

    setSelectedStores([]);
    setMemo("");
  };

  // キャンセル
  const handleCancel = () => {
    setSelectedStores([]);
    setMemo("");
  };

  // 編集開始
  const startEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditingMemo(plan.memo ?? "");
  };

  // 編集保存
  const saveEdit = async () => {
    if (!editingPlanId) return;

    await updateVisitPlan(editingPlanId, editingMemo);

    setEditingPlanId(null);
    setEditingMemo("");

    await fetchPlans();
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingPlanId(null);
    setEditingMemo("");
  };

  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm("この予定を削除しますか？")) return;

    await deleteVisitPlan(id);

    await fetchPlans();
  };

  // 店舗検索
  const filteredStores = stores
    .filter((store) => store.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aDays = a.days_since_visit ?? 0;
      const bDays = b.days_since_visit ?? 0;
      return bDays - aDays;
    });

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => router.push("/calendar")}
        className="text-blue-600 hover:underline"
      >
        ← カレンダーに戻る
      </button>

      <h1 className="text-2xl font-bold">{date} の訪問予定</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* 左 */}
        <div className="space-y-6">
          {/* 予定作成 */}
          <div className="bg-green-50 p-4 rounded shadow space-y-3">
            <h2 className="font-bold">予定作成</h2>

            <div>
              <p className="text-sm text-gray-600">選択店舗</p>

              {selectedStores.length === 0 && (
                <p className="text-gray-500">未選択</p>
              )}

              {selectedStores.map((store) => (
                <p key={store.id} className="font-semibold">
                  {store.name}
                </p>
              ))}
            </div>

            <textarea
              className="w-full border p-2 rounded"
              placeholder="予定メモ"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                予定登録
              </button>

              <button
                onClick={handleCancel}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                キャンセル
              </button>
            </div>
          </div>

          {/* 予定一覧 */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-3">訪問予定一覧</h2>

            {plans.length === 0 && <p className="text-gray-500">予定なし</p>}

            {plans.map((plan) => (
              <div key={plan.id} className="border-b py-3">
                <p className="font-semibold">{plan.store.name}</p>

                {editingPlanId === plan.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      className="w-full border p-2 rounded"
                      value={editingMemo}
                      onChange={(e) => setEditingMemo(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        保存
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="bg-gray-300 px-3 py-1 rounded text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">{plan.memo ?? "-"}</p>

                    <div className="flex gap-3 mt-2 text-sm">
                      <button
                        onClick={() => startEdit(plan)}
                        className="text-blue-600 hover:underline"
                      >
                        編集
                      </button>

                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:underline"
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右 */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-3">店舗一覧</h2>

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="店舗検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-[500px] overflow-y-auto">
            {filteredStores.map((store) => {
              const selected = selectedStores.some((s) => s.id === store.id);

              const hasPlan = plans.some((plan) => plan.store.id === store.id);

              const otherPlans = futurePlans
                .filter(
                  (p) =>
                    p.store.id === store.id &&
                    new Date(p.visit_date).toDateString() !==
                      new Date(date).toDateString(),
                )
                .sort(
                  (a, b) =>
                    new Date(a.visit_date).getTime() -
                    new Date(b.visit_date).getTime(),
                );

              // デバッグ: コンソールで確認
              console.log({
                storeName: store.name,
                storeId: store.id,
                futurePlansCount: futurePlans.length,
                futurePlansData: futurePlans,
                futurePlanMatch: otherPlans[0],
              });

              return (
                <div
                  key={store.id}
                  className={`border-b py-2 flex justify-between items-center ${
                    selected ? "bg-blue-50" : hasPlan ? "bg-red-50" : ""
                  }`}
                >
                  <div>
                    <p className="font-semibold">{store.name}</p>

                    <p className="text-xs text-gray-500">
                      最終訪問:
                      {store.visits_max_visited_at ?? "未訪問"} / 空き日数:
                      {(() => {
                        if (!store.visits_max_visited_at) return "-";

                        const visitDate = new Date(store.visits_max_visited_at);
                        const today = new Date();

                        const diff = today.getTime() - visitDate.getTime();
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                        return days;
                      })()}
                      日
                    </p>

                    {/* ★未来予定 */}
                    {!hasPlan && otherPlans.length > 0 && (
                      <div>
                        {otherPlans.map((p) => (
                          <p key={p.id} className="text-xs text-orange-500">
                            📅 {p.visit_date} に予定あり
                          </p>
                        ))}
                      </div>
                    )}

                    {/* ★当日予定 */}
                    {hasPlan && (
                      <p className="text-xs text-red-500 font-semibold">
                        ⚠ この日に予定あり
                      </p>
                    )}
                  </div>

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleStore(store)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
