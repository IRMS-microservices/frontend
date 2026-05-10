import apiClient from './apiClient';
import { DishResponse } from '../types/api.types';

export const MenuService = {
  /**
   * Lấy danh sách tất cả món ăn.
   * Có thể truyền thêm category hoặc isAvailable để lọc.
   */
  getDishes: async (category?: string, isAvailable?: boolean): Promise<DishResponse[]> => {
    const params = { category, isAvailable };
    const response = await apiClient.get('/menu/dishes', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một món ăn theo ID
   */
  getDishById: async (dishId: number): Promise<DishResponse> => {
    const response = await apiClient.get(`/menu/dishes/${dishId}`);
    return response.data;
  }
};
