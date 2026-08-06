import apiClient, { clearSession, saveSession } from './apiClient';
import { ApiResponse } from '../types/common.types';
import { LoginRequest, AuthResponse, RegisterRequest } from '../types/auth.types';

export const AuthService = {
  /**
   * POST /api/auth/login
   * Public endpoint — returns accessToken (and optional refreshToken).
   */
  login: async (request: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', request);
    const loginRes = response.data;
    if (loginRes.success) {
      // Backend returns { accessToken, refreshToken? } — store accessToken as "token"
      saveSession(loginRes.data.accessToken ?? (loginRes.data as any).token, loginRes.data.role);
    }
    return loginRes;
  },

  /**
   * POST /api/auth/logout
   * Authenticated users only. Optionally sends refreshToken in body.
   */
  logout: async (refreshToken?: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/auth/logout', refreshToken ? { refreshToken } : undefined);
    clearSession();
    return response.data;
  },

  /**
   * POST /api/auth/refresh-token
   * Exchange a refresh token for a new access token.
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/refresh-token', { refreshToken });
    return response.data;
  },

  /**
   * POST /api/auth/register
   * Register a new staff user (ADMIN only).
   */
  register: async (request: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', request);
    return response.data;
  },
};
