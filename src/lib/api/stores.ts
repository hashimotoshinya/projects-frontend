import api from "../axios";

export type Store = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  memo?: string;
  lat?: number | null;
  lng?: number | null;
  staff_name?: string;
};

export const getStores = async (): Promise<Store[]> => {
  const res = await api.get("/api/stores");

  console.log(res.data); // ←追加

  return res.data.data;
};

export const getStore = async (id: number): Promise<Store> => {
  const res = await api.get(`/api/stores/${id}`);
  return res.data.data;
};

export const createStore = async (data: {
  name: string;
  address?: string;
  phone?: string;
  lat?: number | null;
  lng?: number | null;
  staff_name?: string;
}) => {
  const res = await api.post("/api/stores", data);
  return res.data;
};

export const updateStore = async (
  id: number,
  data: {
    name: string;
    address?: string;
    phone?: string;
    lat?: number | null;
    lng?: number | null;
    staff_name?: string;
  },
) => {
  const res = await api.put(`/api/stores/${id}`, data);
  return res.data;
};

export const deleteStore = async (id: number) => {
  const res = await api.delete(`/api/stores/${id}`);
  return res.data;
};
