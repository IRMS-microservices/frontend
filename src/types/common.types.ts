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
