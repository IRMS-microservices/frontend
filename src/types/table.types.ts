export enum TableStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  DIRTY = "Dirty",
  WAITING = "Waiting",
}

export interface TableResponse {
  tableId: number;
  tableNumber: string;
  status: TableStatus;
  capacity: number;
  currentGuestsNumber: number;
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
