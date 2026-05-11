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
    id: number;
    dishId: number;
    dishName: string;
    quantity: number;
    notes: string;
    cookingStatus: CookingStatus;
    estimatedCookingTime: string | null;
    handlerUsername: string | null;
}

export interface KitchenOrderResponse {
    id: number;
    orderId: number;
    status: KitchenOrderStatus;
    fireTime: string;
    items: KitchenOrderItemResponse[];
}