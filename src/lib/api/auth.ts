import api from "../axios";

// 🔥 CSRF関連は全部削除

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await api.post("/api/register", {
    name,
    email,
    password,
  });

  localStorage.setItem("token", res.data.token);

  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await api.post("/api/login", {
    email,
    password,
  });

  localStorage.setItem("token", res.data.token);

  return res.data;
};

export const logout = async () => {
  await api.post("/api/logout");

  localStorage.removeItem("token");
};
