# Usage Guide - @codearcade/expo-razorpay

Complete guide on how to use the `@codearcade/expo-razorpay` library in your Expo app.

## Table of Contents

1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Opening Checkout](#opening-checkout)
4. [Handling Callbacks](#handling-callbacks)
5. [Advanced Examples](#advanced-examples)
6. [Common Patterns](#common-patterns)

---

## Installation

```bash
npm install @codearcade/expo-razorpay
# or
yarn add @codearcade/expo-razorpay
```

---

## Basic Setup

The `useRazorpay` hook provides everything you need. Here's a minimal example:

```tsx
import { useRazorpay } from '@codearcade/expo-razorpay';

export default function CheckoutScreen() {
  const { openCheckout, RazorpayUI } = useRazorpay();

  return (
    <View>
      <Button
        title="Pay Now"
        onPress={() => {
          openCheckout(
            {
              key: 'YOUR_RAZORPAY_KEY',
              amount: 100,
              currency: 'INR',
              order_id: 'order_xxxxx',
            },
            {
              onSuccess: (data) => console.log('Success!', data),
              onFailure: (error) => console.log('Failed!', error),
            }
          );
        }}
      />

      {/* This must be rendered for checkout to work */}
      {RazorpayUI}
    </View>
  );
}
```

---

## Opening Checkout

Call `openCheckout()` with two arguments:

### 1. Options Object (RazorpayOptions)

```tsx
openCheckout({
  key: 'YOUR_RAZORPAY_KEY', // String: Your API Key
  amount: 100, // Number: Amount in paise
  currency: 'INR', // String: Currency code
  order_id: 'order_1234567890', // String: From your backend
  name: 'My Store', // Optional: Your brand name
  description: 'Product purchase', // Optional: What they're buying
  image: 'https://logo.url/logo.png', // Optional: Your logo
  prefill: {
    // Optional: Pre-fill details
    name: 'John Doe',
    email: 'john@example.com',
    contact: '9876543210',
  },
  notes: {
    // Optional: Custom data
    order_id: 'backend_order_123',
    customer_id: 'cust_456',
  },
  theme: {
    // Optional: Styling
    color: '#3399cc',
  },
});
```

### 2. Callbacks Object (RazorpayCallbacks)

```tsx
{
  onSuccess: (data) => {
    // Called when payment succeeds
    console.log("Payment ID:", data.razorpay_payment_id);
  },
  onFailure: (error) => {
    // Called when payment fails
    console.log("Error:", error.description);
  },
  onClose: () => {
    // Called when user closes the modal (optional)
    console.log("Modal was closed");
  },
}
```

---

## Handling Callbacks

### Success Callback

```tsx
onSuccess: (data) => {
  // data contains:
  // - razorpay_payment_id: The payment ID
  // - razorpay_order_id: The order ID
  // - razorpay_signature: For verification

  // Verify on backend
  verifyPaymentOnBackend(data);

  // Update UI
  showSuccessMessage();

  // Navigate to success screen
  navigation.navigate('Success');
};
```

### Failure Callback

```tsx
onFailure: (error) => {
  // error contains:
  // - code: Error code (e.g., "CANCELLED")
  // - description: Human-readable message
  // - source: Where the error originated
  // - step: Which step failed
  // - reason: Reason for failure

  Alert.alert('Payment Failed', error.description || 'Something went wrong');
};
```

### Close Callback

```tsx
onClose: () => {
  // User clicked the X button to close checkout
  // (Payment may or may not have been attempted)
  console.log('Checkout was closed by user');
};
```

---

## Advanced Examples

### Example 1: Complete Payment Flow

```tsx
import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Alert } from 'react-native';
import { useRazorpay } from '@codearcade/expo-razorpay';

export default function PaymentScreen() {
  const { openCheckout, closeCheckout, RazorpayUI } = useRazorpay();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Step 1: Create order on backend
      const orderResponse = await fetch('https://api.example.com/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50000, // 500 INR
          currency: 'INR',
        }),
      });

      const { order_id } = await orderResponse.json();

      // Step 2: Open checkout
      openCheckout(
        {
          key: 'rzp_test_YOUR_KEY_ID',
          amount: 50000,
          currency: 'INR',
          order_id: order_id,
          name: 'My Store',
          description: 'Premium Subscription',
          image: 'https://example.com/logo.png',
          prefill: {
            name: 'John Doe',
            email: 'john@example.com',
            contact: '9876543210',
          },
          theme: {
            color: '#2f55d4',
          },
        },
        {
          onSuccess: async (paymentData) => {
            // Step 3: Verify on backend
            const verifyResponse = await fetch(
              'https://api.example.com/verify',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
              }
            );

            if (verifyResponse.ok) {
              Alert.alert('Success', 'Payment completed!');
              // Navigate to success screen
            } else {
              Alert.alert('Verification Failed', 'Please contact support');
            }

            closeCheckout();
          },
          onFailure: (error) => {
            Alert.alert('Payment Failed', error.description);
          },
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Button title="Pay ₹500" onPress={handlePayment} disabled={loading} />
      {RazorpayUI}
    </View>
  );
}
```

### Example 2: Multiple Products

```tsx
import React, { useState } from 'react';
import { View, FlatList, Button, Text, StyleSheet } from 'react-native';
import { useRazorpay } from '@codearcade/expo-razorpay';

const PRODUCTS = [
  { id: 1, name: 'Premium Plan', price: 99 },
  { id: 2, name: 'Business Plan', price: 199 },
  { id: 3, name: 'Enterprise Plan', price: 499 },
];

export default function ProductList() {
  const { openCheckout, RazorpayUI } = useRazorpay();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleBuy = (product) => {
    setSelectedProduct(product);

    openCheckout(
      {
        key: 'YOUR_KEY',
        amount: product.price * 100, // Convert to paise
        currency: 'INR',
        order_id: `order_${Date.now()}`,
        name: 'Store',
        description: product.name,
      },
      {
        onSuccess: (data) => {
          Alert.alert(
            'Success',
            `You bought ${product.name} for ₹${product.price}`
          );
          setSelectedProduct(null);
        },
        onFailure: (error) => {
          Alert.alert('Failed', error.description);
          setSelectedProduct(null);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={PRODUCTS}
        renderItem={({ item }) => (
          <View style={styles.product}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            <Button
              title="Buy Now"
              onPress={() => handleBuy(item)}
              disabled={selectedProduct !== null}
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      {RazorpayUI}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  product: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productPrice: { fontSize: 18, color: '#2f55d4', marginVertical: 8 },
});
```

### Example 3: With Loading State and Navigation

```tsx
import React, { useState } from 'react';
import { View, Button, ActivityIndicator } from 'react-native';
import { useRazorpay } from '@codearcade/expo-razorpay';
import { useRouter } from 'expo-router';

export default function CheckoutScreen() {
  const { openCheckout, closeCheckout, RazorpayUI, isVisible } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // Create order
      const { orderId } = await createOrderOnBackend();

      openCheckout(
        {
          key: 'YOUR_KEY',
          amount: 10000,
          currency: 'INR',
          order_id: orderId,
          name: 'Store',
        },
        {
          onSuccess: async (data) => {
            // Verify payment
            const isValid = await verifyPaymentOnBackend(data);
            closeCheckout();

            if (isValid) {
              router.push({
                pathname: '/success',
                params: { paymentId: data.razorpay_payment_id },
              });
            }
          },
          onFailure: (error) => {
            console.log('Payment error:', error);
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {loading && <ActivityIndicator />}
      <Button
        title="Proceed to Payment"
        onPress={handleCheckout}
        disabled={loading || isVisible}
      />
      {RazorpayUI}
    </View>
  );
}
```

---

## Common Patterns

### Pattern 1: Close Checkout Programmatically

```tsx
const { openCheckout, closeCheckout, RazorpayUI } = useRazorpay();

// Close after success
onSuccess: (data) => {
  closeCheckout(); // Closes the modal
  // Navigate to success screen
};
```

### Pattern 2: Check if Checkout is Visible

```tsx
const { RazorpayUI, isVisible } = useRazorpay();

// Disable other buttons while checkout is open
<Button title="Pay" disabled={isVisible} />;
```

### Pattern 3: Custom Error Handling

```tsx
onFailure: (error) => {
  const messages = {
    CANCELLED: 'You cancelled the payment',
    GATEWAY_ERROR: 'Gateway error. Please try again',
    BAD_REQUEST: 'Invalid order details',
  };

  const message = messages[error.code] || error.description;
  showErrorToast(message);
};
```

### Pattern 4: Retry Payment

```tsx
const [retryCount, setRetryCount] = useState(0);

const handlePayment = () => {
  openCheckout(options, {
    onFailure: (error) => {
      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
        // Offer retry
        showRetryDialog(() => handlePayment());
      }
    },
  });
};
```

### Pattern 5: Loading During Verification

```tsx
const [verifying, setVerifying] = useState(false);

onSuccess: async (data) => {
  setVerifying(true);
  try {
    await verifyOnBackend(data);
    showSuccess();
  } finally {
    setVerifying(false);
  }
};
```

---

## Tips & Best Practices

1. **Always render RazorpayUI** - Without it, no checkout will appear
2. **Create orders on backend** - Never reveal your API secret to the client
3. **Verify signatures** - Always verify payment on your server
4. **Handle all callbacks** - Catch failures and user cancellations
5. **Show loading states** - Give feedback during order creation
6. **Test with test key** - Use `rzp_test_*` keys during development
