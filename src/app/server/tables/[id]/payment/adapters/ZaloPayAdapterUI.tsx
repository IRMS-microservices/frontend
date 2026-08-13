import { useEffect, useState } from "react";
import { PaymentAdapterProps } from "./PaymentAdapterRegistry";
import { PaymentService } from "@/services/payment.service";
import { QRCodeSVG } from "qrcode.react";

export const ZaloPayAdapterUI: React.FC<PaymentAdapterProps> = ({ order, paymentMethodId, onSuccess, onCancel }) => {
  const [isPolling, setIsPolling] = useState(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createOrder = async () => {
      try {
        const amount = order.items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
        // Add service charge and tax
        const serviceCharge = amount * 0.18;
        const tax = amount * 0.08;
        const grandTotal = amount + serviceCharge + tax;

        const res = await PaymentService.createPaymentOrder({
          orderId: order._id.toString(),
          amount: grandTotal,
          description: `Thanh toan don hang #${order._id}`,
          paymentMethodId,
          restaurantId: order.restaurantId,
        });

        if (res.success && res.data?.paymentUrl) {
          setQrCodeUrl(res.data.paymentUrl);
          if (res.data.transactionId) {
            setTransactionId(res.data.transactionId);
          }
        } else {
          setError(res.data?.rawResponse?.toString() || "Failed to create ZaloPay order");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    createOrder();
  }, [order, paymentMethodId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && transactionId) {
      interval = setInterval(async () => {
        try {
          const res = await PaymentService.queryPaymentOrder({
            transactionId,
            paymentMethodId,
            restaurantId: order.restaurantId,
          });

          if (res.success && res.data) {
            if (res.data.isPaid) {
              setIsPolling(false);
              onSuccess();
            } else if (!res.data.isProcessing && !res.data.isPaid) {
              // Not processing and not paid implies failure
              setIsPolling(false);
              setError("Payment failed or was cancelled.");
            }
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, transactionId, order, paymentMethodId, onSuccess]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-[#0068ff]">ZaloPay QR Code</h3>
      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
        {loading ? (
          <span className="text-gray-400">Loading QR...</span>
        ) : error ? (
          <span className="text-red-500 text-sm text-center px-4">{error}</span>
        ) : qrCodeUrl ? (
          <QRCodeSVG value={qrCodeUrl} size={192} />
        ) : (
          <span className="text-gray-400">QR Code Scanner</span>
        )}
      </div>
      <p className="text-irms-text-muted mb-6 text-center text-sm">
        Scan this QR code with your ZaloPay app to complete the payment.
      </p>
      
      <div className="flex gap-4 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-irms-bg-secondary hover:bg-irms-bg-secondary-dark text-irms-text-primary font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setIsPolling(false);
            onSuccess();
          }}
          className="flex-1 py-3 rounded-xl bg-[#0068ff] hover:bg-blue-700 text-white font-semibold transition-colors"
        >
          Simulate Success
        </button>
      </div>
    </div>
  );
};
