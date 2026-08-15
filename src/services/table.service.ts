import apiClient from "./apiClient";
import { ApiResponse } from "@/types/common.types";

import {
  TableResponse,
  CreateTableRequest,
  UpdateTableRequest,
  TableQuery
} from '../types/table.types';

export const TableService = {
  /**
   * GET /api/tables
   * Query floor table status (SERVER, ADMIN).
   * Supports: tableNumber, status, minCapacity, maxCapacity, page, limit
   */
  getTables: async (query?: TableQuery): Promise<ApiResponse<TableResponse[]>> => {
    const response = await apiClient.get<ApiResponse<TableResponse[]>>("/api/tables", {
      params: query,
    });
    return response.data;
  },

  /**
   * GET /api/tables/{id}
   * Get a single table by ID (SERVER, ADMIN).
   */
  getTable: async (tableId: string): Promise<ApiResponse<TableResponse>> => {
    const response = await apiClient.get<ApiResponse<TableResponse>>(`/api/tables/${tableId}`);
    return response.data;
  },

  /**
   * POST /api/tables
   * Register a new table (SERVER, ADMIN).
   */
  createTable: async (request: CreateTableRequest): Promise<ApiResponse<TableResponse>> => {
    const response = await apiClient.post<ApiResponse<TableResponse>>("/api/tables", request);
    return response.data;
  },

  /**
   * PUT /api/tables/{id}
   * Update a table's details or status (SERVER, ADMIN).
   */
  updateTable: async (
    tableId: string,
    request: UpdateTableRequest
  ): Promise<ApiResponse<TableResponse>> => {
    const response = await apiClient.put<ApiResponse<TableResponse>>(
      `/api/tables/${tableId}`,
      request
    );
    return response.data;
  },

  /**
   * DELETE /api/tables/{id}
   * Remove a table (SERVER, ADMIN).
   */
  deleteTable: async (tableId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/tables/${tableId}`);
    return response.data;
  },
};
