export interface CustomerResponse {
  _id: string;
  name: string;
  gender: string;
  phone: string;
}

export interface CustomerRequest {
  name: string;
  gender: string;
  phone: string;
}

export interface CustomerQuery {
  name?: string;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE';
  page?: number;
  limit?: number;
}