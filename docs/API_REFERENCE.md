# API Reference - @codearcade/expo-razorpay

Complete TypeScript-style API reference for the `@codearcade/expo-razorpay` library.

---

## `useRazorpay()` Hook

The main hook for managing Razorpay checkout.

### Signature

```typescript
function useRazorpay(): {
  openCheckout: (
    options: RazorpayOptions,
    callbacks: RazorpayCallbacks
  ) => void;
  closeCheckout: () => void;
  RazorpayUI: JSX.Element | null;
  isVisible: boolean;
};
```

### Parameters

None. This hook doesn't take any parameters.

### Return Object

#### `openCheckout(options, callbacks)`

Opens the Razorpay checkout modal with the specified options and callbacks.

**Signature:**

```typescript
(options: RazorpayOptions, callbacks: RazorpayCallbacks) => void
```

**Parameters:**

- `options` (RazorpayOptions) - Configuration for the checkout
- `callbacks` (RazorpayCallbacks) - Success, failure, and optional close handlers

**Example:**

```tsx
openCheckout(
  {
    key: 'rzp_test_1234567890abcdef',
    amount: 50000,
    currency: 'INR',
    order_id: 'order_9876543210fedcba',
  },
  {
    onSuccess: (data) => console.log(data),
    onFailure: (error) => console.log(error),
  }
);
```

**Behavior:**

- Sets `isVisible` to `true`
- Shows the RazorpayUI modal
- Ignores call if checkout already open (throttled)
- If called with `undefined` options, throws error

---

#### `closeCheckout()`

Closes the Razorpay checkout modal programmatically.

**Signature:**

```typescript
() => void
```

**Example:**

```tsx
const { closeCheckout, openCheckout } = useRazorpay();

openCheckout(options, {
  onSuccess: (data) => {
    console.log('Payment successful!');
    closeCheckout(); // Close after success
  },
});
```

**Behavior:**

- Sets `isVisible` to `false`
- Hides the modal
- Triggers `onClose` callback if defined
- Cleans up internal state after 100ms delay

**Note:** Most of the time, you don't need to call this manually - it's called automatically after payment succeeds/fails.

---

#### `RazorpayUI`

The JSX component that renders the checkout modal.

**Type:**

```typescript
JSX.Element | null;
```

**Requirements:**

- **MUST be rendered** in your component's JSX
- Should be at the top level of your component (not deep inside nested components)
- Can be conditionally rendered with an expression

**Examples:**

✅ Correct:

```tsx
const { openCheckout, RazorpayUI } = useRazorpay();

return (
  <View>
    <Button onPress={() => openCheckout(...)} />
    {RazorpayUI}  {/* ✅ Rendered at top level */}
  </View>
);
```

✅ Also correct:

```tsx
return (
  <View>
    <Header />
    <Content />
    {RazorpayUI} {/* ✅ Can be anywhere in JSX */}
  </View>
);
```

❌ Wrong:

```tsx
const { openCheckout, RazorpayUI } = useRazorpay();
return <Button onPress={() => openCheckout(...)} />;
// ❌ RazorpayUI not rendered - checkout won't appear!
```

**Special Notes:**

- When `isVisible` is false, `RazorpayUI` is `null`
- Rendering `null` is safe (nothing appears)
- Always render it, even if conditional

---

#### `isVisible`

Boolean flag indicating whether the checkout modal is currently visible.

**Type:**

```typescript
boolean;
```

**Example:**

```tsx
const { isVisible } = useRazorpay();

return (
  <>
    <Button
      title="Pay Now"
      disabled={isVisible} // Disable while checkout open
    />
  </>
);
```

**Use Cases:**

- Disable other buttons while checkout is open
- Show loading indicator
- Track payment UI state in analytics
- Prevent double-clicks

---

## Objects & Types

### `RazorpayOptions`

Configuration object for Razorpay checkout.

```typescript
interface RazorpayOptions {
  // Required fields
  key: string; // Your API Key
  amount: number; // In lowest denomination (paise for INR)
  currency: string; // Currency code (e.g., "INR")

  // At least one of these is required
  order_id?: string; // Order ID from backend
  subscription_id?: string; // Subscription ID for recurring

  // Optional fields
  name?: string; // Your brand name
  description?: string; // Transaction description
  image?: string; // Logo URL
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string | number>; // Custom key-value pairs
  theme?: {
    color?: string; // Hex color code
  };
}
```

#### Fields Reference

| Field             | Type   | Required                            | Default | Description                                            |
| ----------------- | ------ | ----------------------------------- | ------- | ------------------------------------------------------ |
| `key`             | string | ✅ Yes                              | -       | Your Razorpay Key ID (from dashboard)                  |
| `amount`          | number | ✅ Yes                              | -       | Amount in lowest currency unit. For INR: 100 = 1 rupee |
| `currency`        | string | ✅ Yes                              | -       | Currency code: "INR", "USD", etc.                      |
| `order_id`        | string | ⚠️ Either this or `subscription_id` | -       | Order ID created on your backend                       |
| `subscription_id` | string | ⚠️ Either this or `order_id`        | -       | For recurring payments                                 |
| `name`            | string | No                                  | -       | Your company/app name shown in checkout                |
| `description`     | string | No                                  | -       | What the payment is for                                |
| `image`           | string | No                                  | -       | URL to your logo (recommended: 120x120px)              |
| `prefill.name`    | string | No                                  | -       | Pre-fill customer name                                 |
| `prefill.email`   | string | No                                  | -       | Pre-fill customer email                                |
| `prefill.contact` | string | No                                  | -       | Pre-fill phone number                                  |
| `notes`           | object | No                                  | {}      | Custom data (key-value pairs)                          |
| `theme.color`     | string | No                                  | -       | Hexadecimal color for UI elements                      |

#### Validation Rules

- `amount` must be > 0
- `amount` must be integer (paise)
- `currency` must be valid (usually "INR")
- Either `order_id` OR `subscription_id` must be provided
- `key` cannot be empty
- If `prefill.contact` is provided, must be numeric string

#### Example

```tsx
const options: RazorpayOptions = {
  key: 'rzp_test_1234567890abcdef',
  amount: 99900, // 999 rupees
  currency: 'INR',
  order_id: 'order_5f8a4c2b1e9d7a3f',
  name: 'Acme Store',
  description: 'Premium Subscription',
  image: 'https://example.com/logo.png',
  prefill: {
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    contact: '9876543210',
  },
  notes: {
    order_number: '12345',
    customer_id: 'cust_9876',
  },
  theme: {
    color: '#2f55d4',
  },
};
```

---

### `RazorpayCallbacks`

Callbacks for payment result handling.

```typescript
interface RazorpayCallbacks {
  onSuccess: (data: RazorpaySuccessResponse) => void;
  onFailure: (error: RazorpayErrorResponse) => void;
  onClose?: () => void; // Optional
}
```

#### `onSuccess` Callback

Called when payment is successful.

```typescript
onSuccess: (data: RazorpaySuccessResponse) => void
```

**Parameters:**

```typescript
interface RazorpaySuccessResponse {
  razorpay_payment_id: string; // Payment ID
  razorpay_order_id: string; // Order ID
  razorpay_signature: string; // For verification on server
}
```

**Example:**

```tsx
onSuccess: (data) => {
  console.log('Payment ID:', data.razorpay_payment_id);
  console.log('Order ID:', data.razorpay_order_id);
  console.log('Signature:', data.razorpay_signature);

  // Always verify on server!
  verifyOnServer(data);
};
```

**Important:** Always verify the signature on your backend before marking the payment as successful.

---

#### `onFailure` Callback

Called when payment fails.

```typescript
onFailure: (error: RazorpayErrorResponse) => void
```

**Parameters:**

```typescript
interface RazorpayErrorResponse {
  error: {
    code: string; // Error code
    source: string; // "api" | "gateway" | ...
    reason: string; // Detailed reason
    step: string; // Step where it failed
    description: string; // Human-readable message
  };
}
```

**Example Error Codes:**

| Code               | Meaning                 | Action                                |
| ------------------ | ----------------------- | ------------------------------------- |
| `CANCELLED`        | User cancelled          | Don't show error (may be intentional) |
| `GATEWAY_ERROR`    | Payment gateway error   | Show error, suggest retry             |
| `BAD_REQUEST`      | Invalid parameters      | Fix order details, contact support    |
| `VALIDATION_ERROR` | Input validation failed | Show field errors                     |
| `NETWORK_ERROR`    | Network issue           | Suggest retry                         |

**Example:**

```tsx
onFailure: (error) => {
  const { code, description, reason } = error.error;

  if (code === 'CANCELLED') {
    console.log('User cancelled payment');
    return;
  }

  console.error('Payment failed:', description);
  Alert.alert('Payment Failed', description);
};
```

---

#### `onClose` Callback (Optional)

Called when user closes the checkout modal (clicks X button).

```typescript
onClose?: () => void
```

**Note:** This is different from `onFailure`. User may close the modal:

- Before attempting payment
- After payment (checkout auto-closes sometimes)
- Due to network issues

**Example:**

```tsx
onClose: () => {
  console.log('Checkout was closed');
  // Maybe show a "Payment Cancelled" message
  // But don't assume payment failed
};
```

---

## Complete Example

```tsx
import { useRazorpay } from '@codearcade/expo-razorpay';
import { View, Button, Alert } from 'react-native';

export default function App() {
  const { openCheckout, closeCheckout, RazorpayUI, isVisible } = useRazorpay();

  const handleCheckout = () => {
    const options = {
      key: 'rzp_test_1234567890abcdef',
      amount: 50000,
      currency: 'INR',
      order_id: 'order_xyz123',
      name: 'My Store',
      description: 'Product Order',
      prefill: {
        name: 'John Doe',
        email: 'john@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const callbacks = {
      onSuccess: (data) => {
        console.log('Success:', data.razorpay_payment_id);
        Alert.alert('Payment Successful!');
        closeCheckout();
      },
      onFailure: (error) => {
        console.error('Error:', error.error.description);
        Alert.alert('Payment Failed', error.error.description);
      },
      onClose: () => {
        console.log('Modal closed by user');
      },
    };

    openCheckout(options, callbacks);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={isVisible ? 'Processing...' : 'Pay ₹500'}
        onPress={handleCheckout}
        disabled={isVisible}
      />

      {RazorpayUI}
    </View>
  );
}
```

---

## Type Exports

The library exports these TypeScript types:

```typescript
export interface RazorpayOptions { ... }
export interface RazorpayCallbacks { ... }
export interface RazorpaySuccessResponse { ... }
export interface RazorpayErrorResponse { ... }

export function useRazorpay(): {
  openCheckout: ...;
  closeCheckout: ...;
  RazorpayUI: JSX.Element | null;
  isVisible: boolean;
}
```

You can import types for TypeScript projects:

```tsx
import {
  useRazorpay,
  RazorpayOptions,
  RazorpayCallbacks
} from "@codearcade/expo-razorpay";

const options: RazorpayOptions = { ... };
const callbacks: RazorpayCallbacks = { ... };
```

---

## Constraints & Limitations

- **Max simultaneous checkouts:** 1 per hook instance
- **Options size:** Should be < 1MB (practical limit ~10KB)
- **Callback size:** No limits
- **Amount limits:** Determined by Razorpay (usually up to 10,00,00,000 paise)
- **Supported currencies:** See Razorpay documentation
- **Browser requirement:** Expo WebView must work on target device

---

## Rate Limiting

- No built-in rate limiting
- Razorpay may rate-limit requests from server
- If calling `openCheckout` rapidly:
  - 2nd call ignored if 1st still open
  - Use `isVisible` to check state

---

## Error Handling Checklist

- ✅ Always handle `onFailure`
- ✅ Don't assume success without verification
- ✅ Verify signature on backend
- ✅ Handle `onClose` separately from failure
- ✅ Log errors for debugging
- ✅ Show user-friendly messages
- ✅ Implement retry logic if needed
