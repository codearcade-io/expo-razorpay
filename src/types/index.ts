export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

export interface RazorpayTheme {
  /** Thematic color to modify the appearance of Checkout (e.g., "#3399cc") */
  color?: string;
  /** Link to a backdrop image */
  backdrop_color?: string;
  /** Hides the top bar */
  hide_topbar?: boolean;
}

export interface RazorpayPrefill {
  /** Cardholder or user name */
  name?: string;
  /** User email */
  email?: string;
  /** User phone number in format +(country code)(phone number) */
  contact?: string;
  /** Auto-select method (e.g., "card", "netbanking", "wallet", "emi", "upi") */
  method?: string;
}

export interface RazorpayModal {
  /** Function called when the user closes the checkout modal */
  ondismiss?: () => void;
  /** Keep the modal open after payment failure */
  confirm_close?: boolean;
  /** Custom animation for modal */
  animation?: boolean;
}

export interface RazorpayRetry {
  /** Enable or disable retries */
  enabled: boolean;
  /** Maximum number of retries allowed */
  max_count?: number;
}

export interface RazorpayReadOnly {
  email?: boolean;
  contact?: boolean;
  name?: boolean;
}

export interface RazorpayHidden {
  email?: boolean;
  contact?: boolean;
  name?: boolean;
}

export interface RazorpayConfig {
  display?: {
    blocks?: any;
    sequence?: string[];
    preferences?: any;
    language?: 'en' | 'hi' | 'gu' | 'mr' | 'bn' | 'ta' | 'te';
  };
}

export interface RazorpayOptions {
  /** API Key ID generated from the Dashboard */
  key: string;

  /** Payment amount in the smallest currency subunit (e.g., 50000 for ₹500.00) */
  amount: number | string;

  /** The currency code (e.g., "INR") */
  currency: string;

  /** Your Business/Enterprise name shown on the Checkout form */
  name: string;

  /** Description of the purchase item shown on the Checkout form */
  description?: string;

  /** Link to an image (usually your business logo) or base64 string */
  image?: string;

  /** Order ID generated via Orders API (Required for standard payments) */
  order_id?: string;

  /** Subscription ID (Required for recurring payments) */
  subscription_id?: string;

  /** Handler function for successful payment */
  handler?: (response: RazorpaySuccessResponse) => void;

  /** Object to prefill customer contact information */
  prefill?: RazorpayPrefill;

  /** Set of key-value pairs (max 15) for additional info */
  notes?: Record<string, string>;

  /** Thematic options to modify the appearance */
  theme?: RazorpayTheme;

  /** Modal options */
  modal?: RazorpayModal;

  /** URL to redirect customers to on successful payment */
  callback_url?: string;

  /** Whether to redirect to callback_url (true) or use handler (false) */
  redirect?: boolean;

  /** Unique identifier of customer (for saved cards) */
  customer_id?: string;

  /** Whether to allow saving cards (default: false) */
  remember_customer?: boolean;

  /** Timeout in seconds */
  timeout?: number;

  /** Marks specific fields as read-only */
  readonly?: RazorpayReadOnly;

  /** Hides specific contact details */
  hidden?: RazorpayHidden;

  /** Auto-read OTP for cards/netbanking (Android only) */
  send_sms_hash?: boolean;

  /** Allow rotation of payment page (Android only) */
  allow_rotation?: boolean;

  /** Retry configuration */
  retry?: RazorpayRetry;

  /** Advanced configuration options */
  config?: RazorpayConfig;

  /** Permit customer from changing linked card in subscription */
  subscription_card_change?: boolean;

  /** Accepting recurring payments via emandate/NACH */
  recurring?: boolean;
}

export type RazorpayMessage =
  | { type: 'READY' }
  | { type: 'SUCCESS'; payload: RazorpaySuccessResponse }
  | { type: 'FAILED'; payload: RazorpayErrorResponse }
  | { type: 'DISMISSED' };
