import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';

export interface UserResponse {
  id: number;
  username: string;
  full_name: string;
  phone_number: string;
  role: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone_number?: string;
  role?: string;
  password?: string;
}

export const UserService = {
  /**
   * Get all users
   */
  getAllUsers: async (): Promise<ApiResponse<UserResponse[]>> => {
    // Controller is mapped to /api/v1/users, and apiClient baseURL is /api
    const response = await apiClient.get<ApiResponse<UserResponse[]>>('/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`);
    return response.data;
  },

  /**
   * Update a user
   */
  updateUser: async (id: number, request: UpdateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.put<ApiResponse<UserResponse>>(`/users/${id}`, request);
    return response.data;
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  }
};
