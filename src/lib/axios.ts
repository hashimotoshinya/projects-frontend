import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

/**
 * Cookie から XSRF Token を読み出す
 */
const getCsrfTokenFromCookie = (): string | null => {
  const cookieString = document.cookie;
  const match = cookieString.match(/XSRF-TOKEN=([^;]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Request Interceptor
 * すべてのリクエストに X-XSRF-TOKEN ヘッダーを追加
 */
api.interceptors.request.use((config) => {
  const token = getCsrfTokenFromCookie();
  if (token) {
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});

/**
 * Response Interceptor
 * 419 CSRF エラー時に再試行
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    // CSRF Token が古い場合の自動リトライ
    if (status === 419) {
      try {
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`,
          {
            withCredentials: true,
          },
        );

        // 新しい Token を読み込み、リトライ
        const newToken = getCsrfTokenFromCookie();
        if (newToken && error.config) {
          error.config.headers["X-XSRF-TOKEN"] = newToken;
          return api.request(error.config);
        }
      } catch (retryError) {
        console.error("Failed to refresh CSRF token", retryError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
