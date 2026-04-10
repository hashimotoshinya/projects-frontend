"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useRouter } from "next/navigation";
import { getVisitCalendar } from "@/lib/api/visits";
import { formatDate } from "@/lib/date";

import "react-calendar/dist/Calendar.css";

export default function CalendarPage() {
  const router = useRouter();

  const [date, setDate] = useState<Date>(new Date());

  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVisitCalendar();

        const visits = (data.visits ?? {}) as Record<string, number>;
        const plans = (data.plans ?? {}) as Record<string, number>;

        const pending = Object.fromEntries(
          Object.entries(plans).map(([day, count]) => {
            const visitCount = visits[day] ?? 0;
            return [day, Math.max(0, count - visitCount)];
          }),
        );

        setVisitCounts(visits);
        setPendingCounts(pending);
      } catch (error) {
        console.error("Failed to load calendar data", error);
      }
    };

    fetchData();
  }, []);

  const handleDateClick = (value: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clicked = new Date(value);
    clicked.setHours(0, 0, 0, 0);

    const formatted = formatDate(clicked);

    router.push(
      clicked < today
        ? `/calendar/${formatted}/visits`
        : `/calendar/${formatted}/plan`,
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">営業カレンダー</h1>

      <div className="bg-white p-6 rounded shadow w-fit">
        <Calendar
          value={date}
          onChange={(value) => setDate(value as Date)}
          onClickDay={handleDateClick}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const formatted = formatDate(date);

              const visit = visitCounts[formatted] ?? 0;
              const pending = pendingCounts[formatted] ?? 0;

              return (
                <div className="text-xs mt-1 space-y-0.5">
                  {pending > 0 && (
                    <div className="text-orange-600">🟠{pending}</div>
                  )}
                  {visit > 0 && <div className="text-blue-600">🔵{visit}</div>}
                </div>
              );
            }

            return null;
          }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <div>🔵 訪問履歴</div>

        <div>🟠 未訪問（予定＝未訪問として集計）</div>
      </div>
    </div>
  );
}
