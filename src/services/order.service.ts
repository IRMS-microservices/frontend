import apiClient from './apiClient';
import { CreateOrderRequest, OrderResponse, OrderQuery, UpdateOrderRequest } from '../types/menuOrder.types';
import { ApiResponse, Pagination } from '@/types/common.types';

export const OrderService = {
  /**
   * POST /api/orders
   * Create a dining order (SERVER, ADMIN).
   */
  createOrder: async (request: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    const response = await apiClient.post('/api/orders', request);
    return response.data;
  },

  /**
   * GET /api/orders
   * List orders with filters (SERVER, ADMIN).
   * Supports: page, limit, tableId, customerId, customerName, customerPhone,
   *           paymentStatus, serviceStatus, createdBy, note, startDate, endDate
   */
  getOrders: async (query?: OrderQuery): Promise<ApiResponse<Pagination<OrderResponse[]>>> => {
    const response = await apiClient.get('/api/orders', { params: query });
    return response.data;
  },

  /**
   * GET /api/orders/{id}
   * Get order details.
   */
  getOrderById: async (orderId: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await apiClient.get(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * PUT /api/orders/{id}
   * Update an order (e.g. status, paymentStatus, serviceStatus).
   */
  updateOrder: async (
    orderId: string,
    body: UpdateOrderRequest
  ): Promise<ApiResponse<OrderResponse>> => {
    const response = await apiClient.put(`/api/orders/${orderId}`, body);
    return response.data;
  },

  /**
   * DELETE /api/orders/{id}
   * Delete an order.
   */
  deleteOrder: async (orderId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/orders/${orderId}`);
    return response.data;
  },
};
