import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import {
  CreatePaymentOrderRequest,
  PaymentCredentialsQuery,
  PaymentCredentialsRequest,
  PaymentCredentialsResponse,
  PaymentGatewayResponse,
  PaymentGatewayQueryResponse,
  PaymentMethodRequest,
  PaymentMethodResponse,
  QueryPaymentOrderRequest,
  UpdatePaymentCredentialsRequest,
} from '../types/payment.types';

const credentialAccessHeaders = (credentialToken: string) => ({
  headers: {
    'x-credential-token': credentialToken,
  },
});

export const PaymentService = {
  /**
   * GET /api/payments/methods
   */
  getPaymentMethods: async (): Promise<ApiResponse<PaymentMethodResponse[]>> => {
    const response = await apiClient.get<ApiResponse<PaymentMethodResponse[]>>('/api/payments/methods');
    return response.data;
  },

  /**
   * GET /api/payments/methods/{id}
   */
  getPaymentMethodById: async (id: string): Promise<ApiResponse<PaymentMethodResponse>> => {
    const response = await apiClient.get<ApiResponse<PaymentMethodResponse>>(`/api/payments/methods/${id}`);
    return response.data;
  },

  /**
   * POST /api/payments/methods
   */
  createPaymentMethod: async (request: PaymentMethodRequest): Promise<ApiResponse<PaymentMethodResponse>> => {
    const response = await apiClient.post<ApiResponse<PaymentMethodResponse>>('/api/payments/methods', request);
    return response.data;
  },

  /**
   * PUT /api/payments/methods/{id}
   */
  updatePaymentMethod: async (
    id: string,
    request: Partial<PaymentMethodRequest>,
  ): Promise<ApiResponse<PaymentMethodResponse>> => {
    const response = await apiClient.put<ApiResponse<PaymentMethodResponse>>(`/api/payments/methods/${id}`, request);
    return response.data;
  },

  /**
   * DELETE /api/payments/methods/{id}
   */
  deletePaymentMethod: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/payments/methods/${id}`);
    return response.data;
  },

  /**
   * GET /api/payments/credentials
   */
  getPaymentCredentials: async (
    query?: PaymentCredentialsQuery,
  ): Promise<ApiResponse<PaymentCredentialsResponse[]>> => {
    const response = await apiClient.get<ApiResponse<PaymentCredentialsResponse[]>>('/api/payments/credentials', {
      params: query,
    });
    return response.data;
  },

  /**
   * POST /api/payments/credentials
   */
  createPaymentCredentials: async (
    request: PaymentCredentialsRequest,
  ): Promise<ApiResponse<PaymentCredentialsResponse>> => {
    const response = await apiClient.post<ApiResponse<PaymentCredentialsResponse>>('/api/payments/credentials', request);
    return response.data;
  },

  /**
   * GET /api/payments/credentials/access
   */
  getPaymentCredentialsWithAccess: async (
    credentialToken: string,
    query?: Omit<PaymentCredentialsQuery, 'restaurantId'>,
  ): Promise<ApiResponse<PaymentCredentialsResponse[]>> => {
    const response = await apiClient.get<ApiResponse<PaymentCredentialsResponse[]>>('/api/payments/credentials/access', {
      params: query,
      ...credentialAccessHeaders(credentialToken),
    });
    return response.data;
  },

  /**
   * GET /api/payments/credentials/{id}
   */
  getPaymentCredentialsById: async (id: string): Promise<ApiResponse<PaymentCredentialsResponse>> => {
    const response = await apiClient.get<ApiResponse<PaymentCredentialsResponse>>(`/api/payments/credentials/${id}`);
    return response.data;
  },

  /**
   * GET /api/payments/credentials/access/{id}
   */
  getPaymentCredentialsByIdWithAccess: async (
    id: string,
    credentialToken: string,
  ): Promise<ApiResponse<PaymentCredentialsResponse>> => {
    const response = await apiClient.get<ApiResponse<PaymentCredentialsResponse>>(`/api/payments/credentials/access/${id}`, {
      ...credentialAccessHeaders(credentialToken),
    });
    return response.data;
  },

  /**
   * PUT /api/payments/credentials/{id}
   */
  updatePaymentCredentials: async (
    id: string,
    request: UpdatePaymentCredentialsRequest,
  ): Promise<ApiResponse<PaymentCredentialsResponse>> => {
    const response = await apiClient.put<ApiResponse<PaymentCredentialsResponse>>(`/api/payments/credentials/${id}`, request);
    return response.data;
  },

  /**
   * PUT /api/payments/credentials/access/{id}
   */
  updatePaymentCredentialsWithAccess: async (
    id: string,
    credentialToken: string,
    request: UpdatePaymentCredentialsRequest,
  ): Promise<ApiResponse<PaymentCredentialsResponse>> => {
    const response = await apiClient.put<ApiResponse<PaymentCredentialsResponse>>(`/api/payments/credentials/access/${id}`, request, {
      ...credentialAccessHeaders(credentialToken),
    });
    return response.data;
  },

  /**
   * DELETE /api/payments/credentials/{id}
   */
  deletePaymentCredentials: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/payments/credentials/${id}`);
    return response.data;
  },

  /**
   * POST /api/payments/credentials/access/revoke
   */
  revokePaymentCredentialsAccess: async (credentialToken: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/payments/credentials/access/revoke', undefined, {
      ...credentialAccessHeaders(credentialToken),
    });
    return response.data;
  },

  /**
   * POST /api/payments/create-order
   */
  createPaymentOrder: async (request: CreatePaymentOrderRequest): Promise<ApiResponse<PaymentGatewayResponse>> => {
    const response = await apiClient.post<ApiResponse<PaymentGatewayResponse>>('/api/payments/create-order', request);
    return response.data;
  },

  /**
   * POST /api/payments/query-order
   */
  queryPaymentOrder: async (request: QueryPaymentOrderRequest): Promise<ApiResponse<PaymentGatewayQueryResponse>> => {
    const response = await apiClient.post<ApiResponse<PaymentGatewayQueryResponse>>('/api/payments/query-order', request);
    return response.data;
  },
};
