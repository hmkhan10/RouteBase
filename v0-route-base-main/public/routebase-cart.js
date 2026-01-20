(function() {
    'use strict';
    
    // RouteBase Embedded Shopping Cart
    const RouteBaseCart = {
        config: {
            merchantId: null,
            apiBaseUrl: null,
            theme: 'dark',
            currency: 'PKR'
        },
        
        cart: [],
        isOpen: false,
        
        // Initialize the cart
        init: function(merchantId, options = {}) {
            this.config.merchantId = merchantId;
            this.config.apiBaseUrl = options.apiBaseUrl || window.location.origin;
            this.config.theme = options.theme || 'dark';
            this.config.currency = options.currency || 'PKR';
            
            this.loadCart();
            this.createCartUI();
            this.attachEventListeners();
            this.updateCartButton();
        },
        
        // Load cart from localStorage
        loadCart: function() {
            const saved = localStorage.getItem(`routebase_cart_${this.config.merchantId}`);
            if (saved) {
                try {
                    this.cart = JSON.parse(saved);
                } catch (e) {
                    this.cart = [];
                }
            }
        },
        
        // Save cart to localStorage
        saveCart: function() {
            localStorage.setItem(`routebase_cart_${this.config.merchantId}`, JSON.stringify(this.cart));
        },
        
        // Add item to cart
        addToCart: function(item) {
            const existingItem = this.cart.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity || 1;
            } else {
                this.cart.push({
                    id: item.id,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: item.quantity || 1,
                    image: item.image || '/placeholder-product.jpg'
                });
            }
            this.saveCart();
            this.updateCartUI();
            this.showNotification('Item added to cart');
        },
        
        // Remove item from cart
        removeFromCart: function(itemId) {
            this.cart = this.cart.filter(item => item.id !== itemId);
            this.saveCart();
            this.updateCartUI();
        },
        
        // Update item quantity
        updateQuantity: function(itemId, quantity) {
            const item = this.cart.find(i => i.id === itemId);
            if (item) {
                item.quantity = Math.max(1, parseInt(quantity));
                this.saveCart();
                this.updateCartUI();
            }
        },
        
        // Calculate total
        calculateTotal: function() {
            return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        
        // Create cart UI elements
        createCartUI: function() {
            // Create floating cart button
            const cartButton = document.createElement('div');
            cartButton.id = 'routebase-cart-button';
            cartButton.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                    border: 1px solid #374151;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                ">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    <span id="cart-count" style="
                        position: absolute;
                        top: -5px;
                        right: -5px;
                        background: #ef4444;
                        color: white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                    ">0</span>
                </div>
            `;
            
            // Create cart sidebar
            const cartSidebar = document.createElement('div');
            cartSidebar.id = 'routebase-cart-sidebar';
            cartSidebar.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 400px;
                    height: 100vh;
                    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
                    border-left: 1px solid #374151;
                    z-index: 10000;
                    transition: right 0.3s ease;
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="
                        padding: 20px;
                        border-bottom: 1px solid #374151;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h3 style="color: white; margin: 0; font-size: 18px; font-weight: 600;">Shopping Cart</h3>
                        <button id="close-cart" style="
                            background: none;
                            border: none;
                            color: #9ca3af;
                            cursor: pointer;
                            font-size: 24px;
                            padding: 0;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">&times;</button>
                    </div>
                    
                    <div id="cart-items" style="
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                    ">
                        <!-- Cart items will be inserted here -->
                    </div>
                    
                    <div style="
                        padding: 20px;
                        border-top: 1px solid #374151;
                        background: #111827;
                    ">
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 15px;
                            color: white;
                            font-size: 18px;
                            font-weight: 600;
                        ">
                            <span>Total:</span>
                            <span id="cart-total">${this.config.currency} 0</span>
                        </div>
                        <button id="checkout-btn" style="
                            width: 100%;
                            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                            color: white;
                            border: none;
                            padding: 15px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">Checkout</button>
                    </div>
                </div>
            `;
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.id = 'routebase-cart-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
                display: none;
            `;
            
            document.body.appendChild(cartButton);
            document.body.appendChild(cartSidebar);
            document.body.appendChild(overlay);
        },
        
        // Attach event listeners
        attachEventListeners: function() {
            // Cart button click
            document.getElementById('routebase-cart-button').addEventListener('click', () => {
                this.toggleCart();
            });
            
            // Close cart button
            document.getElementById('close-cart').addEventListener('click', () => {
                this.closeCart();
            });
            
            // Overlay click
            document.getElementById('routebase-cart-overlay').addEventListener('click', () => {
                this.closeCart();
            });
            
            // Checkout button
            document.getElementById('checkout-btn').addEventListener('click', () => {
                this.checkout();
            });
            
            // Add to cart buttons with data-rb-id attribute
            document.addEventListener('click', (e) => {
                const button = e.target.closest('[data-rb-id]');
                if (button) {
                    const productId = button.getAttribute('data-rb-id');
                    const productName = button.getAttribute('data-rb-name') || 'Product ' + productId;
                    const productPrice = button.getAttribute('data-rb-price') || '0';
                    const productImage = button.getAttribute('data-rb-image') || '/placeholder-product.jpg';
                    
                    this.addToCart({
                        id: productId,
                        name: productName,
                        price: productPrice,
                        image: productImage,
                        quantity: 1
                    });
                }
            });
        },
        
        // Toggle cart sidebar
        toggleCart: function() {
            if (this.isOpen) {
                this.closeCart();
            } else {
                this.openCart();
            }
        },
        
        // Open cart sidebar
        openCart: function() {
            this.isOpen = true;
            document.getElementById('routebase-cart-sidebar').style.right = '0';
            document.getElementById('routebase-cart-overlay').style.display = 'block';
            this.updateCartUI();
        },
        
        // Close cart sidebar
        closeCart: function() {
            this.isOpen = false;
            document.getElementById('routebase-cart-sidebar').style.right = '-400px';
            document.getElementById('routebase-cart-overlay').style.display = 'none';
        },
        
        // Update cart UI
        updateCartUI: function() {
            this.updateCartButton();
            this.updateCartItems();
            this.updateCartTotal();
        },
        
        // Update cart button count
        updateCartButton: function() {
            const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            const countElement = document.getElementById('cart-count');
            if (countElement) {
                countElement.textContent = count;
                countElement.style.display = count > 0 ? 'flex' : 'none';
            }
        },
        
        // Update cart items display
        updateCartItems: function() {
            const container = document.getElementById('cart-items');
            if (!container) return;
            
            if (this.cart.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: #9ca3af; padding: 40px 20px;">
                        <svg width="64" height="64" fill="#9ca3af" viewBox="0 0 24 24" style="margin: 0 auto 20px;">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        <p>Your cart is empty</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = this.cart.map(item => `
                <div style="
                    background: #1f2937;
                    border: 1px solid #374151;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    display: flex;
                    gap: 15px;
                ">
                    <img src="${item.image}" alt="${item.name}" style="
                        width: 60px;
                        height: 60px;
                        object-fit: cover;
                        border-radius: 6px;
                        background: #374151;
                    " onerror="this.src='/placeholder-product.jpg'">
                    
                    <div style="flex: 1;">
                        <h4 style="color: white; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${item.name}</h4>
                        <p style="color: #3b82f6; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">${this.config.currency} ${item.price.toFixed(2)}</p>
                        
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button onclick="window.RouteBaseCart.updateQuantity('${item.id}', ${item.quantity - 1})" style="
                                background: #374151;
                                border: 1px solid #4b5563;
                                color: white;
                                width: 28px;
                                height: 28px;
                                border-radius: 4px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 16px;
                            ">-</button>
                            
                            <span style="color: white; min-width: 30px; text-align: center;">${item.quantity}</span>
                            
                            <button onclick="window.RouteBaseCart.updateQuantity('${item.id}', ${item.quantity + 1})" style="
                                background: #374151;
                                border: 1px solid #4b5563;
                                color: white;
                                width: 28px;
                                height: 28px;
                                border-radius: 4px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 16px;
                            ">+</button>
                            
                            <button onclick="window.RouteBaseCart.removeFromCart('${item.id}')" style="
                                background: #ef4444;
                                border: none;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 12px;
                                margin-left: auto;
                            ">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        },
        
        // Update cart total
        updateCartTotal: function() {
            const totalElement = document.getElementById('cart-total');
            if (totalElement) {
                totalElement.textContent = `${this.config.currency} ${this.calculateTotal().toFixed(2)}`;
            }
        },
        
        // Show notification
        showNotification: function(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10001;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        },
        
        // Checkout
        checkout: async function() {
            if (this.cart.length === 0) {
                this.showNotification('Your cart is empty');
                return;
            }
            
            try {
                const response = await fetch(`${this.config.apiBaseUrl}/api/checkout/session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        merchant_id: this.config.merchantId,
                        items: this.cart,
                        total: this.calculateTotal()
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.showNotification('Checkout successful!');
                    this.cart = [];
                    this.saveCart();
                    this.updateCartUI();
                    this.closeCart();
                    
                    // Redirect to checkout page if URL is provided
                    if (data.checkout_url) {
                        window.location.href = data.checkout_url;
                    }
                } else {
                    throw new Error('Checkout failed');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                this.showNotification('Checkout failed. Please try again.');
            }
        }
    };
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @media (max-width: 768px) {
            #routebase-cart-sidebar {
                width: 100% !important;
                right: -100% !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Make RouteBaseCart globally available
    window.RouteBaseCart = RouteBaseCart;
    
})();
