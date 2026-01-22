// Beruni Intelligence Universal SDK v2.0
// Shadow DOM implementation with Ghomoud AI Upselling

export interface SDKConfig {
  merchantId: string
  domain: string
  tier: 'FREE' | 'PRO'
  apiEndpoint: string
  shadowRootId: string
}

export interface UserAction {
  type: 'click' | 'scroll' | 'view' | 'hover'
  target: string
  timestamp: number
  value?: number
  device?: 'mobile' | 'desktop' | 'tablet'
}

export interface AIRecommendation {
  type: 'premium_product' | 'discount_offer' | 'express_delivery'
  title: string
  description: string
  discount: number
  priority: 'high' | 'medium' | 'low'
}

export class BeruniUniversalSDK {
  private config: SDKConfig
  private shadowHost: HTMLElement | null = null
  private shadowRoot: ShadowRoot | null = null
  private userActions: UserAction[] = []
  private aiEngine: GhomoudAI | null = null

  constructor(config: SDKConfig) {
    this.config = config
    this.init()
  }

  private init(): void {
    console.log('🚀 Beruni Intelligence SDK initialized')
    this.createShadowRoot()
    this.createCheckoutButtons()
    
    // Initialize Ghomoud AI for Pro tier
    if (this.config.tier === 'PRO') {
      this.aiEngine = new GhomoudAI()
      this.startBehaviorTracking()
    }
  }

  private createShadowRoot(): void {
    this.shadowHost = document.createElement('div')
    this.shadowHost.id = this.config.shadowRootId
    this.shadowHost.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      pointer-events: none;
      display: none;
    `
    
    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'closed' })
    this.injectStyles()
    document.body.appendChild(this.shadowHost)
  }

  private injectStyles(): void {
    if (!this.shadowRoot) return
    
    const style = document.createElement('style')
    style.textContent = `
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .beruni-checkout-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(4px);
        pointer-events: auto;
      }
      
      .beruni-checkout-modal {
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 480px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        animation: beruniSlideIn 0.3s ease-out;
      }
      
      @keyframes beruniSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .beruni-button {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
        width: 100%;
      }
      
      .beruni-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3);
      }
      
      .beruni-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 16px;
        margin-bottom: 16px;
        transition: border-color 0.2s;
      }
      
      .beruni-input:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
      
      .beruni-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #374151;
      }
      
      .beruni-ai-recommendations {
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        border: 1px solid #86efac;
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
      }
      
      .beruni-ai-title {
        color: #166534;
        font-weight: 600;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .beruni-product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }
      
      .beruni-product-card {
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .beruni-product-card:hover {
        border-color: #10b981;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }
      
      .beruni-product-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: #1f2937;
      }
      
      .beruni-product-desc {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 8px;
      }
      
      .beruni-product-price {
        color: #059669;
        font-weight: 600;
        font-size: 14px;
      }
      
      .beruni-close-btn {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        font-size: 14px;
        margin-top: 8px;
        text-decoration: underline;
      }
      
      .beruni-close-btn:hover {
        color: #374151;
      }
    `
    
    this.shadowRoot.appendChild(style)
  }

  private createCheckoutButtons(): void {
    const buttons = document.querySelectorAll('[data-beruni-checkout]')
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        this.openCheckout()
      })
    })
  }

  private startBehaviorTracking(): void {
    // Track user behavior for AI analysis
    document.addEventListener('click', (e) => {
      this.userActions.push({
        type: 'click',
        target: (e.target as HTMLElement).tagName,
        timestamp: Date.now(),
        value: this.extractValue(e.target as HTMLElement)
      })
    })

    document.addEventListener('scroll', () => {
      this.userActions.push({
        type: 'scroll',
        target: 'document',
        timestamp: Date.now()
      })
    })

    // Track device type
    const device = this.detectDevice()
    this.userActions.push({
      type: 'view',
      target: 'page',
      timestamp: Date.now(),
      device
    })
  }

  private detectDevice(): 'mobile' | 'desktop' | 'tablet' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  private extractValue(element: HTMLElement): number {
    // Extract monetary value from elements if present
    const text = element.textContent || ''
    const match = text.match(/[\d,]+/)
    return match ? parseInt(match[0].replace(/,/g, '')) : 0
  }

  public openCheckout(productData: any = {}): void {
    if (!this.shadowHost || !this.shadowRoot) return

    this.shadowHost.style.display = 'block'
    
    const overlay = document.createElement('div')
    overlay.className = 'beruni-checkout-overlay'
    
    const modal = document.createElement('div')
    modal.className = 'beruni-checkout-modal'
    
    modal.innerHTML = `
      <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
        Complete Your Purchase
      </h2>
      
      <div style="margin-bottom: 16px;">
        <label class="beruni-label">Email</label>
        <input type="email" class="beruni-input" placeholder="customer@example.com" />
      </div>
      
      <div style="margin-bottom: 16px;">
        <label class="beruni-label">Amount (PKR)</label>
        <input type="number" class="beruni-input" placeholder="1000" />
      </div>
      
      <div id="beruni-ai-recommendations"></div>
      
      <button class="beruni-button" style="margin-top: 16px;">
        Pay Now
      </button>
      
      <button class="beruni-close-btn" onclick="this.closest('.beruni-checkout-overlay').remove()">
        Cancel
      </button>
    `
    
    overlay.appendChild(modal)
    this.shadowRoot.appendChild(overlay)
    
    // Trigger AI analysis for Pro tier
    if (this.config.tier === 'PRO' && this.aiEngine) {
      setTimeout(() => {
        const recommendations = this.aiEngine.analyzeBehavior(this.userActions)
        if (recommendations.length > 0) {
          this.showAIRecommendations(recommendations)
        }
      }, 2000)
    }
  }

  private showAIRecommendations(recommendations: AIRecommendation[]): void {
    const container = this.shadowRoot?.getElementById('beruni-ai-recommendations')
    if (!container) return

    container.innerHTML = `
      <div class="beruni-ai-recommendations">
        <h3 class="beruni-ai-title">
          🤖 Ghomoud AI Recommendations
        </h3>
        <div class="beruni-product-grid">
          ${recommendations.map(rec => `
            <div class="beruni-product-card">
              <div class="beruni-product-title">${rec.title}</div>
              <div class="beruni-product-desc">${rec.description}</div>
              <div class="beruni-product-price">Save ${rec.discount}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  public closeCheckout(): void {
    if (this.shadowHost) {
      this.shadowHost.remove()
      this.shadowHost = null
      this.shadowRoot = null
    }
  }
}

// Ghomoud AI Engine for Pro tier
export class GhomoudAI {
  analyzeBehavior(actions: UserAction[]): AIRecommendation[] {
    const patterns = this.detectPatterns(actions)
    const recommendations: AIRecommendation[] = []

    if (patterns.highValueCart) {
      recommendations.push({
        type: 'premium_product',
        title: 'Premium Protection Plan',
        description: 'Add warranty protection for high-value items',
        discount: 10,
        priority: 'high'
      })
    }

    if (patterns.abandonedCart) {
      recommendations.push({
        type: 'discount_offer',
        title: 'Limited Time Offer',
        description: 'Complete your purchase now and save 15%',
        discount: 15,
        priority: 'high'
      })
    }

    if (patterns.mobileUser) {
      recommendations.push({
        type: 'express_delivery',
        title: 'Express Delivery',
        description: 'Get your order faster with express shipping',
        discount: 0,
        priority: 'medium'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private detectPatterns(actions: UserAction[]) {
    const recentActions = actions.filter(a => Date.now() - a.timestamp < 300000) // Last 5 minutes
    
    return {
      highValueCart: recentActions.some(a => a.value && a.value > 5000),
      abandonedCart: recentActions.filter(a => a.type === 'view').length > 3,
      mobileUser: recentActions.some(a => a.device === 'mobile'),
      clickFrequency: recentActions.filter(a => a.type === 'click').length,
      scrollDepth: this.calculateScrollDepth(recentActions)
    }
  }

  private calculateScrollDepth(actions: UserAction[]): number {
    const scrollActions = actions.filter(a => a.type === 'scroll')
    return Math.min(scrollActions.length * 10, 100) // Simple calculation
  }
}

// Auto-initialization
declare global {
  interface Window {
    BeruniSDK: BeruniUniversalSDK
  }
}

// Initialize SDK when DOM is ready
function initializeSDK() {
  const config: SDKConfig = {
    merchantId: (window as any).BERUNI_MERCHANT_ID || 'demo',
    domain: (window as any).BERUNI_DOMAIN || window.location.hostname,
    tier: ((window as any).BERUNI_TIER || 'FREE') as 'FREE' | 'PRO',
    apiEndpoint: (window as any).BERUNI_API_ENDPOINT || 'https://api.beruni.ai/v1',
    shadowRootId: 'beruni-shadow-root'
  }

  window.BeruniSDK = new BeruniUniversalSDK(config)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSDK)
} else {
  initializeSDK()
}
