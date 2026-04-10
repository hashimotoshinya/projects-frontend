"use client";

import { useEffect, useState } from "react";
import {
  getVisitPlansByDate,
  completeVisitPlan,
  uncompleteVisitPlan,
} from "@/lib/api/visitPlans";
import { formatDate } from "@/lib/date";
import { getReport, saveReport } from "@/lib/api/reports";

type Plan = {
  id: number;
  memo?: string;

  visit?: {
    id: number;
    memo?: string;
  } | null;

  store: {
    id: number;
    name: string;
    lat?: number | null;
    lng?: number | null;
  };
};

export default function TodayPage() {
  const today = formatDate(new Date());

  const [plans, setPlans] = useState<Plan[]>([]);
  const [visitMemos, setVisitMemos] = useState<Record<number, string>>({});

  const reloadPlans = async () => {
    const data = await getVisitPlansByDate(today);
    setPlans(data);
  };

  const [report, setReport] = useState("");
  const [hasReport, setHasReport] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const load = async () => {
      const data = await getVisitPlansByDate(today);
      setPlans(data);

      const reportData = await getReport(today);

      if (reportData && reportData.report_date === today) {
        setReport(reportData.content || "");
        setHasReport(true);
      } else {
        setReport("");
        setHasReport(false);
      }
    };

    load();
  }, [today]);

  const handleComplete = async (plan: Plan) => {
    const memo = visitMemos[plan.store.id] || "";

    await completeVisitPlan(plan.id, memo);

    await reloadPlans();
  };

  const handleUncomplete = async (planId: number) => {
    await uncompleteVisitPlan(planId);

    await reloadPlans();
  };

  const handleSaveReport = async () => {
    await saveReport(today, report);

    setHasReport(true);
    setIsEditing(false);

    alert("保存しました");
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">本日の予定</h1>

        {plans.length === 0 && <p>予定なし</p>}

        {plans.map((plan) => (
          <div key={plan.id} className="border-b py-3">
            {/* 店舗名 */}
            <p className="font-semibold">{plan.store.name}</p>

            {/* 予定メモ */}
            <p className="text-sm text-gray-500">予定：{plan.memo ?? "-"}</p>

            {/* 訪問メモ入力 */}
            <textarea
              className="w-full border p-2 rounded mt-2"
              placeholder="訪問内容（何をしたか）"
              value={visitMemos[plan.store.id] || ""}
              onChange={(e) =>
                setVisitMemos({
                  ...visitMemos,
                  [plan.store.id]: e.target.value,
                })
              }
            />

            {/* 訪問済みメモ表示 */}
            {plan.visit && (
              <p className="text-xs text-gray-500 mt-1">
                訪問メモ：{plan.visit.memo ?? "-"}
              </p>
            )}

            {/* ボタン */}
            <div className="flex justify-between items-center mt-2">
              <div>
                {plan.visit ? (
                  <button
                    onClick={() => handleUncomplete(plan.id)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    訪問取消
                  </button>
                ) : (
                  <button
                    onClick={() => handleComplete(plan)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    訪問する
                  </button>
                )}
              </div>

              {!plan.store.lat || !plan.store.lng ? (
                <p className="text-xs text-gray-400">位置情報なし</p>
              ) : (
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${plan.store.lat},${plan.store.lng}`,
                      "_blank",
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  ナビ開始
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 右：営業レポート */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">営業レポート</h2>

        {/* 表示モード */}
        {hasReport && !isEditing ? (
          <>
            <p className="whitespace-pre-wrap border p-2 rounded bg-gray-50">
              {report || "未入力"}
            </p>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              修正
            </button>
          </>
        ) : (
          <>
            <textarea
              className="w-full border p-2 rounded"
              rows={12}
              value={report}
              onChange={(e) => setReport(e.target.value)}
            />

            <button
              onClick={handleSaveReport}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
            >
              保存
            </button>
          </>
        )}

        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-[500px]">
              <h2 className="font-bold mb-3">レポート修正</h2>

              <textarea
                className="w-full border p-2 rounded"
                rows={10}
                value={report}
                onChange={(e) => setReport(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  キャンセル
                </button>

                <button
                  onClick={handleSaveReport}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
