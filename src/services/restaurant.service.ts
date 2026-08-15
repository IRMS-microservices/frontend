import apiClient from './apiClient';
import { ApiResponse } from '@/types/common.types';
import {
  RestaurantResponse,
  RestaurantQuery,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
} from '@/types/restaurant.types';

export const RestaurantService = {
  /**
   * GET /api/restaurants
   * Get all restaurants based on query
   */
  getRestaurants: async (query?: RestaurantQuery): Promise<ApiResponse<RestaurantResponse[]>> => {
    const response = await apiClient.get('/api/restaurants', { params: query });
    return response.data;
  },

  /**
   * GET /api/restaurants/{id}
   * Get restaurant by ID
   */
  getRestaurantById: async (id: string): Promise<ApiResponse<RestaurantResponse>> => {
    const response = await apiClient.get(`/api/restaurants/${id}`);
    return response.data;
  },

  /**
   * POST /api/restaurants
   * Create a new restaurant
   */
  createRestaurant: async (request: CreateRestaurantRequest): Promise<ApiResponse<RestaurantResponse>> => {
    const response = await apiClient.post('/api/restaurants', request);
    return response.data;
  },

  /**
   * PUT /api/restaurants/{id}
   * Update restaurant
   */
  updateRestaurant: async (id: string, request: UpdateRestaurantRequest): Promise<ApiResponse<RestaurantResponse>> => {
    const response = await apiClient.put(`/api/restaurants/${id}`, request);
    return response.data;
  },

  /**
   * DELETE /api/restaurants/{id}
   * Delete restaurant
   */
  deleteRestaurant: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/restaurants/${id}`);
    return response.data;
  },

  setPin: async (pin: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/api/restaurants/pin`, { pin: Number(pin) });
    return response.data;
  },

  verifyPin: async (pin: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/api/restaurants/pin/verify`, { pin: Number(pin) });
    return response.data;
  },
};
