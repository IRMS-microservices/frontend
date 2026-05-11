export interface CustomerResponse {
    customerId: number;
    name: string;
    gender: string;
    phone: string;
}

export interface CustomerRequest {
    name: string;
    gender: string;
    phone: string;
}