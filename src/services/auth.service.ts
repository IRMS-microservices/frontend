import apiClient, { clearSession, saveSession } from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  CredentialAccessTokenResponse,
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  VerifyRestaurantPinRequest,
  WorkspaceRegisterData,
} from '../types/auth.types';
import { RestaurantService } from './restaurant.service';
import { UserResponse } from '@/types/user.types';

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
      const loginData = loginRes.data as AuthResponse & { token?: string };
      saveSession(loginData.accessToken ?? loginData.token ?? '', loginData.role);
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
  register: async (request: RegisterRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/api/auth/register', request);
    return response.data;
  },

  /**
   * POST /api/restaurants/pin/verify
   * Verify a restaurant PIN and receive a short-lived credential access token.
   */
  verifyRestaurantPin: async (
    request: VerifyRestaurantPinRequest,
  ): Promise<ApiResponse<CredentialAccessTokenResponse>> => {
    const response = await apiClient.post<ApiResponse<CredentialAccessTokenResponse>>('/api/restaurants/pin/verify', request);
    return response.data;
  },

};
