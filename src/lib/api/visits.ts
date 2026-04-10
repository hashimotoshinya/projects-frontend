import api from "../axios";

export const getVisits = async (storeId: number) => {
  const res = await api.get(`/api/stores/${storeId}/visits`);
  return res.data;
};

export const createVisit = async (
  storeId: number,
  memo?: string,
  date?: string,
) => {
  const res = await api.post(`/api/stores/${storeId}/visits`, {
    memo,
    date,
  });

  return res.data;
};

export const getVisitsByDate = async (date: string) => {
  const res = await api.get(`/api/visits/date/${date}`);
  return res.data;
};

export const getVisitCalendar = async () => {
  const res = await api.get("/api/visits/calendar");
  return res.data;
};

