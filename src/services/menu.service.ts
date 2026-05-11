import apiClient from './apiClient';
import { DishResponse } from '../types/menuOrder.types';
import { ApiResponse } from '@/types/common.types';

export const MenuService = {
  /**
   * Lấy danh sách tất cả món ăn.
   * Có thể truyền thêm category hoặc isAvailable để lọc.
   */
  getDishes: async (category?: string, isAvailable?: boolean): Promise<ApiResponse<DishResponse[]>> => {
    const params = { category, isAvailable };
    const response = await apiClient.get('/menu/dishes', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một món ăn theo ID
   */
  getDishById: async (dishId: number): Promise<ApiResponse<DishResponse>> => {
    const response = await apiClient.get(`/menu/dishes/${dishId}`);
    return response.data;
  }
};
