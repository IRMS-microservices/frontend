import apiClient from './apiClient';
import { io, Socket } from 'socket.io-client';
import { DishResponse, DishQuery } from '../types/menuOrder.types';
import { ApiResponse } from '@/types/common.types';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

let menuSocket: Socket | null = null;

function getMenuSocket(): Socket {
    if (!menuSocket) {
        const token = sessionStorage.getItem('token');
        menuSocket = io(GATEWAY_URL, {
            path: '/socket.io/inventories/',
            transports: ['websocket', 'polling'],
            autoConnect: true,
            auth: { token },
        });
    }
    return menuSocket;
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

  // ── Socket.IO ────────────────────────────────────────────────────────────

  /**
   * Connect to the Socket.IO namespace via the API Gateway.
   * The gateway proxies /socket.io/inventories/* to the menu-inventory-service.
   * (We use the same path as inventory since they share the same socket server)
   */
  connect(): Socket {
    return getMenuSocket();
  },

  /**
   * Disconnect and destroy the Socket.IO socket.
   */
  disconnect(): void {
    if (menuSocket) {
      menuSocket.disconnect();
      menuSocket = null;
    }
  },

  /**
   * Subscribe to 'dish:status_changed' events.
   */
  onDishStatusChanged(
    callback: (payload: { id: string; isAvailable: boolean; restaurantId: string }) => void
  ): () => void {
    const s = getMenuSocket();
    const handler = (payload: any) => {
      callback({
        ...payload,
        id: String(payload?.id ?? payload?._id ?? ''),
      });
    };
    s.on('dish:status_changed', handler);
    return () => s.off('dish:status_changed', handler);
  },
};
