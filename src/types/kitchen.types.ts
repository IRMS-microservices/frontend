export enum CookingStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum KitchenOrderStatus {
    PENDING = "PENDING",
    SERVED = "SERVED",
    CANCELLED = "CANCELLED"
}

export enum SocketEventTypes {
    ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED",
    ITEM_STATUS_CHANGED = "ITEM_STATUS_CHANGED",
    KITCHEN_ORDER_CREATED = "KITCHEN_ORDER_CREATED"
}

export interface KitchenOrderItemResponse {
    _id: number;
    dishId: number;
    restaurantId: string;
    dishName: string;
    quantity: number;
    notes: string;
    cookingStatus: CookingStatus;
    estimatedCookingTime: string | null;
    handlerUsername: string | null;
}

export interface KitchenOrderResponse {
    _id: number;
    orderId: number;
    status: KitchenOrderStatus;
    fireTime: string;
    items: KitchenOrderItemResponse[];
}

export interface KitchenOrderQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    orderId?: string;
    status?: string;
    tableId?: string;
    restaurantId?: string;
    fireTimeStart?: string;
    fireTimeEnd?: string;
}

export interface UpdateKitchenOrderItemRequest {
    cookingStatus: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
}

export interface UpdateKitchenOrderRequest {
    status?: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
    [key: string]: unknown;
}