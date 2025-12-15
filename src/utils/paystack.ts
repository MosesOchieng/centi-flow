// Paystack Payment Integration

export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // in kobo (Nigerian Naira)
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  status: string;
  message: string;
  reference: string;
  trans: string;
  transaction: string;
  trxref: string;
  redirecturl?: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

// Initialize Paystack
export function initializePaystack(publicKey: string): void {
  if (typeof window !== 'undefined' && !window.PaystackPop) {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
  }
}

// Process payment with Paystack
export function payWithPaystack(config: PaystackConfig): Promise<PaystackResponse> {
  return new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      reject(new Error('Paystack not loaded. Please wait and try again.'));
      return;
    }

    const handler = window.PaystackPop.setup({
      ...config,
      callback: (response: PaystackResponse) => {
        if (config.callback) {
          config.callback(response);
        }
        resolve(response);
      },
      onClose: () => {
        if (config.onClose) {
          config.onClose();
        }
        reject(new Error('Payment cancelled by user'));
      },
    });

    handler.openIframe();
  });
}

// Convert Centi to Naira (example: 1 Centi = 10 Naira)
export function centiToNaira(centi: number): number {
  return centi * 10; // Adjust conversion rate as needed
}

// Convert Naira to Kobo (Paystack uses kobo)
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

// Format amount for display
export function formatAmount(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

