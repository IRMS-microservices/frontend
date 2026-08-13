import { useEffect, useState } from "react";
import { PaymentAdapterProps } from "./PaymentAdapterRegistry";

export const ZaloPayAdapterUI: React.FC<PaymentAdapterProps> = ({ order, onSuccess, onCancel }) => {
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // TODO: Add logic for polling payment status here for ZaloPay
    // Leave it blank at the moment so status query API can be called later
    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(() => {
        // Poll status...
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, order]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-[#0068ff]">ZaloPay QR Code</h3>
      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
        {/* Placeholder for actual QR code */}
        <span className="text-gray-400">QR Code Scanner</span>
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
