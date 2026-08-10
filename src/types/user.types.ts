export interface UserResponse {
  _id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  restaurantId: string;
  active: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  role: 'SERVER' | 'ADMIN' | 'KITCHEN';
  phoneNumber: string;
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  role?: 'SERVER' | 'ADMIN' | 'KITCHEN';
  password?: string;
}

export interface UserListQuery {
  role?: 'SERVER' | 'ADMIN' | 'KITCHEN';
  search?: string;
  page?: number;
  limit?: number;
  restaurantId?: string;
}
