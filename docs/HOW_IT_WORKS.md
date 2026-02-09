# How It Works - @codearcade/expo-razorpay

Understanding the architecture and flow of the `@codearcade/expo-razorpay` library.

---

## Architecture Overview

The `useRazorpay` hook provides a simple but powerful pattern:

```
Your Component
      ↓
useRazorpay() hook
      ↓
Returns { openCheckout, closeCheckout, RazorpayUI, isVisible }
      ↓
You render RazorpayUI in JSX
      ↓
RazorpayCheckout component (WebView-based)
      ↓
Razorpay payment gateway
```

---

## The Hook Pattern

The `useRazorpay` hook manages state internally:

```tsx
const useRazorpay = () => {
  // Internal state
  const [isVisible, setIsVisible] = useState(false);
  const [checkoutOptions, setCheckoutOptions] = useState(null);
  const [callbacks, setCallbacks] = useState(null);

  // When you call openCheckout()
  const openCheckout = (options, callbacks) => {
    setCheckoutOptions(options);
    setCallbacks(callbacks);
    setIsVisible(true); // Shows the modal
  };

  // When payment succeeds/fails or user closes
  const cleanup = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCheckoutOptions(null);
      setCallbacks(null);
    }, 100);
  };

  // RazorpayUI is the JSX you must render
  const RazorpayUI = isVisible ? (
    <RazorpayCheckout options={checkoutOptions} callbacks={callbacks} />
  ) : null;

  return { openCheckout, closeCheckout, RazorpayUI, isVisible };
};
```

---

## Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Buy Now"                                    │
│    → openCheckout(options, callbacks) is called             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. RazorpayUI appears (modal/webview)                       │
│    → WebView loads Razorpay payment page                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User enters payment details                              │
│    → OTP, card details, etc.                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
    ✅ PAYMENT SUCCESS      ❌ PAYMENT FAILED
         │                       │
         └───────────┬───────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Razorpay returns response                                │
│    → Contains razorpay_payment_id, signature, etc.          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Callback is triggered                                    │
│    → onSuccess(data) or onFailure(error)                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Your code handles the response                           │
│    → Verify on backend, update UI, navigate, etc.           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. closeCheckout() cleans up state                          │
│    → Modal is hidden                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Why Does RazorpayUI Need to Be Rendered?

The hook returns JSX instead of managing the modal itself because:

1. **Flexibility** - You control where the checkout appears in your UI tree
2. **Context Access** - The component can access your providers and context
3. **Separation of Concerns** - Logic (hook) is separate from rendering (JSX)
4. **React Best Practices** - Following the "render props" and "hook" patterns

```tsx
// ✅ CORRECT - RazorpayUI is in your component tree
const { openCheckout, RazorpayUI } = useRazorpay();

return (
  <View>
    <Button onPress={() => openCheckout(...)} />
    {RazorpayUI}  {/* Must be here */}
  </View>
);

// ❌ WRONG - RazorpayUI not rendered
const { openCheckout, RazorpayUI } = useRazorpay();
return <Button onPress={() => openCheckout(...)} />;
// → Checkout will open but modal won't appear!
```

---

## State Management

### Hook State

```typescript
isVisible: boolean; // Is checkout modal open?
checkoutOptions: object; // Current payment options
callbacks: object; // Success/failure callbacks
```

### Return Values

| Value           | Type     | Purpose                                |
| --------------- | -------- | -------------------------------------- |
| `isVisible`     | boolean  | Check if checkout is open              |
| `RazorpayUI`    | JSX      | Render this in your component          |
| `openCheckout`  | function | Open checkout with options & callbacks |
| `closeCheckout` | function | Programmatically close checkout        |

---

## WebView Communication

The checkout is rendered in a WebView that:

1. Loads the Razorpay payment form
2. Handles user input securely
3. Processes payment via Razorpay gateway
4. Returns response to React Native via WebView bridge

```
┌──────────────────────┐
│  React Native Layer  │
│  ┌────────────────┐  │
│  │ Your Component │  │
│  │ + useRazorpay  │  │
│  └────────┬───────┘  │
│           │          │
│  ┌────────▼────────┐ │
│  │   RazorpayUI    │ │
│  │   (JSX)         │ │
│  └────────┬────────┘ │
└───────────┼──────────┘
            │ (WebView Bridge)
            ↓
┌──────────────────────┐
│   WebView Layer      │
│ ┌────────────────┐   │
│ │ Razorpay Form  │   │
│ │ Payment Gateway│   │
│ └────────────────┘   │
└──────────────────────┘
```

---

## Callback Execution Timeline

```typescript
// Timeline of execution:

// t=0: User taps "Pay Now"
openCheckout(options, callbacks);

// t=1: Modal appears, WebView loads
// isVisible becomes true

// t=2-N: User enters payment details
// Razorpay processes payment

// t=N+1: Payment result received
// ✅ Payment successful
callbacks.onSuccess(data);
// OR
// ❌ Payment failed
callbacks.onFailure(error);
// OR
// ✗ User closed modal
callbacks.onClose();

// t=N+2: Cleanup happens
// (You call closeCheckout() or automatic cleanup)
isVisible becomes false
```

---

## Memory & Performance

The hook:

- **Cleans up automatically** after each transaction
- **Removes callbacks** to prevent memory leaks
- **Resets modal state** after a delay to prevent UI flicker
- **Throttles repeated calls** (ignores if already opening)

```typescript
// Auto-cleanup after payment
const cleanup = () => {
  setIsVisible(false);
  setTimeout(() => {
    setCallbacks(null); // Remove references
    setCheckoutOptions(null); // Free memory
  }, 100); // Small delay for animation
};
```

---

## Comparison: Hook vs Provider Pattern

### Old Approach (Provider - NOT USED ANYMORE)

```tsx
<RazorpayProvider>
  <App />
</RazorpayProvider>

// ❌ Adds context overhead
// ❌ Single global checkout
// ❌ More boilerplate
```

### New Approach (Hook - CURRENT)

```tsx
const { openCheckout, RazorpayUI } = useRazorpay();

// ✅ Local state management
// ✅ Multiple instances possible
// ✅ Simpler API
// ✅ Better control
```

---

## Error Handling Flow

```typescript
// 1. Error occurs in payment
onFailure: (error) => {
  // error structure:
  {
    code: string,           // "CANCELLED", "GATEWAY_ERROR", etc.
    description: string,    // Human-readable message
    source: string,         // "api", "gateway", etc.
    step: string,           // "payment_authorization", etc.
    reason: string,         // Detailed reason
  }
}

// 2. You handle it
if (error.code === "CANCELLED") {
  // User cancelled, don't show error
} else {
  // Show error to user
  Alert.alert("Payment Failed", error.description);
}

// 3. Cleanup
closeCheckout();
```

---

## Common Patterns & Their Flow

### Pattern: Async Order Creation + Payment

```
1. User clicks "Buy"
   ↓
2. Create order on backend (async)
   ↓
3. Get order_id from backend
   ↓
4. Call openCheckout(options_with_order_id, callbacks)
   ↓
5. Show modal
   ↓
6. User completes payment
   ↓
7. onSuccess called
   ↓
8. Verify on backend
   ↓
9. Navigate to success screen
   ↓
10. closeCheckout()
```

### Pattern: Loading States

```
Button click
   ↓
setLoading(true)
   ↓
[Call openCheckout]
   ↓
Modal visible (setLoading(false))
   ↓
User completes payment
   ↓
[Verify on backend]
   ↓
setLoading(true)
   ↓
Response received
   ↓
setLoading(false)
   ↓
Navigate/closeCheckout()
```

---

## Debugging Tips

### Check if RazorpayUI is rendered

```tsx
const { RazorpayUI } = useRazorpay();
console.log('RazorpayUI:', RazorpayUI); // Should not be null

return <View>{RazorpayUI}</View>;
```

### Check isVisible state

```tsx
const { isVisible } = useRazorpay();
console.log('Modal visible:', isVisible);
```

### Check callback execution

```tsx
onSuccess: (data) => {
  console.log('SUCCESS CALLED:', data); // Should log
};
```

### Enable WebView debugging

```tsx
// In development, check WebView console
// Most payment errors will be logged there
```

---

## Summary

The `useRazorpay` pattern is:

- **Simple** - Just call a hook
- **Flexible** - You render RazorpayUI where you want
- **Efficient** - Manages state automatically
- **Safe** - No provider overhead
- **Powerful** - Full control over payment flow
