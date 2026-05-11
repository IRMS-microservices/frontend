import apiClient from './apiClient';
import { io, Socket } from 'socket.io-client';
import { ApiResponse } from '@/types/common.types';
import {
    KitchenOrderResponse,
    KitchenOrderItemResponse,
    KitchenOrderStatus,
} from '@/types/kitchen.types';

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:8099';

let socket: Socket | null = null;

function getSocket(): Socket {
    if (!socket || !socket.connected) {
        const token = sessionStorage.getItem("token");
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            query: {
                token: token
            }
        });
    }
    return socket;
}

export const KitchenService = {
    /**
     * GET /kitchen/orders
     * List all kitchen orders. Optionally filter by status.
     */
    listOrders: async (
        status?: KitchenOrderStatus
    ): Promise<ApiResponse<KitchenOrderResponse[]>> => {
        const params = status ? { status } : {};
        const response = await apiClient.get('/kitchen/orders', { params });
        return response.data;
    },

    /**
     * GET /kitchen/orders/{kitchenOrderId}
     * Get a specific kitchen order by its ID.
     */
    getOrderById: async (
        kitchenOrderId: number
    ): Promise<ApiResponse<KitchenOrderResponse>> => {
        const response = await apiClient.get(
            `/kitchen/orders/${kitchenOrderId}`
        );
        return response.data;
    },

    /**
     * PATCH /kitchen/orders/{kitchenOrderId}/status
     * Advance the status of a kitchen order
     * (PENDING → PROCESSING → SERVED).
     */
    advanceOrderStatus: async (
        kitchenOrderId: number
    ): Promise<ApiResponse<KitchenOrderResponse>> => {
        const response = await apiClient.patch(
            `/kitchen/orders/${kitchenOrderId}/status`
        );
        return response.data;
    },

    /**
     * PATCH /kitchen/items/{kitchenItemId}/status
     * Advance the cooking status of a single kitchen order item
     * (NOT_STARTED → IN_PROGRESS → COMPLETED).
     */
    advanceItemStatus: async (
        kitchenItemId: number
    ): Promise<ApiResponse<KitchenOrderItemResponse>> => {
        const response = await apiClient.patch(
            `/kitchen/items/${kitchenItemId}/status`
        );
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
     * Subscribe to ORDER_STATUS_CHANGED events.
     * Emitted by the backend whenever a KitchenOrder status changes.
     */
    onOrderStatusChanged(
        callback: (order: KitchenOrderResponse) => void
    ): () => void {
        const s = getSocket();
        s.on('ORDER_STATUS_CHANGED', callback);
        return () => s.off('ORDER_STATUS_CHANGED', callback);
    },

    /**
     * Subscribe to ITEM_STATUS_CHANGED events.
     * Emitted by the backend whenever a KitchenOrderItem status changes.
     */
    onItemStatusChanged(
        callback: (item: KitchenOrderItemResponse) => void
    ): () => void {
        const s = getSocket();
        s.on('ITEM_STATUS_CHANGED', callback);
        return () => s.off('ITEM_STATUS_CHANGED', callback);
    },

    /**
     * Subscribe to KITCHEN_ORDER_CREATED events.
     * Emitted by the backend when a new KitchenOrder is created.
     */
    onKitchenOrderCreated(
        callback: (order: KitchenOrderResponse) => void
    ): () => void {
        const s = getSocket();
        s.on('KITCHEN_ORDER_CREATED', callback);
        return () => s.off('KITCHEN_ORDER_CREATED', callback);
    },
};
