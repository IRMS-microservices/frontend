export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY',
  WAITING = 'WAITING',
}

export interface TableResponse {
  id: string;
  tableNumber: number;
  status: TableStatus;
  capacity: number;
  currentGuestsNumber?: number;
  restaurantId: string;
}

export interface CreateTableRequest {
  tableNumber: number;
  capacity: number;
  status?: TableStatus;
  restaurantId?: string;
}

export interface UpdateTableRequest {
  tableNumber?: number | string;
  capacity?: number;
  status?: TableStatus;
  currentGuestsNumber?: number;
  customerId?: string;
}

export interface TableQuery {
  tableNumber?: number;
  status?: TableStatus;
  minCapacity?: number;
  maxCapacity?: number;
  restaurantId?: string;
  page?: number;
  limit?: number;
}

export interface AssignTableRequest {
  customerId?: string;
  guestsNumber: number;
  name?: string;
  phone?: string;
  gender?: string;
}

export interface UpdateTableStatusRequest {
  status: TableStatus;
}
