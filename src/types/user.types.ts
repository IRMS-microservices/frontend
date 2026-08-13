export enum UserRole {
  SERVER = 'SERVER',
  ADMIN = 'ADMIN',
  KITCHEN = 'KITCHEN',
  SYSADMIN = 'SYSADMIN'
}

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
  role: UserRole;
  phoneNumber: string;
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  role?: UserRole;
  password?: string;
}

export interface UserListQuery {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
  restaurantId?: string;
}
