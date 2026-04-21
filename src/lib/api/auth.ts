import api from "../axios";

// CSRF Cookie を明示的に取得
const ensureCsrfToken = async () => {
  try {
    console.log("🔄 Getting CSRF token...");
    const response = await api.get("/sanctum/csrf-cookie");
    console.log("✅ CSRF token response:", response);

    const csrfToken = response.data?.csrf_token;
    if (csrfToken) {
      api.defaults.headers.common["X-XSRF-TOKEN"] = csrfToken;
      console.log("✅ Set X-XSRF-TOKEN header from response token");
    }

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

  // 🔥 トークン保存
  localStorage.setItem("token", res.data.token);

  return res.data;
};

export const logout = async () => {
  await api.post("/api/logout");

  localStorage.removeItem("token");
};
