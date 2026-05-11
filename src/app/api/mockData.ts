import { DishResponse, OrderResponse } from '@/types/menuOrder.types';

export const MOCK_DISHES: DishResponse[] = [
  { dishId: 1, name: 'Wild Sea Scallops', category: 'Appetizer', basePrice: 42, available: true },
  { dishId: 2, name: 'Heirloom Burrata', category: 'Appetizer', basePrice: 24, available: true },
  { dishId: 3, name: 'Ahi Tuna Tartare', category: 'Appetizer', basePrice: 28, available: false },
  { dishId: 4, name: 'Wagyu Carpaccio', category: 'Appetizer', basePrice: 32, available: true },
  { dishId: 5, name: 'Lobster Bisque', category: 'Appetizer', basePrice: 19, available: true },
  { dishId: 6, name: 'Dry Aged Ribeye', category: 'Main_Course', basePrice: 88, available: true },
  { dishId: 7, name: 'Sea Bass en Papillote', category: 'Main_Course', basePrice: 56, available: true },
  { dishId: 8, name: 'Truffle Risotto', category: 'Main_Course', basePrice: 44, available: true },
  { dishId: 9, name: 'Cabernet Sauvignon', category: 'Beverage', basePrice: 185, available: true },
  { dishId: 10, name: 'House Sparkling', category: 'Beverage', basePrice: 18, available: true },
  { dishId: 11, name: 'Valrhona Soufflé', category: 'Dessert', basePrice: 22, available: true },
  { dishId: 12, name: 'Seasonal Sorbet', category: 'Dessert', basePrice: 16, available: true },
];

export const MOCK_TABLES = [
  { id: 1, seats: 4 },
  { id: 2, seats: 4 },
  { id: 3, seats: 4 },
  { id: 4, seats: 4 },
  { id: 5, seats: 2 },
  { id: 8, seats: 4 },
  { id: 10, seats: 2 },
  { id: 12, seats: 6 },
];

// Dùng global variable để giữ state trong môi trường dev của Next.js (hot reload)
const globalForMock = globalThis as unknown as {
  mockOrders: OrderResponse[];
  nextOrderId: number;
};

if (!globalForMock.mockOrders) {
  globalForMock.mockOrders = [];
  globalForMock.nextOrderId = 1;
}

export const mockOrdersDb = {
  getOrders: () => globalForMock.mockOrders,
  getOrderById: (id: number) => globalForMock.mockOrders.find(o => o.orderId === id),
  addOrder: (order: OrderResponse) => {
    globalForMock.mockOrders.push(order);
  },
  updateOrder: (id: number, updater: (order: OrderResponse) => void) => {
    const order = globalForMock.mockOrders.find(o => o.orderId === id);
    if (order) {
      updater(order);
    }
    return order;
  },
  getNextId: () => globalForMock.nextOrderId++,
};
