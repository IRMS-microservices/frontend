import apiClient from './apiClient';
import { ApiResponse } from '../types/common.types';
import { CustomerRequest, CustomerResponse } from '@/types/customer.types';

export const CustomerService = {
  /**
   * Get all customers
   */
  getAllCustomers: async (): Promise<ApiResponse<CustomerResponse[]>> => {
    const response = await apiClient.get<ApiResponse<CustomerResponse[]>>('/customers');
    return response.data;
  },

  getCustomerById: async (id: number): Promise<ApiResponse<CustomerResponse>> => {
    const response = await apiClient.get<ApiResponse<CustomerResponse>>(`/customers/${id}`);
    return response.data;
  },

  /**
   * Create a customer
   */
  createCustomer: async (request: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    const response = await apiClient.post<ApiResponse<CustomerResponse>>('/customers', request);
    return response.data;
  },

  /**
   * Update a customer
   */
  updateCustomer: async (id: number, request: CustomerRequest): Promise<ApiResponse<CustomerResponse>> => {
    const response = await apiClient.put<ApiResponse<CustomerResponse>>(`/customers/${id}`, request);
    return response.data;
  },

  /**
   * Delete a customer
   */
  deleteCustomer: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/customers/${id}`);
    return response.data;
  }
};
