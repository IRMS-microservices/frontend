export interface PaymentCredentialField {
  key: string;
  label?: string;
  type?: 'text' | 'password';
  required?: boolean;
}

export interface PaymentCredentialEntryInput {
  key: string;
  label?: string;
  value?: unknown;
  hashedValue?: string;
}

export interface PaymentCredentialEntryResponse {
  key: string;
  label: string;
  value: unknown;
}

export interface PaymentMethodRequest {
  code: string;
  name: string;
  logo: string;
  isActive?: boolean;
  requiredFields?: PaymentCredentialField[];
}

export interface PaymentCredentialsRequest {
  paymentMethodId: string;
  restaurantId?: string;
  isActive?: boolean;
  credentials: PaymentCredentialEntryInput[] | Record<string, unknown>;
}

export interface UpdatePaymentCredentialsRequest {
  paymentMethodId?: string;
  restaurantId?: string;
  isActive?: boolean;
  credentials?: PaymentCredentialEntryInput[] | Record<string, unknown>;
}

export interface PaymentGatewayRequest {
  orderId: string;
  amount: number;
  description: string;
  returnUrl?: string;
  cancelUrl?: string;
  appUser?: string;
  item?: unknown;
  items?: unknown;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentOrderRequest extends PaymentGatewayRequest {
  paymentMethodId: string;
  restaurantId: string;
}

export interface PaymentMethodResponse {
  _id: string;
  code: string;
  name: string;
  logo: string;
  isActive: boolean;
  requiredFields: PaymentCredentialField[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentCredentialsResponse {
  _id: string;
  paymentMethodId: string;
  restaurantId: string;
  isActive: boolean;
  credentials: PaymentCredentialEntryResponse[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentGatewayResponse {
  success: boolean;
  paymentUrl?: string;
  qrCode?: string;
  transactionId?: string;
  rawResponse: unknown;
}

export interface PaymentCredentialsQuery {
  paymentMethodId?: string;
  restaurantId?: string;
  isActive?: boolean;
}
