import { useEffect, useState } from "react";
import { PaymentAdapterProps } from "./PaymentAdapterRegistry";

export const DefaultAdapterUI: React.FC<PaymentAdapterProps> = ({ order, onSuccess, onCancel }) => {
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // TODO: Add logic for polling payment status here
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
      <h3 className="text-xl font-bold mb-4 text-irms-text-primary">Process Payment</h3>
      <p className="text-irms-text-muted mb-6 text-center">
        Please follow the instructions on the payment terminal or device.
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
          className="flex-1 py-3 rounded-xl bg-irms-green hover:bg-irms-green-dark text-white font-semibold transition-colors"
        >
          Simulate Success
        </button>
      </div>
    </div>
  );
};
