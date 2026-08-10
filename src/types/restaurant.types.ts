export interface RestaurantResponse {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantQuery {
  ownerId?: string;
  search?: string;
}

export interface CreateRestaurantRequest {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateRestaurantRequest {
  name?: string;
  address?: string;
  phone?: string;
}
