import apiClient from "./apiClient";
import { ApiResponse } from "@/types/common.types";
import {
  TableResponse,
  TableStatus,
  AssignTableRequest,
  UpdateTableStatusRequest,
} from "@/types/table.types";

/**
 * Helper to wrap raw data into ApiResponse format for consistency with other services.
 */
const wrapInApiResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  success: true,
  message: "Success",
  timestamp: new Date().toISOString(),
});

export const TableService = {
  /**
   * Get all tables
   */
  getTables: async (
    status?: TableStatus,
  ): Promise<ApiResponse<TableResponse[]>> => {
    const params = { status };
    const response = await apiClient.get<TableResponse[]>("/tables", {
      params,
    });
    return wrapInApiResponse(response.data);
  },

  /**
   * Get table details
   */
  getTable: async (tableId: number): Promise<ApiResponse<TableResponse>> => {
    const response = await apiClient.get<TableResponse>(`/tables/${tableId}`);
    return wrapInApiResponse(response.data);
  },

  /**
   * Assign customers to a table
   */
  assignTable: async (
    tableId: number,
    request: AssignTableRequest,
  ): Promise<ApiResponse<TableResponse>> => {
    const response = await apiClient.post<TableResponse>(
      `/tables/${tableId}/assign`,
      request,
    );
    return wrapInApiResponse(response.data);
  },

  /**
   * Update table status
   */
  updateTableStatus: async (
    tableId: number,
    status: TableStatus,
  ): Promise<ApiResponse<TableResponse>> => {
    const request: UpdateTableStatusRequest = { status };
    const response = await apiClient.patch<TableResponse>(
      `/tables/${tableId}/status`,
      request,
    );
    return wrapInApiResponse(response.data);
  },
};
