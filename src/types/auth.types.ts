export interface AuthResponse {
  accessToken: string;
  role: string;
  fullName: string;
}

export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  username?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  restaurantName?: string;
  restaurantId?: string;
}

export interface VerifyRestaurantPinRequest {
  pin: string | number;
}

export interface CredentialAccessTokenResponse {
  accessToken: string;
  expiresInSeconds: number;
}
