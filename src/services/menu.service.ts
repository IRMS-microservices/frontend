import apiClient from './apiClient';
import { DishResponse } from '../types/menuOrder.types';
import { ApiResponse } from '@/types/common.types';

export interface DishQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
  category?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const MenuService = {
  /**
   * GET /api/dishes
   * Public menu catalog. Supports: page, limit, sortBy, sortOrder, name,
   * category, isAvailable, minPrice, maxPrice
   */
  getDishes: async (query?: DishQuery): Promise<ApiResponse<DishResponse[]>> => {
    const response = await apiClient.get('/api/dishes', { params: query });
    return response.data;
  },

  /**
   * GET /api/dishes/{id}
   * Get dish item details.
   */
  getDishById: async (dishId: string): Promise<ApiResponse<DishResponse>> => {
    const response = await apiClient.get(`/api/dishes/${dishId}`);
    return response.data;
  },

  /**
   * POST /api/dishes
   * Create a new dish entry (ADMIN only).
   */
  createDish: async (body: Record<string, unknown>): Promise<ApiResponse<DishResponse>> => {
    const response = await apiClient.post('/api/dishes', body);
    return response.data;
  },

  /**
   * PUT /api/dishes/{id}
   * Modify dish details (ADMIN only).
   */
  updateDish: async (dishId: string, body: Record<string, unknown>): Promise<ApiResponse<DishResponse>> => {
    const response = await apiClient.put(`/api/dishes/${dishId}`, body);
    return response.data;
  },

  /**
   * DELETE /api/dishes/{id}
   * Remove a dish (ADMIN only).
   */
  deleteDish: async (dishId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/dishes/${dishId}`);
    return response.data;
  },
};
