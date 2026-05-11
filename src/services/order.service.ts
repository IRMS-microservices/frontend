import apiClient from './apiClient';
import { CreateOrderRequest, OrderResponse } from '../types/menuOrder.types';
import { ApiResponse } from '@/types/common.types';

export const OrderService = {
  /**
   * Tạo đơn hàng mới cho khách (Gửi event sang nhà bếp)
   */
  createOrder: async (request: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    const response = await apiClient.post('/orders', request);
    return response.data;
  },

  /**
   * Lấy danh sách các đơn hàng theo bàn hoặc trạng thái
   */
  getOrders: async (tableId?: number, serviceStatus?: string, paymentStatus?: string): Promise<ApiResponse<OrderResponse[]>> => {
    const params = { tableId, serviceStatus, paymentStatus };
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  getOrderById: async (orderId: number): Promise<ApiResponse<OrderResponse>> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cập nhật trạng thái phục vụ (Waiting -> Eating -> Finished)
   */
  updateServiceStatus: async (orderId: number, serviceStatus: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { serviceStatus });
    return response.data;
  },

  /**
   * Đánh dấu đã thanh toán
   */
  updatePaymentStatus: async (orderId: number, paymentStatus: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await apiClient.patch(`/orders/${orderId}/payment`, { paymentStatus });
    return response.data;
  }
};
