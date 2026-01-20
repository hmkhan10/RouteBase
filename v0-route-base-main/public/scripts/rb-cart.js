(function () {
    // Configuration
    const CONFIG = {
        merchantId: window.RB_MERCHANT_ID || 'default',
        apiUrl: 'https://route-base.vercel.app/api', // Update with actual production URL
        theme: {
            primary: '#10B981', // Emerald 500
            bg: '#0A0C10',
            card: '#161B22',
            text: '#F0F6FC',
            muted: '#8B949E'
        }
    };

    // State Management
    let cart = JSON.parse(localStorage.getItem(`rb_cart_${CONFIG.merchantId}`)) || [];
    let isSidebarOpen = false;

    // Styles Injection
    const injectStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
            
            #rb-cart-container {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                color: ${CONFIG.theme.text};
            }

            .rb-glass {
                background: rgba(22, 27, 34, 0.8);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .rb-sidebar {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                z-index: 9999;
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: -10px 0 30px rgba(0,0,0,0.5);
            }

            .rb-sidebar.open {
                right: 0;
            }

            .rb-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.6);
                z-index: 9998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .rb-overlay.open {
                opacity: 1;
                visibility: visible;
            }

            .rb-floating-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: ${CONFIG.theme.primary};
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 9997;
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .rb-floating-btn:hover {
                transform: scale(1.1);
            }

            .rb-cart-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #EF4444;
                color: white;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                border: 2px solid ${CONFIG.theme.bg};
            }

            .rb-item-qty-btn {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                background: rgba(255,255,255,0.05);
                transition: background 0.2s;
            }

            .rb-item-qty-btn:hover {
                background: rgba(255,255,255,0.1);
            }
        `;
        document.head.appendChild(style);
    };

    // UI Components
    const createUI = () => {
        const container = document.createElement('div');
        container.id = 'rb-cart-container';

        container.innerHTML = `
            <div id="rb-overlay" class="rb-overlay"></div>
            <div id="rb-sidebar" class="rb-sidebar rb-glass flex flex-col">
                <div class="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 class="text-xl font-black uppercase tracking-tight">Your Cart</h2>
                    <button id="rb-close-cart" class="text-muted hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div id="rb-cart-items" class="flex-1 overflow-y-auto p-6 space-y-6">
                    <!-- Items will be injected here -->
                </div>

                <div class="p-6 border-t border-white/10 bg-white/5 space-y-4">
                    <div class="flex items-center justify-between font-bold">
                        <span class="text-muted uppercase text-xs tracking-widest">Subtotal</span>
                        <span id="rb-cart-total" class="text-xl">PKR 0.00</span>
                    </div>
                    <button id="rb-checkout-btn" class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest rounded-xl transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20">
                        Checkout Now
                    </button>
                    <p class="text-[10px] text-center text-muted uppercase tracking-widest">Secure checkout by RouteBases</p>
                </div>
            </div>

            <div id="rb-floating-btn" class="rb-floating-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span id="rb-cart-count" class="rb-cart-badge">0</span>
            </div>
        `;

        document.body.appendChild(container);
    };

    // Cart Logic
    const updateCartUI = () => {
        const itemsContainer = document.getElementById('rb-cart-items');
        const countBadge = document.getElementById('rb-cart-count');
        const totalDisplay = document.getElementById('rb-cart-total');

        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <p class="text-sm font-medium">Your cart is empty</p>
                </div>
            `;
            countBadge.style.display = 'none';
            totalDisplay.textContent = 'PKR 0.00';
            return;
        }

        countBadge.style.display = 'block';
        countBadge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

        itemsContainer.innerHTML = cart.map(item => `
            <div class="flex gap-4 group">
                <div class="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                    <img src="${item.image || 'https://via.placeholder.com/80'}" class="w-full h-full object-cover" alt="${item.name}">
                </div>
                <div class="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-sm leading-tight">${item.name}</h3>
                            <button onclick="RB_CART.remove('${item.id}')" class="text-muted hover:text-red-400 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <p class="text-emerald-400 text-xs font-bold mt-1">PKR ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="RB_CART.updateQty('${item.id}', -1)" class="rb-item-qty-btn text-muted hover:text-white">-</button>
                        <span class="text-xs font-mono font-bold w-4 text-center">${item.qty}</span>
                        <button onclick="RB_CART.updateQty('${item.id}', 1)" class="rb-item-qty-btn text-muted hover:text-white">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        totalDisplay.textContent = `PKR ${total.toLocaleString()}`;
    };

    const saveCart = () => {
        localStorage.setItem(`rb_cart_${CONFIG.merchantId}`, JSON.stringify(cart));
        updateCartUI();
    };

    // Public API
    window.RB_CART = {
        toggle: () => {
            isSidebarOpen = !isSidebarOpen;
            document.getElementById('rb-sidebar').classList.toggle('open', isSidebarOpen);
            document.getElementById('rb-overlay').classList.toggle('open', isSidebarOpen);
        },
        add: (item) => {
            const existing = cart.find(i => i.id === item.id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ ...item, qty: 1 });
            }
            saveCart();
            if (!isSidebarOpen) window.RB_CART.toggle();
        },
        remove: (id) => {
            cart = cart.filter(i => i.id !== id);
            saveCart();
        },
        updateQty: (id, delta) => {
            const item = cart.find(i => i.id === id);
            if (item) {
                item.qty += delta;
                if (item.qty <= 0) {
                    window.RB_CART.remove(id);
                } else {
                    saveCart();
                }
            }
        },
        checkout: async () => {
            const btn = document.getElementById('rb-checkout-btn');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Processing...';

            try {
                const response = await fetch(`${CONFIG.apiUrl}/checkout/session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        merchantId: CONFIG.merchantId,
                        items: cart
                    })
                });

                const data = await response.json();
                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    throw new Error(data.message || 'Checkout failed');
                }
            } catch (error) {
                console.error('RB Checkout Error:', error);
                alert('Checkout failed. Please try again.');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    };

    // Initialization
    const init = () => {
        injectStyles();
        createUI();
        updateCartUI();

        // Event Listeners
        document.getElementById('rb-floating-btn').onclick = window.RB_CART.toggle;
        document.getElementById('rb-close-cart').onclick = window.RB_CART.toggle;
        document.getElementById('rb-overlay').onclick = window.RB_CART.toggle;
        document.getElementById('rb-checkout-btn').onclick = window.RB_CART.checkout;

        // Global click listener for Add to Cart buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-rb-id]');
            if (btn) {
                const item = {
                    id: btn.getAttribute('data-rb-id'),
                    name: btn.getAttribute('data-rb-name'),
                    price: parseFloat(btn.getAttribute('data-rb-price')),
                    image: btn.getAttribute('data-rb-image')
                };
                window.RB_CART.add(item);
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
