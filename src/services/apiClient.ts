import axios from 'axios';
import { AxiosResponse } from 'axios';

const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

// Khởi tạo một Axios instance với cấu hình mặc định
const apiClient = axios.create({
  // Tạm thời dùng Next.js Route Handlers (Mock API) thay vì BE Java
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      // Try sessionStorage first, fall back to cookie
      const token = sessionStorage.getItem('token')
        ?? document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Forbidden: Token may be invalid or expired.");
      clearSession()
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
