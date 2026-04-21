import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.defaults.withCredentials = true;
api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔥 これ追加（重要）
api.interceptors.request.use((config) => {
  const token = decodeURIComponent(
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1] || "",
  );

  if (token) {
    config.headers["X-XSRF-TOKEN"] = token;
  }

  return config;
});

export default api;
