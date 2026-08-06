import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';

export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}

export interface CreateUserRequest {
  fullName: string;
  role: 'SERVER' | 'ADMIN' | 'KITCHEN';
  phoneNumber: string;
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  role?: 'SERVER' | 'ADMIN' | 'KITCHEN';
  password?: string;
}

export interface UserListQuery {
  role?: 'SERVER' | 'ADMIN' | 'KITCHEN';
  search?: string;
  page?: number;
  limit?: number;
}

export const UserService = {
  /**
   * GET /api/users/profile
   * Fetch the current authenticated user's profile.
   */
  getProfile: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>('/api/users/profile');
    return response.data;
  },

  /**
   * GET /api/users/list
   * List staff users (ADMIN only).
   * Supports: role, search, page, limit
   */
  listUsers: async (query?: UserListQuery): Promise<ApiResponse<UserResponse[]>> => {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>('/api/users/list', { params: query });
    return response.data;
  },

  /**
   * POST /api/users/create
   * Create a new user (ADMIN only).
   */
  createUser: async (request: CreateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/api/users/create', request);
    return response.data;
  },

  /**
   * PUT /api/users/update/{id}
   * Update user fields: fullName, role, phoneNumber, password (ADMIN only).
   */
  updateUser: async (id: string, request: UpdateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.put<ApiResponse<UserResponse>>(`/api/users/update/${id}`, request);
    return response.data;
  },

  /**
   * DELETE /api/users/delete/{id}
   * Remove a user (ADMIN only).
   */
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/users/delete/${id}`);
    return response.data;
  },
};
