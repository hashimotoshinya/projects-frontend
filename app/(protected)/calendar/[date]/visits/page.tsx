"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getVisitPlansByDate,
  completeVisitPlan,
  uncompleteVisitPlan,
} from "@/lib/api/visitPlans";
import { deleteVisitPlan } from "@/lib/api/visitPlans";
import { getStores } from "@/lib/api/stores";
import { createVisit } from "@/lib/api/visits";
import { getReport } from "@/lib/api/reports";


type Plan = {
  id: number;
  visit_date: string;
  memo?: string;

  store: {
    id: number;
    name: string;
  };

  visit?: {
    id: number;
    memo?: string;
    visited_at: string;
  } | null;
};

type Store = {
  id: number;
  name: string;
};

type Report = {
  id: number;
  report_date: string;
  content: string;
};

export default function CalendarVisitsPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [visitMemos, setVisitMemos] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [quickMemo, setQuickMemo] = useState("");

  const reload = async () => {
    const data = await getVisitPlansByDate(date);
    setPlans(data);
  };
  const [report, setReport] = useState<Report | undefined>();

  useEffect(() => {
    const init = async () => {
      const storeData = await getStores();
      setStores(storeData);

      const planData = await getVisitPlansByDate(date);
      setPlans(planData);

      const reportData = await getReport(date);
      setReport(reportData);


      setLoading(false);
    };

    init();
  }, [date]);

  const handleComplete = async (plan: Plan) => {
    const memo = visitMemos[plan.store.id] || "";

    await completeVisitPlan(plan.id, memo);
    await reload();
  };

  const handleUncomplete = async (planId: number) => {
    await uncompleteVisitPlan(planId);
    await reload();
  };

  const handleDelete = async (planId: number) => {
    if (!confirm("この予定を削除しますか？")) return;

    await deleteVisitPlan(planId);
    await reload();
  };

  const handleQuickVisit = async () => {
    if (!selectedStoreId) {
      alert("店舗を選択してください");
      return;
    }

    await createVisit(selectedStoreId, quickMemo, date);

    setSelectedStoreId(null);
    setQuickMemo("");

    await reload();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/calendar")}
          className="text-blue-600 hover:underline"
        >
          ← カレンダー
        </button>

        <h1 className="text-2xl font-bold">{date} の活動履歴</h1>
      </div>

      <div className="bg-yellow-50 p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-2">予定なし訪問</h2>

        <select
          className="border p-2 rounded w-full mb-2"
          value={selectedStoreId ?? ""}
          onChange={(e) => setSelectedStoreId(Number(e.target.value))}
        >
          <option value="">店舗選択</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        <textarea
          className="w-full border p-2 rounded mb-2"
          placeholder="訪問メモ"
          value={quickMemo}
          onChange={(e) => setQuickMemo(e.target.value)}
        />

        <button
          onClick={handleQuickVisit}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          訪問登録
        </button>
      </div>

      {/* 一覧 */}
      <div className="bg-white p-4 rounded shadow">
        {plans.length === 0 && (
          <p className="text-gray-500">予定・訪問ともにありません</p>
        )}

        {plans.map((plan) => (
          <div key={plan.id} className="border-b py-3 space-y-2">
            {/* 店舗名 */}
            <p className="font-semibold">{plan.store.name}</p>

            {/* 予定メモ */}
            <p className="text-sm text-gray-500">予定：{plan.memo ?? "-"}</p>

            {/* 訪問入力 */}
            {!plan.visit && (
              <textarea
                className="w-full border p-2 rounded text-sm"
                placeholder="訪問メモ"
                value={visitMemos[plan.store.id] || ""}
                onChange={(e) =>
                  setVisitMemos({
                    ...visitMemos,
                    [plan.store.id]: e.target.value,
                  })
                }
              />
            )}

            {/* 状態表示 */}
            {plan.visit ? (
              <>
                <p className="text-sm text-green-600">訪問済み</p>
                <p className="text-sm text-gray-700">
                  訪問メモ：{plan.visit.memo ?? "-"}
                </p>

                <button
                  onClick={() => handleUncomplete(plan.id)}
                  className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                >
                  訪問取消
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-red-500">未訪問</p>

                {!plan.visit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(plan)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      訪問する
                    </button>

                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      削除
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {/* 営業レポート */}
      <div className="bg-blue-50 p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-2">営業レポート</h2>

        {report && (
          <div className="bg-gray-50 p-3 rounded mt-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {report.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
