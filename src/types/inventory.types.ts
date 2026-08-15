export type EUnit = 'KG' | 'G' | 'L' | 'ML' | 'PCS';

export interface InventoryResponse {
    id: string;
    name: string;
    quantity: number;
    unit: EUnit;
    lastImportQuantity: number;
    warningThreshold: number;
    restaurantId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateInventoryRequest {
    name: string;
    quantity: number;
    unit: EUnit;
    warningThreshold?: number;
}

export interface UpdateInventoryRequest {
    name?: string;
    quantity?: number;
    unit?: EUnit;
    warningThreshold?: number;
    lastImportQuantity?: number;
}

export interface AdjustInventoryQuantityRequest {
    name: string;
    delta: number;
    unit: EUnit;
    reason: 'IMPORT' | 'SALE'
}

export interface InventoryQuery {
    page?: number;
    limit?: number;
    name?: string;
    unit?: EUnit;
    restaurantId?: string;
    minQuantity?: number;
    maxQuantity?: number;
}

export interface InventoryUpdatePayload {
    id: string;
    name: string;
    quantity: number;
    unit: EUnit;
    lastImportQuantity: number;
    warningThreshold: number;
    createdAt?: string;
    updatedAt?: string;
}
