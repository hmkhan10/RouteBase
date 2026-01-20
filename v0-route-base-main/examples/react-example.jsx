import React, { useEffect, useState } from 'react';

const RouteBaseCartProvider = ({ children, merchantId, config = {} }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load RouteBase cart script
    const script = document.createElement('script');
    script.src = '/routebase-cart.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize cart
      window.RouteBaseCart.init(merchantId, {
        apiBaseUrl: process.env.REACT_APP_API_URL || window.location.origin,
        theme: 'dark',
        currency: 'PKR',
        ...config
      });
      
      setIsLoaded(true);
      setCart(window.RouteBaseCart.cart || []);
      
      // Listen for cart updates
      const handleCartUpdate = () => {
        setCart([...window.RouteBaseCart.cart]);
      };
      
      window.addEventListener('routebase-cart-updated', handleCartUpdate);
      
      return () => {
        window.removeEventListener('routebase-cart-updated', handleCartUpdate);
      };
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [merchantId, config]);

  const cartAPI = isLoaded ? {
    addToCart: window.RouteBaseCart.addToCart,
    removeFromCart: window.RouteBaseCart.removeFromCart,
    updateQuantity: window.RouteBaseCart.updateQuantity,
    calculateTotal: window.RouteBaseCart.calculateTotal,
    toggleCart: window.RouteBaseCart.toggleCart,
    openCart: window.RouteBaseCart.openCart,
    closeCart: window.RouteBaseCart.closeCart,
    cart: cart,
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    total: window.RouteBaseCart.calculateTotal()
  } : null;

  return (
    <RouteBaseCartContext.Provider value={cartAPI}>
      {children}
    </RouteBaseCartContext.Provider>
  );
};

const RouteBaseCartContext = React.createContext();

const useRouteBaseCart = () => {
  const context = React.useContext(RouteBaseCartContext);
  if (!context) {
    throw new Error('useRouteBaseCart must be used within RouteBaseCartProvider');
  }
  return context;
};

// Product Component
const Product = ({ product }) => {
  const { addToCart } = useRouteBaseCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">PKR {product.price.toLocaleString()}</p>
      <button 
        onClick={handleAddToCart}
        className="add-to-cart-btn"
      >
        Add to Cart
      </button>
    </div>
  );
};

// Cart Summary Component
const CartSummary = () => {
  const { cart, itemCount, total, toggleCart } = useRouteBaseCart();

  if (itemCount === 0) return null;

  return (
    <div className="cart-summary">
      <div className="cart-info">
        <span className="item-count">{itemCount} items</span>
        <span className="total">PKR {total.toLocaleString()}</span>
      </div>
      <button onClick={toggleCart} className="view-cart-btn">
        View Cart
      </button>
    </div>
  );
};

// Floating Cart Button Component
const FloatingCartButton = () => {
  const { itemCount, toggleCart } = useRouteBaseCart();

  if (itemCount === 0) return null;

  return (
    <button 
      onClick={toggleCart}
      className="floating-cart-btn"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        border: '1px solid #374151',
        color: 'white',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        zIndex: 9999
      }}
    >
      🛒
      <span 
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}
      >
        {itemCount}
      </span>
    </button>
  );
};

// Main App Component
const App = () => {
  const products = [
    {
      id: 'product-001',
      name: 'Premium Widget',
      price: 2999,
      image: 'https://picsum.photos/seed/product1/400/300.jpg'
    },
    {
      id: 'product-002',
      name: 'Pro Gadget',
      price: 4599,
      image: 'https://picsum.photos/seed/product2/400/300.jpg'
    },
    {
      id: 'product-003',
      name: 'Deluxe Package',
      price: 7899,
      image: 'https://picsum.photos/seed/product3/400/300.jpg'
    },
    {
      id: 'product-004',
      name: 'Starter Kit',
      price: 1299,
      image: 'https://picsum.photos/seed/product4/400/300.jpg'
    },
    {
      id: 'product-005',
      name: 'Professional Suite',
      price: 12999,
      image: 'https://picsum.photos/seed/product5/400/300.jpg'
    },
    {
      id: 'product-006',
      name: 'Basic Plan',
      price: 899,
      image: 'https://picsum.photos/seed/product6/400/300.jpg'
    }
  ];

  return (
    <RouteBaseCartProvider merchantId="demo-merchant-123">
      <div className="app">
        <header className="header">
          <h1>RouteBase React Store</h1>
          <CartSummary />
        </header>
        
        <main className="main">
          <div className="products-grid">
            {products.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </main>
        
        <FloatingCartButton />
      </div>
    </RouteBaseCartProvider>
  );
};

export default App;

// CSS Styles (you can move this to a separate CSS file)
const styles = `
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  padding: 20px 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  color: #333;
}

.cart-summary {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.item-count {
  color: #666;
}

.total {
  font-weight: bold;
  color: #2563eb;
  font-size: 18px;
}

.view-cart-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.main {
  padding: 40px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.product-price {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
  margin: 0 0 15px 0;
}

.add-to-cart-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.add-to-cart-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
  
  .main {
    padding: 20px;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
