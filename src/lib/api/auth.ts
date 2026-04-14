import api from "../axios";

// CSRF Cookie を明示的に取得
const ensureCsrfToken = async () => {
  try {
    await api.get("/sanctum/csrf-cookie");
  } catch (error) {
    console.warn("Failed to get CSRF token", error);
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  // POST 前に CSRF トークンを確保
  await ensureCsrfToken();

  const res = await api.post("/api/register", {
    name,
    email,
    password,
  });

  return res.data;
};

export const login = async (email: string, password: string) => {
  // POST 前に CSRF トークンを確保
  await ensureCsrfToken();

  const res = await api.post("/api/login", {
    email,
    password,
  });

  return res.data;
};

export const logout = async () => {
  const res = await api.post("/api/logout");

  return res.data;
};
