import api from "@/lib/axios";

export const getReport = async (date: string) => {
  const res = await api.get(`/api/reports/${date}`);
  return res.data;
};

export const saveReport = async (date: string, content: string) => {
  const res = await api.post("/api/reports", {
    report_date: date,
    content,
  });
  return res.data;
};
