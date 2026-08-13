import { PaymentAdapterProps } from "./PaymentAdapterRegistry";

export const CashAdapterUI: React.FC<PaymentAdapterProps> = ({ order, onSuccess, onCancel }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-irms-text-primary">Cash Payment</h3>
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      </div>
      <p className="text-irms-text-muted mb-6 text-center">
        Please collect cash from the customer.
      </p>
      
      <div className="flex gap-4 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-irms-bg-secondary hover:bg-irms-bg-secondary-dark text-irms-text-primary font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSuccess}
          className="flex-1 py-3 rounded-xl bg-irms-green hover:bg-irms-green-dark text-white font-semibold transition-colors"
        >
          Confirm Received
        </button>
      </div>
    </div>
  );
};
