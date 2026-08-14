import apiClient, { clearSession, saveSession } from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  CredentialAccessTokenResponse,
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  VerifyRestaurantPinRequest,
} from '../types/auth.types';
import { RestaurantService } from './restaurant.service';
import { UserResponse } from '@/types/user.types';

/**
 * Decode the payload segment of a JWT without verifying the signature.
 * Safe to use client-side only for non-security-critical data (e.g. role for routing).
 * The server always re-validates the token on every protected request.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1];
    // Replace URL-safe chars and pad to a multiple of 4
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export const AuthService = {
  /**
   * POST /api/auth/login
   * Public endpoint — returns accessToken (and optional refreshToken).
   */
  login: async (request: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', request);
    const loginRes = response.data;
    if (loginRes.success && loginRes.data?.accessToken) {
      // Backend returns { success, data: { accessToken } } — no role in the body.
      // Decode the JWT payload (client-side, no crypto) to extract `role` so the
      // login page can route the user to the correct dashboard.
      const payload = decodeJwtPayload(loginRes.data.accessToken);
      const role = (payload.role as string) ?? '';

      // Enrich the response object in-place so callers see role on data.
      loginRes.data = { ...loginRes.data, role };

      // Mirror accessToken + role into sessionStorage for the request interceptor.
      saveSession(loginRes.data.accessToken, role);
    }
    return loginRes;
  },

  /**
   * POST /api/auth/logout
   * Authenticated users only. The backend reads refreshToken from the HttpOnly cookie.
   */
  logout: async (): Promise<ApiResponse<void>> => {
    // The backend reads refreshToken from the HttpOnly cookie automatically.
    // No body payload is required.
    const response = await apiClient.post<ApiResponse<void>>('/api/auth/logout');
    clearSession();
    return response.data;
  },

  /**
   * POST /api/auth/refresh-token
   * Exchange a refresh token for a new access token.
   */
  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    // The backend reads refreshToken from the HttpOnly cookie automatically.
    // No body payload is required.
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/refresh-token');
    if (response.data.success && response.data.data?.accessToken) {
      // Decode the new accessToken to keep role in sync with sessionStorage.
      const payload = decodeJwtPayload(response.data.data.accessToken);
      const role = (payload.role as string) ?? '';
      response.data.data = { ...response.data.data, role };
      saveSession(response.data.data.accessToken, role);
    }
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
