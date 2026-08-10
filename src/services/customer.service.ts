import apiClient from './apiClient';
import { ApiResponse, Pagination } from '../types/common.types';
import { CustomerRequest, CustomerResponse, CustomerQuery } from '@/types/customer.types';

export const CustomerService = {
  /**
   * GET /api/customers
   * Query customer records (ADMIN, SERVER).
   * Supports: name, phoneNumber, gender, page, limit
   */
  getAllCustomers: async (query?: CustomerQuery): Promise<ApiResponse<Pagination<CustomerResponse[]>>> => {
    const response = await apiClient.get<ApiResponse<Pagination<CustomerResponse[]>>>('/api/customers', { params: query });
    return response.data;
  },

  /**
   * GET /api/customers/{id}
   * Get customer details (ADMIN, SERVER).
   */
  getCustomerById: async (id: string): Promise<ApiResponse<CustomerResponse>> => {
    const response = await apiClient.get<ApiResponse<CustomerResponse>>(`/api/customers/${id}`);
    return response.data;
  },

  /**
   * POST /api/customers
   * Create a customer profile (ADMIN, SERVER).
   * Body: { name, phoneNumber, gender }
   */
  createCustomer: async (request: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    const response = await apiClient.post<ApiResponse<CustomerResponse>>('/api/customers', request);
    return response.data;
  },

  /**
   * PUT /api/customers/{id}
   * Update a customer profile (ADMIN, SERVER).
   */
  updateCustomer: async (id: string, request: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    const response = await apiClient.put<ApiResponse<CustomerResponse>>(`/api/customers/${id}`, request);
    return response.data;
  },

  /**
   * DELETE /api/customers/{id}
   * Delete a customer profile (ADMIN only).
   */
  deleteCustomer: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/customers/${id}`);
    return response.data;
  },
};
