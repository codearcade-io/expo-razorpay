import { useState } from 'react';
import { RazorpayCheckout } from '../components/razorpayCheckout'; // Adjust path as needed
import type {
  RazorpayErrorResponse,
  RazorpayOptions,
  RazorpaySuccessResponse,
} from '../types';

interface CheckoutCallbacks {
  onSuccess: (data: RazorpaySuccessResponse) => void;
  onFailure: (error: RazorpayErrorResponse['error']) => void;
  onClose?: () => void;
}

export const useRazorpay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [checkoutOptions, setCheckoutOptions] =
    useState<RazorpayOptions | null>(null);
  const [callbacks, setCallbacks] = useState<CheckoutCallbacks | null>(null);

  const cleanup = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCallbacks(null);
      setCheckoutOptions(null);
    }, 100);
  };

  const openCheckout = (options: RazorpayOptions, cbs: CheckoutCallbacks) => {
    if (isVisible) return;
    setCheckoutOptions(options);
    setCallbacks(cbs);
    setIsVisible(true);
  };

  const closeCheckout = () => {
    setIsVisible(false);
    if (callbacks?.onClose) {
      callbacks.onClose();
    }
    // Clean up state after animation frame or slight delay to prevent UI flicker
    setTimeout(() => {
      setCallbacks(null);
      setCheckoutOptions(null);
    }, 100);
  };

  const RazorpayUI =
    isVisible && checkoutOptions && callbacks ? (
      <RazorpayCheckout
        options={checkoutOptions}
        onSuccess={(data) => {
          callbacks.onSuccess(data);
          cleanup();
        }}
        onFailure={(error) => {
          callbacks.onFailure(error.error);
          cleanup();
        }}
        onClose={closeCheckout}
      />
    ) : null;

  return { openCheckout, closeCheckout, RazorpayUI, isVisible };
};
