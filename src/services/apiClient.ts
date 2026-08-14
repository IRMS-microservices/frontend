import axios from 'axios';
import { AxiosResponse } from 'axios';

const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

// Khởi tạo một Axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials ensures HttpOnly cookies (accessToken, refreshToken)
  // set by the backend are automatically sent on every request.
  withCredentials: true,
  // timeout: 10000, // 10 giây
});

export const saveSession = (token: string, role: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict`;
    document.cookie = `${ROLE_KEY}=${role}; path=/; SameSite=Strict`;
  }
}

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; SameSite=Strict`;
    document.cookie = `${ROLE_KEY}=; path=/; SameSite=Strict`;
  }
}

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // The backend sets accessToken as an HttpOnly cookie, which is sent
      // automatically by the browser (via withCredentials: true) and cannot
      // be read by JS. We also attach any token stored in sessionStorage as
      // a Bearer header for gateways that prefer the Authorization header.
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Attempt a silent token refresh on the first 401, then retry.
    // Skip if this IS the refresh request itself to avoid infinite loops.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh-token')
    ) {
      if (isRefreshing) return Promise.reject(error);
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // The refresh token is in an HttpOnly cookie — no body payload needed.
        await apiClient.post('/api/auth/refresh-token');
        // The backend has rotated the accessToken cookie; also update
        // sessionStorage with the new token if present in the response.
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        clearSession();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      console.warn('Forbidden: insufficient permissions.');
    }

    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use((config) => {
  if (config.params) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    );
  }
  return config;
});

export default apiClient;
