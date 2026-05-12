export enum PaymentStatus {
  UNPAID = 'Unpaid',
  PAID = 'Paid',
}

export enum ServiceStatus {
  WAITING = 'Waiting',
  EATING = 'Eating',
  FINISHED = 'Finished',
}

export enum DishCategory {
  MAIN_COURSE = 'Main_Course',
  APPETIZER = 'Appetizer',
  DESSERT = 'Dessert',
  BEVERAGE = 'Beverage',
  SIDE = 'Side',
}

export interface DishResponse {
  dishId: number;
  name: string;
  category: DishCategory;
  basePrice: number;
  available: boolean;
  imageUrl: string;
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