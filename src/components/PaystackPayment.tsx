import { useState, useEffect } from 'react';
import { payWithPaystack, initializePaystack, centiToNaira, nairaToKobo, formatAmount } from '@/utils/paystack';
import './PaystackPayment.css';

interface PaystackPaymentProps {
  amount: number; // in Centi
  email: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  description?: string;
}

export default function PaystackPayment({
  amount,
  email,
  onSuccess,
  onCancel,
  description = 'Centi Top-up'
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Paystack on component mount
  useEffect(() => {
    // Replace with your Paystack public key
    const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here';
    initializePaystack(PAYSTACK_PUBLIC_KEY);
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const nairaAmount = centiToNaira(amount);
      const koboAmount = nairaToKobo(nairaAmount);
      const reference = `centi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await payWithPaystack({
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here',
        email,
        amount: koboAmount,
        reference,
        metadata: {
          custom_fields: [
            {
              display_name: 'Centi Amount',
              variable_name: 'centi_amount',
              value: amount
            }
          ]
        },
        callback: (response) => {
          setLoading(false);
          onSuccess(response.reference);
        },
        onClose: () => {
          setLoading(false);
          onCancel();
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    }
  };

  const nairaAmount = centiToNaira(amount);

  return (
    <div className="paystack-payment">
      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <div className="payment-details">
          <div className="payment-row">
            <span>Amount (Centi):</span>
            <span className="payment-value">{amount} Centi</span>
          </div>
          <div className="payment-row">
            <span>Amount (Naira):</span>
            <span className="payment-value">{formatAmount(nairaAmount)}</span>
          </div>
          <div className="payment-row">
            <span>Description:</span>
            <span className="payment-value">{description}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}

      <div className="payment-actions">
        <button
          className="btn-paystack"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            <>
              <span className="paystack-icon">💳</span>
              Pay with Paystack
            </>
          )}
        </button>
        <button
          className="btn-cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>

      <div className="payment-info">
        <p>Secure payment powered by Paystack</p>
      </div>
    </div>
  );
}

