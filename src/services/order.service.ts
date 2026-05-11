import apiClient from './apiClient';
import { CreateOrderRequest, OrderResponse } from '../types/menuOrder.types';
import { ApiResponse } from '@/types/common.types';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:8099';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

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
  },

  /**
       * Connect to the SocketIO server.
       * Call once when the kitchen page mounts.
       */
  connect(): Socket {
    return getSocket();
  },

  /**
   * Disconnect and destroy the SocketIO socket.
   * Call when the kitchen page unmounts.
   */
  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
     * Subscribe to ORDER_SERVICE_STATUS_CHANGED events.
     * Emitted by the backend whenever a Order status changes.
     */
  onOrderServiceStatusChanged(
    callback: (order: OrderResponse) => void
  ): () => void {
    const s = getSocket();
    s.on('ORDER_SERVICE_STATUS_CHANGED', callback);
    return () => s.off('ORDER_SERVICE_STATUS_CHANGED', callback);
  },
};
