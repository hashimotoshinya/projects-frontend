import api from "../axios";

// CSRF Cookie を明示的に取得
const ensureCsrfToken = async () => {
  try {
    console.log("🔄 Getting CSRF token...");
    const response = await api.get("/sanctum/csrf-cookie");
    console.log("✅ CSRF token response:", response);
    console.log("🍪 Current cookies:", document.cookie);
  } catch (error) {
    console.warn("❌ Failed to get CSRF token", error);
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
  // CSRF取得
  await ensureCsrfToken();

  console.log("🚀 Attempting login with:", { email, password });
  console.log("🍪 Cookies before login:", document.cookie);

  // Axiosの自動CSRF処理に任せる
  const res = await api.post("/api/login", {
    email,
    password,
  });

  console.log("✅ Login response:", res);
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/api/logout");

  return res.data;
};
