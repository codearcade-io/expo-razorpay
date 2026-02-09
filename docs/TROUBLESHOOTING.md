# Troubleshooting Guide - @codearcade/expo-razorpay

Solutions for common issues and problems.

---

## Issue: Checkout Modal Not Appearing

### Problem

You call `openCheckout()` but the modal doesn't show up.

### Solutions

#### ✅ Solution 1: Render RazorpayUI

**Most Common Cause:** You forgot to render the RazorpayUI component.

```tsx
// ❌ WRONG
const { openCheckout } = useRazorpay();
return <Button title="Pay" onPress={() => openCheckout(...)} />;

// ✅ CORRECT
const { openCheckout, RazorpayUI } = useRazorpay();
return (
  <View>
    <Button title="Pay" onPress={() => openCheckout(...)} />
    {RazorpayUI}  {/* Must be here! */}
  </View>
);
```

#### ✅ Solution 2: Check Hook is Called at Top Level

The hook must be called at the component's top level, not inside conditionals.

```tsx
// ❌ WRONG
function PaymentScreen() {
  if (someCondition) {
    const { openCheckout, RazorpayUI } = useRazorpay();
    // Hook called conditionally!
  }
}

// ✅ CORRECT
function PaymentScreen() {
  const { openCheckout, RazorpayUI } = useRazorpay();

  if (someCondition) {
    return <Button onPress={() => openCheckout(...)} />;
  }
}
```

#### ✅ Solution 3: Verify openCheckout is Called

Add console logs to check if `openCheckout` is actually being called:

```tsx
const handlePay = () => {
  console.log('Button pressed'); // Check if this logs

  const { openCheckout } = useRazorpay();

  openCheckout(options, callbacks);
  console.log('openCheckout called'); // Check if this logs
};
```

#### ✅ Solution 4: Check Browser Console

In Expo, open the browser console (F12) and check for JavaScript errors:

```
F12 → Console tab → Look for red error messages
```

Common errors might be:

- `options is undefined`
- `Invalid Razorpay key`
- WebView errors

---

## Issue: "Your API Key is Not Enabled"

### Problem

Error message: "Your API Key is Not Enabled" or similar.

### Solutions

#### 1. Check Your API Key Format

Your key should start with `rzp_test_` or `rzp_live_`:

```tsx
// ❌ Wrong
key: '123456789';

// ✅ Correct
key: 'rzp_test_1234567890abcdef';
```

Verify in Razorpay dashboard:

1. Go to dashboard.razorpay.com
2. Click Settings → API Keys
3. Copy the Key ID (not Secret Key!)
4. Make sure it's prefixed with `rzp_test_` or `rzp_live_`

#### 2. Check API Key is Public (Not Secret)

```tsx
// ❌ WRONG - Using Secret Key (never in client code!)
key: 'YOUR_SECRET_KEY'; // ❌ Starts with "rza_..."

// ✅ CORRECT - Using Public Key
key: 'rzp_test_1Hn6iAubEzDdaq'; // ✅ Starts with "rzp_test_"
```

Never expose your secret key! Only use the public key in client code.

#### 3. Check Account Status

Ensure your Razorpay account is:

- ✅ Activated
- ✅ Not suspended
- ✅ In correct mode (test vs live)

---

## Issue: Payment Completed But No Success Callback

### Problem

Payment appears to complete (on Razorpay) but `onSuccess` is never called.

### Solutions

#### ✅ Solution 1: Check Callback is Defined

```tsx
openCheckout(options, {
  onSuccess: (data) => {
    console.log('SUCCESS!'); // Add this
    // ... rest of code
  },
  onFailure: (error) => {
    console.log('FAILURE!');
  },
});
```

If you don't see the log, callback isn't being called.

#### ✅ Solution 2: Verify order_id format

Order ID must be valid string from Razorpay API:

```tsx
// ❌ WRONG
order_id: null; // ❌ Null
order_id: undefined; // ❌ Undefined
order_id: 123; // ❌ Number instead of string

// ✅ CORRECT
order_id: 'order_5f8a4c2b1e9d7a3f'; // ✅ Valid Razorpay order ID
```

#### ✅ Solution 3: Check Browser Console

Open Expo/browser developer tools (F12):

```
Console tab → Look for errors or logs
Network tab → Check if responses are received
```

#### ✅ Solution 4: Verify Order on Backend

Check if order was created successfully:

```tsx
try {
  const response = await fetch('YOUR_API/orders', {
    method: 'POST',
    body: JSON.stringify({ amount: 100 }),
  });
  const data = await response.json();
  console.log('Order created:', data.id); // Should log order ID
  return data.id;
} catch (error) {
  console.error('Order creation failed:', error);
}
```

---

## Issue: "Invalid Order ID" Error

### Problem

Error: "Invalid Order ID" or "Order Not Found"

### Solutions

#### 1. Verify Order ID Format

```tsx
// Check these:
console.log(typeof order_id); // Should be "string"
console.log(order_id); // Should look like "order_xxx..."
console.log(order_id.length); // Should be > 0
```

#### 2. Create Order on Your Backend

Never generate order IDs on the client. Always create on backend:

```tsx
// ❌ WRONG - Don't do this
const fakeOrderId = `order_${Date.now()}`;

// ✅ CORRECT - Create on backend
const createOrder = async () => {
  const res = await fetch('https://yourapi.com/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 100,
      currency: 'INR',
    }),
  });
  const data = await res.json();
  return data.id; // From Razorpay API response
};
```

#### 3. Backend Order Creation Code (Node.js Example)

```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'YOUR_KEY',
  key_secret: 'YOUR_SECRET',
});

app.post('/api/orders', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount, // In paise
      currency: 'INR',
    };
    const order = await razorpay.orders.create(options);
    res.json({ id: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Issue: Signature Verification Fails

### Problem

Payment succeeds but backend signature verification fails.

### Solutions

#### 1. Verify Signature on Backend

```javascript
// Node.js example
const crypto = require('crypto');

function verifySignature(orderId, paymentId, signature, secret) {
  const message = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return expectedSignature === signature;
}

// In your payment verification endpoint
const isValid = verifySignature(
  paymentData.razorpay_order_id,
  paymentData.razorpay_payment_id,
  paymentData.razorpay_signature,
  'YOUR_API_SECRET'
);

if (isValid) {
  // Mark payment as verified
} else {
  // Payment failed verification - DO NOT mark as successful!
}
```

#### 2. Use Correct Secret Key

```javascript
// ✅ CORRECT - Use API Secret Key from Razorpay dashboard
const secret = 'ztKUqaIw7LwMWI93K0x...';

// ❌ WRONG - Using public key
const secret = 'rzp_test_12345...'; // This won't work!
```

Get Secret Key from:

1. Go to dashboard.razorpay.com
2. Settings → API Keys
3. Copy the **Key Secret** (different from Key ID)

#### 3. Ensure Correct Message Format

Message must be: `{order_id}|{payment_id}`

```javascript
// ✅ CORRECT
const message = 'order_xyz|pay_abc';

// ❌ WRONG
const message = 'order_xyz:pay_abc'; // colon instead of pipe
const message = `order_xyz|pay_abc\n`; // newline at end
```

---

## Issue: WebView Crashes or Freezes

### Problem

The checkout modal crashes or becomes unresponsive.

### Solutions

#### 1. Check WebView is Supported

Ensure you're using:

- Expo SDK 48+ (recommended)
- Latest SDK in your project

```bash
# Check Expo version
expo --version

# Update if needed
npm install expo@latest
```

#### 2. Check for Memory Issues

Crashes often happen due to low memory. Monitor:

```tsx
import { Platform } from 'react-native';

// Add debugging
useRazorpay().openCheckout(options, {
  onSuccess: (data) => {
    console.log('Memory:', require('react-native').NativeModules.MemoryHelper);
  },
});
```

#### 3. Cleanup State Properly

Ensure cleanup happens after payment:

```tsx
onSuccess: (data) => {
  // Don't keep large objects
  closeCheckout();

  // Navigate to next screen
  router.push('/success');
};
```

#### 4. Test on Device

Sometimes emulator/simulator issues:

- Test on actual device
- Use Expo Go app on phone
- Check logs: `expo logs`

---

## Issue: Payment Works in Test Mode But Not Live

### Problem

Everything works with `rzp_test_*` key but fails with `rzp_live_*` key.

### Solutions

#### 1. Check Account Approval

Live mode requires:

- ✅ Account verified
- ✅ Bank account connected
- ✅ Documents submitted and approved
- ✅ Account activated for live payments

Check status in dashboard:

1. Go to dashboard.razorpay.com
2. Settings → Account
3. Check verification status

#### 2. Use Correct Live Key

```tsx
// For testing in live mode (before going production)
key: 'rzp_live_YOUR_PRODUCTION_KEY'; // Not test key!
```

#### 3. Generate Live Orders

When using live key, create orders with live API:

```javascript
// Backend - Live mode
const razorpay = new Razorpay({
  key_id: 'rzp_live_YOUR_KEY', // Live key
  key_secret: 'YOUR_LIVE_SECRET', // Live secret
});

const order = await razorpay.orders.create({
  amount: 50000, // In paise
  currency: 'INR',
});
```

#### 4. Test with Small Amount

Start with small test amount:

```tsx
amount: 100,  // 1 rupee
```

Don't test with large amounts.

---

## Issue: User Sees Blank WebView

### Problem

Modal opens but shows blank page.

### Solutions

#### 1. Check API Key is Valid

```tsx
console.log('Key provided:', options.key);
console.log('Key starts with rzp_:', options.key?.startsWith('rzp_'));
```

#### 2. Check Network Connection

Blank page usually means network issue:

```tsx
// In Expo
expo logs  // Check for network errors
```

#### 3. Check CSP Headers

If using custom WebView, ensure headers allow Razorpay:

```tsx
// Should allow razorpay.com
nonce: '...';
source: "'self' https://checkout.razorpay.com";
```

#### 4. Clear Cache and Reload

```bash
expo start --clear
```

---

## Issue: Double Payments

### Problem

Payment charged twice or callback fired twice.

### Solutions

#### 1. Prevent Double-Clicking

```tsx
const { isVisible } = useRazorpay();

<Button
  title="Pay"
  disabled={isVisible} // Disable while open
  onPress={handlePay}
/>;
```

#### 2. Throttle openCheckout Calls

```tsx
let isProcessing = false;

const handlePay = async () => {
  if (isProcessing) return;  // Ignore if already processing

  isProcessing = true;
  openCheckout(...);
};
```

#### 3. Verify on Backend Before Marking Success

```tsx
// Only mark as successful after verification
onSuccess: async (data) => {
  const verified = await verifyOnBackend(data);
  if (verified) {
    updateUserRecord(); // Only after verification
  }
};
```

---

## Issue: Cannot Read Property 'xxx' of Undefined

### Problem

Error like: "Cannot read property 'razorpay_payment_id' of undefined"

### Solutions

#### 1. Add Type Guards

```tsx
onSuccess: (data) => {
  if (!data) {
    console.error('No data received');
    return;
  }

  if (!data.razorpay_payment_id) {
    console.error('No payment ID');
    return;
  }

  // Now safe to use
  console.log(data.razorpay_payment_id);
};
```

#### 2. Check Options Format

```tsx
// Ensure all required fields are present
const options = {
  key: 'YOUR_KEY', // ✅ Must exist
  amount: 100, // ✅ Must be number
  currency: 'INR', // ✅ Must exist
  order_id: 'order_xyz', // ✅ Must exist
};

// Verify before passing
if (!options.key) throw new Error('Missing key');
if (!options.order_id) throw new Error('Missing order_id');
```

---

## Issue: TypeScript Type Errors

### Problem

TypeScript compiler errors with types.

### Solutions

#### 1. Import Types Correctly

```tsx
import { useRazorpay, RazorpayOptions } from '@codearcade/expo-razorpay';

const options: RazorpayOptions = {
  // TypeScript now knows what fields are required
  key: '...',
  amount: 100,
  // etc.
};
```

#### 2. Type Callbacks

```tsx
import { RazorpayCallbacks } from '@codearcade/expo-razorpay';

const callbacks: RazorpayCallbacks = {
  onSuccess: (data) => {
    // data is properly typed
    console.log(data.razorpay_payment_id);
  },
  onFailure: (error) => {
    console.log(error.error.description);
  },
};
```

---

## Debugging Checklist

Before reporting issues:

- ✅ RazorpayUI is rendered in JSX
- ✅ openCheckout is called with valid options
- ✅ order_id is created on backend
- ✅ API key starts with rzp*test* or rzp*live*
- ✅ Browser console has no errors
- ✅ Network tab shows successful requests
- ✅ Callbacks are properly defined
- ✅ No TypeScript errors
- ✅ Testing on actual device, not just emulator
- ✅ Expo SDK is up to date

---

## Getting Help

If issues persist:

1. Check browser console: `F12 → Console`
2. Check Expo logs: `expo logs`
3. Sample response data: `console.log(data)`
4. Verify Razorpay dashboard settings
5. Check Razorpay docs: https://razorpay.com/docs
6. Open GitHub issue with:
   - Reproducible example
   - Full error message
   - Console logs
   - Steps to reproduce
