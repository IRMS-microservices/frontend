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
}

/** Aggregated data collected across all steps of the registration wizard. */
export interface WorkspaceRegisterData {
  fullName: string;
  username: string;
  phoneNumber: string;
  password: string;
  restaurantName: string;
}

export interface VerifyRestaurantPinRequest {
  pin: string | number;
}

export interface CredentialAccessTokenResponse {
  accessToken: string;
  expiresInSeconds: number;
}
