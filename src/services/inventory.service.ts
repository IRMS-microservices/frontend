import apiClient from './apiClient';
import { io, Socket } from 'socket.io-client';
import { ApiResponse } from '@/types/common.types';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Measurement units as defined in EUnits. */
export type EUnit = 'KG' | 'G' | 'L' | 'ML' | 'PCS';

/** A single inventory item returned by the API. */
export interface InventoryResponse {
    _id: string;
    name: string;
    quantity: number;
    unit: EUnit;
    createdAt?: string;
    updatedAt?: string;
}

/** Body for POST /api/inventories — create a new stock entry (ADMIN only). */
export interface CreateInventoryRequest {
    name: string;
    quantity: number;
    unit: EUnit;
}

/** Body for PUT /api/inventories/{id} — update an inventory entry (ADMIN only). */
export interface UpdateInventoryRequest {
    name?: string;
    quantity?: number;
    unit?: EUnit;
}

/**
 * Body for PATCH /api/inventories/quantity
 * Unit-aware atomic inventory adjustment (ADMIN, KITCHEN).
 */
export interface AdjustInventoryQuantityRequest {
    name: string;
    delta: number;
    unit: EUnit;
}

/** Query params for GET /api/inventories. */
export interface InventoryQuery {
    page?: number;
    limit?: number;
    name?: string;
    unit?: EUnit;
    minQuantity?: number;
    maxQuantity?: number;
}

/**
 * Socket payload emitted as 'inventory:quantity_updated'
 * by the menu-inventory-service after any quantity mutation.
 */
export interface InventoryUpdatePayload {
    _id: string;
    name: string;
    quantity: number;
    unit: string;
    createdAt?: string;
    updatedAt?: string;
}

// ─── Socket ─────────────────────────────────────────────────────────────────
// Gateway proxies /socket.io/inventories/* → menu-inventory-service /socket.io/*

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

let inventorySocket: Socket | null = null;

function getInventorySocket(): Socket {
    if (!inventorySocket || !inventorySocket.connected) {
        const token = sessionStorage.getItem('token');
        inventorySocket = io(GATEWAY_URL, {
            // Tell Socket.IO client to use the gateway-prefixed path
            path: '/socket.io/inventories/',
            transports: ['websocket', 'polling'],
            autoConnect: true,
            // Backend middleware reads token from handshake.auth.token
            auth: { token },
        });
    }
    return inventorySocket;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const InventoryService = {
    // ── REST Endpoints ───────────────────────────────────────────────────────

    /**
     * GET /api/inventories
     * Query stock levels (ADMIN, KITCHEN).
     * Supports: page, limit, name, unit, minQuantity, maxQuantity
     */
    listInventories: async (
        query?: InventoryQuery
    ): Promise<ApiResponse<InventoryResponse[]>> => {
        const response = await apiClient.get('/api/inventories', { params: query });
        return response.data;
    },

    /**
     * POST /api/inventories
     * Add a new stock entry (ADMIN only).
     * Body: { name, quantity, unit }
     */
    createInventory: async (
        body: CreateInventoryRequest
    ): Promise<ApiResponse<InventoryResponse>> => {
        const response = await apiClient.post('/api/inventories', body);
        return response.data;
    },

    /**
     * GET /api/inventories/{id}
     * Get a single inventory item by ID (ADMIN, KITCHEN).
     */
    getInventoryById: async (
        id: string
    ): Promise<ApiResponse<InventoryResponse>> => {
        const response = await apiClient.get(`/api/inventories/${id}`);
        return response.data;
    },

    /**
     * PUT /api/inventories/{id}
     * Update an inventory entry (ADMIN only).
     */
    updateInventory: async (
        id: string,
        body: UpdateInventoryRequest
    ): Promise<ApiResponse<InventoryResponse>> => {
        const response = await apiClient.put(`/api/inventories/${id}`, body);
        return response.data;
    },

    /**
     * DELETE /api/inventories/{id}
     * Remove an inventory entry (ADMIN only).
     */
    deleteInventory: async (
        id: string
    ): Promise<ApiResponse<void>> => {
        const response = await apiClient.delete(`/api/inventories/${id}`);
        return response.data;
    },

    /**
     * PATCH /api/inventories/quantity
     * Unit-aware atomic quantity adjustment (ADMIN, KITCHEN).
     * Body: { name, delta, unit }  — delta is negative for consumption.
     */
    adjustQuantity: async (
        body: AdjustInventoryQuantityRequest
    ): Promise<ApiResponse<InventoryResponse>> => {
        const response = await apiClient.patch('/api/inventories/quantity', body);
        return response.data;
    },

    // ── Socket.IO ────────────────────────────────────────────────────────────

    /**
     * Connect to the Inventory Socket.IO namespace via the API Gateway.
     * The gateway proxies /socket.io/inventories/* to the menu-inventory-service.
     * Call once when the inventory page (or a component that needs live updates) mounts.
     */
    connect(): Socket {
        return getInventorySocket();
    },

    /**
     * Disconnect and destroy the Inventory Socket.IO socket.
     * Call when the consuming component unmounts.
     */
    disconnect(): void {
        if (inventorySocket) {
            inventorySocket.disconnect();
            inventorySocket = null;
        }
    },

    /**
     * Subscribe to 'inventory:quantity_updated' events.
     * Emitted by the backend whenever an inventory item's quantity changes.
     * Returns an unsubscribe function — call it on component unmount.
     */
    onQuantityUpdated(
        callback: (payload: InventoryUpdatePayload) => void
    ): () => void {
        const s = getInventorySocket();
        s.on('inventory:quantity_updated', callback);
        return () => s.off('inventory:quantity_updated', callback);
    },
};
