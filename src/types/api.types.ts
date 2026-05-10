export type PaymentStatus = 'Unpaid' | 'Paid';
export type ServiceStatus = 'Waiting' | 'Eating' | 'Finished';
export type DishCategory = 'Main_Course' | 'Appetizer' | 'Dessert' | 'Beverage' | 'Side';

export interface DishResponse {
  dishId: number;
  name: string;
  category: DishCategory;
  basePrice: number;
  available: boolean;
}

export interface OrderItemResponse {
  itemId: number;
  dishId: number;
  dishName: string;
  quantity: number;
  salePrice: number;
  notes: string | null;
}

export interface OrderResponse {
  orderId: number;
  tableId: number;
  customerId: number | null;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  serviceStatus: ServiceStatus;
  note: string | null;
  createdBy: number;
  createdAt: string; // ISO string from LocalDateTime
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  dishId: number;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  tableId: number;
  customerId: number;
  note?: string;
  items: OrderItemRequest[];
}