import apiClient, { clearSession, saveSession } from './apiClient';
import { ApiResponse } from '../types/common.types';
import { LoginRequest, AuthResponse, RegisterRequest } from '../types/auth.types';

export const AuthService = {
  /**
   * Login to the application
   */
  login: async (request: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', request);
    const loginRes = response.data
    if (loginRes.success) {
      saveSession(loginRes.data.token, loginRes.data.role);
    }
    return loginRes;
  },

  /**
   * Logout from the application
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    clearSession();
    return response.data;
  },

  /**
   * Refresh the token
   */
  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.get<ApiResponse<AuthResponse>>('/auth/refresh-token');
    return response.data;
  },

  /**
   * Register a new user (Admin only)
   */
  register: async (request: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', request);
    return response.data;
  }
};
