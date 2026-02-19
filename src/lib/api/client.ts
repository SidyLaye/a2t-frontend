import axios from "axios";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useTenantStore } from "@/lib/stores/tenant.store";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Paths that don't need auth or tenant headers
const PUBLIC_PATHS = ["/api/v1/auth/login/", "/api/v1/auth/register/", "/api/v1/auth/token/refresh/", "/api/v1/subscriptions/plans/"];

// Request interceptor: inject auth + tenant headers
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  const { activeEntrepreneurId } = useTenantStore.getState();
  const url = config.url || "";

  if (accessToken && !PUBLIC_PATHS.some((p) => url.includes(p))) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (activeEntrepreneurId && !PUBLIC_PATHS.some((p) => url.includes(p))) {
    config.headers["X-Entrepreneur-Id"] = activeEntrepreneurId;
  }

  return config;
});

// Response interceptor: handle 401 with token refresh
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url?.includes("/auth/token/refresh/")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (!refreshToken) {
      logout();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/token/refresh/`,
        { refresh: refreshToken }
      );
      setTokens({ access: data.access, refresh: data.refresh || refreshToken });
      processQueue(null, data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
