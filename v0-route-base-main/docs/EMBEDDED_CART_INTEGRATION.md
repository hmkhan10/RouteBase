# RouteBases Embedded Shopping Cart Integration Guide

## Overview

The RouteBases Embedded Shopping Cart is a production-ready JavaScript library that allows merchants to easily add e-commerce functionality to any website with just a few lines of code. The system includes:

- **Merchant Client Script**: Lightweight JavaScript snippet for embedding
- **Cart Logic**: Full cart functionality with localStorage persistence
- **Checkout & Dashboard Sync**: Seamless integration with RouteBases backend
- **Modern UI**: Sleek dark-themed design with smooth animations

## Quick Start

### 1. Add the Script to Your Website

```html
<!-- Add this to your HTML <head> section -->
<script src="https://your-domain.com/routebase-cart.js"></script>
```

### 2. Initialize the Cart

```html
<script>
  // Initialize the cart with your merchant ID
  RouteBasesCart.init('your-merchant-id', {
    apiBaseUrl: 'https://your-domain.com', // Optional, defaults to current domain
    theme: 'dark', // Optional, defaults to 'dark'
    currency: 'PKR' // Optional, defaults to 'PKR'
  });
</script>
```

### 3. Add "Add to Cart" Buttons

```html
<!-- Basic button -->
<button data-rb-id="product-123" 
        data-rb-name="Premium Widget" 
        data-rb-price="2999"
        data-rb-image="https://example.com/widget.jpg">
  Add to Cart
</button>

<!-- Minimal button (only ID is required) -->
<button data-rb-id="product-456">Add to Cart</button>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `merchantId` | string | Required | Your unique RouteBases merchant ID |
| `apiBaseUrl` | string | Current domain | Base URL for API calls |
| `theme` | string | 'dark' | UI theme ('dark' or 'light') |
| `currency` | string | 'PKR' | Currency code for display |

## Button Data Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-rb-id` | Yes | Unique product identifier |
| `data-rb-name` | No | Product name (defaults to "Product [ID]") |
| `data-rb-price` | No | Product price (defaults to "0") |
| `data-rb-image` | No | Product image URL (defaults to placeholder) |

## Cart API Methods

### Core Methods

```javascript
// Add item to cart
RouteBasesCart.addToCart({
  id: 'product-123',
  name: 'Premium Widget',
  price: 2999,
  image: 'https://example.com/widget.jpg',
  quantity: 2
});

// Remove item from cart
RouteBasesCart.removeFromCart('product-123');

// Update item quantity
RouteBasesCart.updateQuantity('product-123', 3);

// Calculate cart total
const total = RouteBasesCart.calculateTotal();

// Toggle cart sidebar
RouteBasesCart.toggleCart();

// Open cart
RouteBasesCart.openCart();

// Close cart
RouteBasesCart.closeCart();
```

### Cart State

```javascript
// Access current cart items
console.log(RouteBasesCart.cart);

// Check if cart is open
console.log(RouteBasesCart.isOpen);

// Get configuration
console.log(RouteBasesCart.config);
```

## React Integration

### Functional Component Example

```jsx
import { useEffect } from 'react';

const ShoppingCartProvider = ({ merchantId, children }) => {
  useEffect(() => {
    // Load RouteBases cart script
    const script = document.createElement('script');
    script.src = '/routebase-cart.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize cart
      window.RouteBasesCart.init(merchantId, {
        apiBaseUrl: process.env.REACT_APP_API_URL,
        theme: 'dark',
        currency: 'PKR'
      });
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [merchantId]);

  return children;
};

// Usage
const App = () => {
  return (
    <ShoppingCartProvider merchantId="your-merchant-id">
      <YourApp />
    </ShoppingCartProvider>
  );
};
```

### Add to Cart Component

```jsx
const AddToCartButton = ({ product }) => {
  return (
    <button
      data-rb-id={product.id}
      data-rb-name={product.name}
      data-rb-price={product.price}
      data-rb-image={product.image}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Add to Cart
    </button>
  );
};
```

## Next.js Integration

### pages/_app.js

```jsx
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="/routebase-cart.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.RouteBasesCart.init('your-merchant-id', {
            apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,
            theme: 'dark',
            currency: 'PKR'
          });
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

### Custom Hook

```jsx
import { useEffect, useState } from 'react';

const useRouteBasesCart = (merchantId, config = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkCartLoaded = () => {
      if (window.RouteBasesCart) {
        window.RouteBasesCart.init(merchantId, {
          apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,
          theme: 'dark',
          currency: 'PKR',
          ...config
        });
        setIsLoaded(true);
      } else {
        setTimeout(checkCartLoaded, 100);
      }
    };

    checkCartLoaded();
  }, [merchantId, config]);

  return {
    isLoaded,
    cart: window.RouteBasesCart?.cart || [],
    isOpen: window.RouteBasesCart?.isOpen || false,
    addToCart: window.RouteBasesCart?.addToCart,
    removeFromCart: window.RouteBasesCart?.removeFromCart,
    updateQuantity: window.RouteBasesCart?.updateQuantity,
    calculateTotal: window.RouteBasesCart?.calculateTotal,
    toggleCart: window.RouteBasesCart?.toggleCart
  };
};

// Usage
const ProductPage = () => {
  const { addToCart } = useRouteBasesCart('your-merchant-id');

  const handleAddToCart = () => {
    addToCart({
      id: 'product-123',
      name: 'Premium Widget',
      price: 2999,
      image: '/widget.jpg'
    });
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
};
```

## Styling and Customization

### CSS Variables

The cart uses CSS variables for easy customization:

```css
:root {
  --routebase-primary: #3b82f6;
  --routebase-primary-dark: #2563eb;
  --routebase-secondary: #1f2937;
  --routebase-background: #111827;
  --routebase-text: #ffffff;
  --routebase-text-muted: #9ca3af;
  --routebase-border: #374151;
  --routebase-success: #10b981;
  --routebase-success-dark: #059669;
  --routebase-danger: #ef4444;
}
```

### Custom CSS Override

```css
/* Override cart button styles */
#routebase-cart-button {
  bottom: 30px !important;
  right: 30px !important;
}

/* Override cart sidebar styles */
#routebase-cart-sidebar {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
}

/* Custom notification styles */
.routebase-notification {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
}
```

## Backend Integration

### API Endpoints

The cart integrates with these backend endpoints:

- `POST /api/checkout/session` - Create checkout session
- `GET /api/checkout/session` - Retrieve checkout sessions
- `POST /api/transactions` - Record transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/dashboard/stats` - Get dashboard statistics

### Checkout Flow

1. User clicks "Checkout" in cart
2. Cart sends items to `/api/checkout/session`
3. Backend calculates fees (3% platform + gateway fees)
4. Checkout session is created
5. Transaction is recorded
6. Dashboard stats are updated
7. User is redirected to payment page

## Mobile Responsiveness

The cart is fully responsive and includes:

- Touch-friendly buttons and controls
- Optimized sidebar for mobile screens
- Swipe gestures support (optional)
- Adaptive font sizes and spacing

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)

## Security Features

- HTTPS-only API calls
- Input sanitization and validation
- XSS protection
- CSRF token support
- Rate limiting on checkout attempts

## Performance Optimization

- Lazy loading of cart UI
- Debounced cart updates
- LocalStorage for offline persistence
- Minimal bundle size (~45KB gzipped)
- Async script loading

## Troubleshooting

### Common Issues

1. **Cart not appearing**: Check that the script is loaded and initialized
2. **Buttons not working**: Verify `data-rb-id` attributes are present
3. **Checkout failing**: Check API endpoint configuration and CORS settings
4. **Styles not applying**: Ensure CSS is not blocked by other stylesheets

### Debug Mode

Enable debug mode for detailed logging:

```javascript
RouteBasesCart.init('your-merchant-id', {
  debug: true
});
```

### Error Handling

The cart includes comprehensive error handling:

```javascript
// Listen for cart events
window.addEventListener('routebase-cart-error', (event) => {
  console.error('Cart error:', event.detail);
});

window.addEventListener('routebase-cart-updated', (event) => {
  console.log('Cart updated:', event.detail);
});
```

## Support

For integration support and questions:

- Documentation: [RouteBases Docs](https://docs.routebase.com)
- Support: support@routebase.com
- GitHub Issues: [RouteBases Cart Issues](https://github.com/routebase/cart/issues)

## License

This library is released under the MIT License. See LICENSE file for details.
