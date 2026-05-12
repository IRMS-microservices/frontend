export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: any;
}

export interface ErrorDetails {
  errorCode?: string;
  errorType?: string;
  validationErrors?: ValidationError[];
  debugInfo?: Record<string, any>;
  stackTrace?: string;
}

export interface ApiResponse<T = any> {
  timestamp: string;
  success: boolean;
  message: string;
  data: T;
  error?: ErrorDetails;
}

export enum SocketEvent {
  KITCHEN_ORDER_STATUS_CHANGED = "KITCHEN_ORDER_STATUS_CHANGED",
  KITCHEN_ORDER_ITEM_STATUS_CHANGED = "KITCHEN_ORDER_ITEM_STATUS_CHANGED",
  KITCHEN_ORDER_CREATED = "KITCHEN_ORDER_CREATED",
  ORDER_SERVICE_STATUS_CHANGED = "ORDER_SERVICE_STATUS_CHANGED",
}
