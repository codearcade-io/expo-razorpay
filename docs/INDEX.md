# Documentation Index - @codearcade/expo-razorpay

Complete guide to all documentation files.

---

## 📚 Documentation Files

### 1. [README.md](../README.md) ⭐ **START HERE**

- Overview of the library
- Quick start guide
- Basic and advanced examples
- API reference summary
- Best practices

### 2. [USAGE.md](./USAGE.md) 📖 **Complete Usage Guide**

- Installation instructions
- Basic setup
- Opening checkout
- Handling callbacks
- 3+ advanced examples
- Common patterns

**Best for:** Learning how to use the hook

### 3. [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) 🔧 **Architecture & Flow**

- How the hook works internally
- Payment flow diagrams
- State management
- Memory & performance
- Comparison with old Provider pattern
- Debugging tips

**Best for:** Understanding internals and debugging

### 4. [API_REFERENCE.md](./API_REFERENCE.md) 📋 **Complete API Documentation**

- Hook signature
- All parameters
- Return values
- Type definitions
- Field validation
- Error codes

**Best for:** Reference when using the API

### 5. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 🆘 **Problem Solutions**

- Common issues
- Detailed solutions
- Code examples for each issue
- Debugging checklist
- Getting help

**Best for:** When something doesn't work

---

## 🎯 Quick Links by Use Case

### "I'm new, where do I start?"

1. Read the [README.md](../README.md) Quick Start section
2. Follow [USAGE.md](./USAGE.md) Basic Setup
3. Try the example code yourself

### "I want to see code examples"

- [USAGE.md](./USAGE.md) → Advanced Examples (3 complete examples)
- [README.md](../README.md) → Basic and Advanced Examples

### "How does this actually work?"

- [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) → Read from top to bottom

### "I need detailed API documentation"

- [API_REFERENCE.md](./API_REFERENCE.md) → All field descriptions and types

### "Something isn't working"

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → Find your issue and solution

### "I was using the old Provider pattern"

- See **Migration Guide** at the bottom of this file

---

## 📖 Recommended Reading Order

**For Beginners:**

1. README.md (Quick Start)
2. USAGE.md (Basic Setup section)
3. Build your first payment flow
4. Reference API_REFERENCE.md as needed

**For Advanced Users:**

1. API_REFERENCE.md (all types and options)
2. HOW_IT_WORKS.md (internals)
3. Build complex payment flows

**For Debugging:**

1. TROUBLESHOOTING.md (find your issue)
2. HOW_IT_WORKS.md (understand flow)
3. Browser console + logs

---

## ✨ Key Concepts

### The Hook Pattern

```tsx
const { openCheckout, RazorpayUI } = useRazorpay();
```

Key points:

- Hook doesn't require a Provider
- Returns JSX (`RazorpayUI`) that you render
- You control when and where checkout appears
- Manages state automatically

### Required: Render RazorpayUI

```tsx
return (
  <View>
    {RazorpayUI} {/* ✅ MUST BE HERE */}
  </View>
);
```

### Two-Part API

1. **Hook** - State and functions
2. **JSX** - Visual component

Both are needed!

---

## 🔗 Document Relationships

```
README.md (Overview)
├── Quick start example
├── Feature highlights
└── Links to detailed docs
    │
    ├── USAGE.md
    │  ├── Installation
    │  ├── Basic setup
    │  └── Real-world examples
    │
    ├── HOW_IT_WORKS.md
    │  ├── Architecture
    │  └── Debugging
    │
    ├── API_REFERENCE.md
    │  ├── useRazorpay() types
    │  ├── RazorpayOptions details
    │  └── Callbacks reference
    │
    └── TROUBLESHOOTING.md
       ├── Common issues
       └── Solutions
```

---

## 🎓 Learning Paths

### Path 1: "Get Payment Working in 5 Minutes"

1. [README.md](../README.md) → Copy Basic Example
2. Replace YOUR_RAZORPAY_KEY with actual key
3. Run! ✅

### Path 2: "Build Production-Ready Code"

1. [USAGE.md](./USAGE.md) → Advanced Example with Navigation
2. [API_REFERENCE.md](./API_REFERENCE.md) → Understand all options
3. Set up backend order creation
4. Implement signature verification
5. Deploy! 🚀

### Path 3: "I Hit a Bug"

1. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) → Find matching issue
2. [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) → Understand the flow
3. Debug using the checklist
4. Check browser console + Expo logs

---

## Migration Guide: From Provider to Hook

**Old way (NO LONGER USED):**

```tsx
<RazorpayProvider>
  <App />
</RazorpayProvider>
```

**New way (CURRENT):**

```tsx
// No provider needed!
// Just use the hook directly.
```

### Migration Steps

#### Before (Old)

```tsx
// _layout.tsx
import { RazorpayProvider } from "@codearcade/expo-razorpay";

export default function RootLayout() {
  return (
    <RazorpayProvider>
      <Slot />
    </RazorpayProvider>
  );
}

// payment.tsx
import { useRazorpay } from "@codearcade/expo-razorpay";

export default function Payment() {
  const { openCheckout } = useRazorpay();
  // RazorpayUI not available!

  return (
    <View>
      <Button onPress={() => openCheckout(...)} />
      {/* No place to render checkout */}
    </View>
  );
}
```

#### After (New)

```tsx
// _layout.tsx - No changes needed!
export default function RootLayout() {
  return <Slot />;  {/* No provider wrapper */}
}

// payment.tsx
import { useRazorpay } from "@codearcade/expo-razorpay";

export default function Payment() {
  const { openCheckout, RazorpayUI } = useRazorpay();
  // RazorpayUI now available! ✅

  return (
    <View>
      <Button onPress={() => openCheckout(...)} />
      {RazorpayUI}  {/* Render it here */}
    </View>
  );
}
```

### What Changed

| Aspect               | Before | After  |
| -------------------- | ------ | ------ |
| Provider needed      | ✅ Yes | ❌ No  |
| RazorpayUI available | ❌ No  | ✅ Yes |
| Hook complexity      | More   | Less   |
| Boilerplate          | More   | Less   |
| Control              | Less   | More   |
| Line of code saved   | -      | ~20    |

### Why This Change?

1. **Simpler** - No provider boilerplate
2. **Lighter** - Less context overhead
3. **Better** - You control the UI rendering
4. **Cleaner** - Less magic, more explicit

---

## 📞 Support & Feedback

- **Bug Report:** Open GitHub issue with:

  - Error message
  - Steps to reproduce
  - Code example
  - Console logs

- **Feature Request:** Open GitHub issue with:

  - Use case
  - Why it's needed
  - Alternative approaches considered

- **Questions:** Check:
  1. README.md examples
  2. USAGE.md patterns
  3. TROUBLESHOOTING.md solutions
  4. API_REFERENCE.md details

---

## 📊 Document Statistics

| Document           | Purpose   | Read Time | Depth      |
| ------------------ | --------- | --------- | ---------- |
| README.md          | Overview  | 5 min     | Beginner   |
| USAGE.md           | Examples  | 15 min    | Beginner+  |
| HOW_IT_WORKS.md    | Deep dive | 20 min    | Advanced   |
| API_REFERENCE.md   | Reference | 10 min    | All levels |
| TROUBLESHOOTING.md | Solutions | Variable  | All levels |

---

## 🅰️ Abbreviations & Acronyms

| Term                | Meaning                                   |
| ------------------- | ----------------------------------------- |
| JSX                 | JavaScript XML (React syntax)             |
| API                 | Application Programming Interface         |
| RazorpayUI          | The JSX component returned by useRazorpay |
| openCheckout        | Function to show the payment modal        |
| closeCheckout       | Function to hide the payment modal        |
| order_id            | Payment order ID from Razorpay            |
| razorpay_payment_id | Unique ID for successful payment          |
| razorpay_signature  | Cryptographic signature for verification  |

---

## 🔄 Version History

### v2.0.0 (Current)

- ✨ Removed Provider pattern
- ✨ Hook now returns RazorpayUI
- 📚 Completely rewritten documentation
- 🎯 Simpler, cleaner API
- ⚡ Better performance

### v1.0.0 (Old - No longer supported)

- Used Provider pattern
- RazorpayUI not available from hook
- More boilerplate required

---

## 🎯 Next Steps

1. **Choose your path** above
2. **Read the relevant docs**
3. **Try the examples**
4. **Build your integration**
5. **Reference API docs** as needed
6. **Debug with Troubleshooting** guide if issues

Happy coding! 🚀
