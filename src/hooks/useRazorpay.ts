import { useCallback } from 'react';
import { toast } from 'sonner';

export const useRazorpay = () => {
  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  const openCheckout = useCallback(async (options: any) => {
    const res = await loadScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      toast.error(response.error.description || 'Payment failed');
    });
    rzp.open();
  }, [loadScript]);

  return { openCheckout };
};
