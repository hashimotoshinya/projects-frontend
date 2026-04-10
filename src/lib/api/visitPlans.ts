import api from "../axios";

export const createVisitPlan = async (
  storeId: number,
  visitDate: string,
  memo: string,
) => {
  const res = await api.post("/api/visit-plans", {
    store_id: storeId,
    visit_date: visitDate,
    memo,
  });

  return res.data;
};

export const getVisitPlansByStore = async (storeId: number) => {
  const res = await api.get(`/api/visit-plans/store/${storeId}`);
  return res.data;
};

export const getVisitPlansByDate = async (date: string) => {
  const res = await api.get(`/api/visit-plans/${date}`);
  return res.data;
};

export const updateVisitPlan = async (id: number, memo: string) => {
  const res = await api.put(`/api/visit-plans/${id}`, { memo });
  return res.data;
};

export const deleteVisitPlan = async (id: number) => {
  const res = await api.delete(`/api/visit-plans/${id}`);
  return res.data;
};

export const completeVisitPlan = async (id: number, memo: string) => {
  const res = await api.put(`/api/visit-plans/${id}/complete`, { memo });
  return res.data;
};

export const uncompleteVisitPlan = async (id: number) => {
  const res = await api.put(`/api/visit-plans/${id}/uncomplete`);
  return res.data;
};

export const getFuturePlans = async () => {
  const res = await api.get("/api/visit-plans/future");
  return res.data;
};
