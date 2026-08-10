import apiClient from './apiClient';
import { ApiResponse, Pagination } from '../types/common.types';

import { UserResponse, CreateUserRequest, UpdateUserRequest, UserListQuery } from '../types/user.types';

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
  listUsers: async (query?: UserListQuery): Promise<ApiResponse<Pagination<UserResponse[]>>> => {
    const response = await apiClient.get<ApiResponse<Pagination<UserResponse[]>>>('/api/users/list', { params: query });
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
