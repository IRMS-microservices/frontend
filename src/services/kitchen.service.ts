import apiClient from './apiClient';
import { io, Socket } from 'socket.io-client';
import { ApiResponse, Pagination } from '@/types/common.types';
import {
    KitchenOrderResponse,
    KitchenOrderItemResponse,
    KitchenOrderQuery,
    UpdateKitchenOrderItemRequest,
    UpdateKitchenOrderRequest
} from '@/types/kitchen.types';

// ─── Socket ─────────────────────────────────────────────────────────────────
// Gateway proxies /socket.io/kitchen/* → kitchen-service /socket.io/*
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

let kitchenSocket: Socket | null = null;

function getKitchenSocket(): Socket {
    if (!kitchenSocket || !kitchenSocket.connected) {
        const token = sessionStorage.getItem('token');
        kitchenSocket = io(GATEWAY_URL, {
            // Tell Socket.IO client to use the gateway-prefixed path
            path: '/socket.io/kitchen/',
            transports: ['websocket', 'polling'],
            autoConnect: true,
            // Backend middleware reads token from handshake.auth.token
            auth: { token },
        });
    }
    return kitchenSocket;
}

// ─── REST ────────────────────────────────────────────────────────────────────


export const KitchenService = {
    // ── Kitchen Orders ───────────────────────────────────────────────────────

    /**
     * GET /api/kitchen-orders
     * Retrieve kitchen display board tickets (KITCHEN role).
     */
    listOrders: async (
        query?: KitchenOrderQuery
    ): Promise<ApiResponse<Pagination<KitchenOrderResponse[]>>> => {
        const response = await apiClient.get('/api/kitchen-orders', { params: query });
        return response.data;
    },

    /**
     * POST /api/kitchen-orders
     * Create a new kitchen order.
     */
    createOrder: async (
        body: Record<string, unknown>
    ): Promise<ApiResponse<KitchenOrderResponse>> => {
        const response = await apiClient.post('/api/kitchen-orders', body);
        return response.data;
    },

    /**
     * GET /api/kitchen-orders/{id}
     * Get a specific kitchen order by its ID.
     */
    getOrderById: async (
        kitchenOrderId: string
    ): Promise<ApiResponse<KitchenOrderResponse>> => {
        const response = await apiClient.get(`/api/kitchen-orders/${kitchenOrderId}`);
        return response.data;
    },

    /**
     * PUT /api/kitchen-orders/{id}
     * Update a kitchen order (e.g. advance status).
     */
    updateOrder: async (
        kitchenOrderId: string,
        body: UpdateKitchenOrderRequest
    ): Promise<ApiResponse<KitchenOrderResponse>> => {
        const response = await apiClient.put(`/api/kitchen-orders/${kitchenOrderId}`, body);
        return response.data;
    },

    /**
     * DELETE /api/kitchen-orders/{id}
     * Delete a kitchen order.
     */
    deleteOrder: async (
        kitchenOrderId: string
    ): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete(`/api/kitchen-orders/${kitchenOrderId}`);
        return response.data;
    },

    // ── Kitchen Order Items ──────────────────────────────────────────────────

    /**
     * PUT /api/kitchen-order-items/{id}
     * Update individual item cooking status (KITCHEN role).
     * Body: { cookingStatus: "READY"|"PREPARING"|"COMPLETED"|"CANCELLED", notes?: string }
     */
    updateOrderItem: async (
        kitchenItemId: string,
        body: UpdateKitchenOrderItemRequest
    ): Promise<ApiResponse<KitchenOrderItemResponse>> => {
        const response = await apiClient.put(
            `/api/kitchen-order-items/${kitchenItemId}`,
            body
        );
        return response.data;
    },

    // ── Socket.IO ────────────────────────────────────────────────────────────

    /**
     * Connect to the Kitchen Socket.IO namespace via the API Gateway.
     * Call once when the kitchen page mounts.
     * After connecting, emit 'join' with { role: 'expeditor' | 'chef' } to
     * subscribe to the appropriate room.
     */
    connect(): Socket {
        return getKitchenSocket();
    },

    /**
     * Disconnect and destroy the Kitchen Socket.IO socket.
     * Call when the kitchen page unmounts.
     */
    disconnect(): void {
        if (kitchenSocket) {
            kitchenSocket.disconnect();
            kitchenSocket = null;
        }
    },

    /**
     * Join a kitchen room after connecting.
     * role: 'expeditor' → receives order:created events
     * role: 'chef'      → receives ticket:update events
     */
    joinRoom(role: 'expeditor' | 'chef'): void {
        getKitchenSocket().emit('join', { role });
    },

    /**
     * Subscribe to 'order:created' events.
     * Emitted by the backend (room:expeditor) when a new KitchenOrder is created.
     */
    onOrderCreated(
        callback: (order: KitchenOrderResponse) => void
    ): () => void {
        const s = getKitchenSocket();
        s.on('order:created', callback);
        return () => s.off('order:created', callback);
    },

    /**
     * Subscribe to 'ticket:update' events.
     * Emitted by the backend (room:chef) when tickets are updated.
     */
    onTicketUpdate(
        callback: (tickets: KitchenOrderResponse[]) => void
    ): () => void {
        const s = getKitchenSocket();
        s.on('ticket:update', callback);
        return () => s.off('ticket:update', callback);
    },

    /**
     * Subscribe to 'item:completed' events.
     * Emitted by the backend (room:expeditor) when an item is completed.
     */
    onItemCompleted(
        callback: (item: any) => void
    ): () => void {
        const s = getKitchenSocket();
        s.on('item:completed', callback);
        return () => s.off('item:completed', callback);
    },

    /**
     * Subscribe to the 'joined' acknowledgment event.
     * Fired by the backend after a successful room join.
     */
    onJoined(
        callback: (data: { room: string }) => void
    ): () => void {
        const s = getKitchenSocket();
        s.on('joined', callback);
        return () => s.off('joined', callback);
    },

    /**
     * Emit bump kitchen item event via Socket.IO
     */
    bumpItem(kitchenItemId: string, updateData: any): void {
        const s = getKitchenSocket();
        s.emit('bump_kitchen_item', { id: kitchenItemId, update: updateData });
    },

    /**
     * Emit bump kitchen order event via Socket.IO
     */
    bumpOrder(kitchenOrderId: string, updateData: any): void {
        const s = getKitchenSocket();
        s.emit('bump_kitchen_order', { id: kitchenOrderId, update: updateData });
    },
};
