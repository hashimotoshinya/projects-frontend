import api from "../axios";

export const getUser = async () => {
  const res = await api.get("/api/user");
  return res.data;
};
