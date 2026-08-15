export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

export enum ServiceStatus {
  WAITING = 'WAITING',
  EATING = 'EATING',
  FINISHED = 'FINISHED',
}

export enum DishCategory {
  MAIN_COURSE = 'MAIN_COURSE',
  APPETIZER = 'APPETIZER',
  DESSERT = 'DESSERT',
  BEVERAGE = 'BEVERAGE',
  SIDE = 'SIDE',
}

export interface DishResponse {
  _id: string;
  restaurantId: string;
  name: string;
  category: DishCategory;
  price: number;
  available: boolean;
  image: string;
}

export interface OrderItemResponse {
  id: number;
  dishId: string;
  dishName: string;
  quantity: number;
  salePrice: number;
  notes: string | null;
}

export interface OrderResponse {
  id: number;
  restaurantId: string;
  tableId: string;
  customerId: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  serviceStatus: ServiceStatus;
  note: string | null;
  createdBy: number;
  createdAt: string; // ISO string from LocalDateTime
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  dishId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  tableId: string;
  customerId: string;
  note?: string;
  items: OrderItemRequest[];
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  tableId?: string;
  restaurantId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: string;
  serviceStatus?: string;
  createdBy?: string;
  note?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderRequest {
  tableId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: PaymentStatus;
  serviceStatus?: ServiceStatus;
  note?: string;
}

export interface DishQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
  restaurantId?: string;
  category?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}