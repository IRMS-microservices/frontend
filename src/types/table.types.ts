export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'DIRTY' | 'WAITING';

export interface TableResponse {
  _id: string;
  tableNumber: number;
  status: TableStatus;
  capacity: number;
  currentGuestsNumber?: number;
  restaurantId: string;
}

export interface CreateTableRequest {
  tableNumber: number | string;
  capacity: number;
  status?: TableStatus;
  restaurantId?: string;
}

export interface UpdateTableRequest {
  tableNumber?: number | string;
  capacity?: number;
  status?: TableStatus;
}

export interface TableQuery {
  tableNumber?: number | string;
  status?: TableStatus;
  minCapacity?: number;
  maxCapacity?: number;
  restaurantId?: string;
  page?: number;
  limit?: number;
}

export interface AssignTableRequest {
  customerId?: number;
  guestsNumber: number;
  name?: string;
  phone?: string;
  gender?: string;
}

export interface UpdateTableStatusRequest {
  status: TableStatus;
}
