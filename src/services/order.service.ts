import apiClient from './apiClient';
import { io, Socket } from 'socket.io-client';
import { CreateOrderRequest, OrderResponse, OrderQuery, UpdateOrderRequest } from '../types/menuOrder.types';
import { ApiResponse } from '@/types/common.types';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
let orderSocket: Socket | null = null;

function getOrderSocket(): Socket {
    if (!orderSocket || !orderSocket.connected) {
        const token = sessionStorage.getItem('token');
        orderSocket = io(GATEWAY_URL, {
            path: '/socket.io/orders/', // Ensure this matches your gateway or service routing
            transports: ['websocket', 'polling'],
            autoConnect: true,
            auth: { token },
        });
    }
    return orderSocket;
}

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
  getOrders: async (query?: OrderQuery): Promise<ApiResponse<OrderResponse[]>> => {
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

  // ── Socket.IO ────────────────────────────────────────────────────────────

  connect(): Socket {
      return getOrderSocket();
  },

  disconnect(): void {
      if (orderSocket) {
          orderSocket.disconnect();
          orderSocket = null;
      }
  },

  /**
   * Listen for 'order_kitchen_update' events emitted by the order-payment-service
   */
  onOrderServiceStatusChanged(
      callback: (updatedOrder: OrderResponse) => void
  ): () => void {
      const s = getOrderSocket();
      // Use the event name emitted by the backend: 'order_kitchen_update'
      s.on('order_kitchen_update', callback);
      return () => s.off('order_kitchen_update', callback);
  },
};
