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
  restaurantId?: string;
}

/** Aggregated data collected across all steps of the registration wizard. */
export interface WorkspaceRegisterData {
  // Step 1 - Admin Identity
  fullName: string;
  username: string;
  phoneNumber: string;
  password: string;
  // Step 2 - Workspace / Restaurant Info
  restaurantName: string;
  businessType: string;
}

export interface VerifyRestaurantPinRequest {
  pin: string | number;
}

export interface CredentialAccessTokenResponse {
  accessToken: string;
  expiresInSeconds: number;
}
