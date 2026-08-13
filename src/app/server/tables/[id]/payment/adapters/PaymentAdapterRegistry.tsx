import { JSX } from "react";
import { OrderResponse } from "@/types/menuOrder.types";
import { DefaultAdapterUI } from "./DefaultAdapterUI";
import { ZaloPayAdapterUI } from "./ZaloPayAdapterUI";
import { CashAdapterUI } from "./CashAdapterUI";

export interface PaymentAdapterProps {
  order: OrderResponse;
  paymentMethodId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const REGISTRY: Record<string, React.FC<PaymentAdapterProps>> = {
  ZALOPAY: ZaloPayAdapterUI,
  CASH: CashAdapterUI,
};

export const getPaymentAdapterUI = (code: string): React.FC<PaymentAdapterProps> => {
  const normalizedCode = code.trim().toUpperCase();
  return REGISTRY[normalizedCode] || DefaultAdapterUI;
};
