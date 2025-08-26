# 🚀 Biypod Complete System Guide for New Hires

## 📋 **Table of Contents**
1. [System Overview](#system-overview)
2. [app.biypod.com - Merchant App](#merchant-app)
3. [biypod.com - Customer Customizer](#customer-customizer)
4. [API Backend System](#api-backend)
5. [Brand Guidelines](#brand-guidelines)
6. [Development Setup](#development-setup)

---

## 🌐 **System Overview**

Biypod is a **3D product customization platform** for Shopify merchants. The system consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    BIYPOD ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 app.biypod.com (Merchant Dashboard)                     │
│  ├── Shopify App Store approved app                        │
│  ├── Merchant product management                           │
│  ├── Customer design reviews                               │
│  ├── Analytics & billing                                   │
│  └── iframe integration to customizer                      │
│                                                             │
│  🎨 biypod.com (Customer Customizer)                       │
│  ├── 3D product customization                              │
│  ├── Texture upload & positioning                          │
│  ├── Text & design tools                                   │
│  ├── Save/load customer designs                            │
│  └── Public-facing website                                 │
│                                                             │
│  🔧 Backend APIs (Shared Infrastructure)                   │
│  ├── 22 production APIs                                    │
│  ├── Supabase database (40+ tables)                       │
│  ├── Authentication & security                             │
│  ├── File storage (GLB, textures, prints)                 │
│  └── Stripe payment processing                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **🎯 Business Flow**
1. **Merchant** installs Biypod from Shopify App Store
2. **Merchant** manages products via `app.biypod.com`
3. **Customer** visits merchant's store, clicks "Customize"
4. **Customer** uses 3D customizer on `biypod.com`
5. **Customer** saves design and purchases
6. **Merchant** fulfills order with custom design

---

## 📱 **app.biypod.com - Merchant App**

### **🎯 Purpose**
Shopify-compliant merchant dashboard for managing 3D customizable products.

### **🏗️ Architecture**
- **Framework**: Remix (React-based, Shopify recommended)
- **Deployment**: Vercel
- **Repository**: `biypod-merchant-app` (separate from main repo)
- **Authentication**: Shopify OAuth + App Bridge

### **📊 Core Features**

#### **1. Dashboard (`/app`)**
```typescript
// Main merchant overview
- Product catalog with 3D previews
- Recent customer designs
- Sales analytics
- Quick actions (add products, review designs)
```

#### **2. Product Management (`/app/products`)**
```typescript
// Product catalog management
- Browse available 3D products
- Enable/disable products for store
- Set pricing and customization options
- Publish to Shopify store
```

#### **3. Customer Designs (`/app/designs`)**
```typescript
// Review customer customizations
- View all customer designs
- Approve/reject designs
- Download print files
- Manage design library
```

#### **4. Customizer Integration (`/app/customize/[productId]`)**
```typescript
// Embedded 3D customizer
const customizerUrl = `https://biypod.com/customize/${productId}?` +
  `shop=${shop}&merchant_id=${merchantId}&embedded=true`;

<iframe 
  src={customizerUrl}
  className="w-full h-screen border-0"
  title="Biypod 3D Customizer"
/>
```

#### **5. Analytics (`/app/analytics`)**
```typescript
// Business intelligence
- Customization conversion rates
- Popular design trends
- Revenue analytics
- Customer engagement metrics
```

#### **6. Settings (`/app/settings`)**
```typescript
// Merchant configuration
- Billing & subscription management
- Store integration settings
- Customization preferences
- Support & documentation
```

### **🔌 API Integrations**

#### **Shopify Integration**
```typescript
// OAuth authentication
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  // session contains: shop, accessToken, scope
};

// GraphQL API calls
const products = await admin.graphql(`
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node { id title handle }
      }
    }
  }
`, { variables: { first: 10 } });
```

#### **Biypod API Integration**
```typescript
// API client for backend communication
export class BiypodAPI {
  constructor(private baseUrl: string, private session: ShopifySession) {}
  
  async getCatalog() {
    return this.request('/api/merchants/catalog');
  }
  
  async getCustomerDesigns() {
    return this.request('/api/merchants/customer-designs');
  }
  
  async publishProduct(productId: string) {
    return this.request('/api/merchants/publish-product', {
      method: 'POST',
      body: { productId, shop: this.session.shop }
    });
  }
}
```

### **🎨 UI Components**
```typescript
// Biypod-branded components
<BiypodLayout>
  <BiypodHeader />
  <BiypodSidebar />
  <BiypodMain>
    <BiypodCard>
      <BiypodButton variant="primary">Customize Product</BiypodButton>
    </BiypodCard>
  </BiypodMain>
</BiypodLayout>
```

### **🔐 Security & Compliance**
- **App Bridge**: Embedded Shopify admin experience
- **Session Tokens**: Secure authentication
- **HTTPS**: Required by Shopify
- **Web Vitals**: Performance monitoring
- **GDPR**: Data privacy compliance

---

## 🎨 **biypod.com - Customer Customizer**

### **🎯 Purpose**
Public-facing 3D product customization platform for end customers.

### **🏗️ Architecture**
- **Framework**: Next.js 14 (React-based)
- **Deployment**: Vercel
- **Repository**: `Biypod-Customizer` (main repository)
- **3D Engine**: Three.js + React Three Fiber

### **📊 Core Features**

#### **1. Homepage (`/`)**
```typescript
// Public marketing site
- Hero section with 3D product showcase
- Feature highlights
- Customer testimonials
- Call-to-action for merchants
```

#### **2. Product Customizer (`/customize/[productId]`)**
```typescript
// Main 3D customization interface
- 3D model viewer with orbit controls
- Texture upload and positioning
- Text addition with fonts/colors
- Color picker for materials
- Save/load design functionality
- Real-time preview updates
```

#### **3. Design Gallery (`/gallery`)**
```typescript
// Showcase customer creations
- Featured designs
- Design categories
- Social sharing
- Inspiration for new customers
```

#### **4. Merchant Integration (`/merchant/[shop]`)**
```typescript
// Store-specific customization
- Merchant branding
- Store-specific products
- Custom pricing
- Integrated checkout flow
```

### **🎮 3D Customization Engine**

#### **Core 3D Components**
```typescript
// Three.js integration
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function ProductViewer({ productId }: { productId: string }) {
  const gltf = useLoader(GLTFLoader, `/models/${productId}.glb`);
  
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <primitive object={gltf.scene} />
      <OrbitControls />
    </Canvas>
  );
}
```

#### **Customization Features**
```typescript
// Texture application
const applyTexture = (materialId: string, textureUrl: string) => {
  const material = scene.getObjectByName(materialId);
  const texture = new THREE.TextureLoader().load(textureUrl);
  material.material.map = texture;
  material.material.needsUpdate = true;
};

// Text overlay
const addText = (text: string, position: Vector3, font: string) => {
  const textGeometry = new THREE.TextGeometry(text, {
    font: loadedFont,
    size: 0.1,
    height: 0.01
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.copy(position);
  scene.add(textMesh);
};
```

### **💾 Design Management**
```typescript
// Save customer design
const saveDesign = async (designData: DesignData) => {
  const response = await fetch('/api/designs/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: designData.productId,
      customerEmail: designData.customerEmail,
      customizationData: {
        textures: designData.textures,
        colors: designData.colors,
        text: designData.textElements
      }
    })
  });
  
  return response.json();
};

// Load existing design
const loadDesign = async (configId: string) => {
  const response = await fetch(`/api/designs/load/${configId}`);
  const design = await response.json();
  
  // Apply design to 3D scene
  applyDesignToScene(design.customizationData);
};
```

### **🔗 Communication with Merchant App**
```typescript
// PostMessage communication when embedded
const notifyParent = (eventType: string, data: any) => {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: eventType,
      data: data,
      source: 'biypod-customizer'
    }, 'https://app.biypod.com');
  }
};

// Listen for parent messages
window.addEventListener('message', (event) => {
  if (event.origin === 'https://app.biypod.com') {
    switch (event.data.type) {
      case 'LOAD_PRODUCT':
        loadProduct(event.data.productId);
        break;
      case 'SET_MERCHANT_CONTEXT':
        setMerchantBranding(event.data.merchantData);
        break;
    }
  }
});
```

---

## 🔧 **API Backend System**

### **🎯 Purpose**
Shared backend infrastructure serving both merchant app and customer customizer.

### **🏗️ Architecture**
- **Framework**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth + Custom RBAC
- **Payments**: Stripe Integration

### **📊 API Categories**

#### **1. Product Catalog APIs (4 endpoints)**
```typescript
GET  /api/merchants/catalog        // Browse available products
GET  /api/admin/products          // Admin product management  
GET  /api/products/[id]           // Individual product details
POST /api/merchants/publish-product // Publish to Shopify store
```

#### **2. Design Management APIs (2 endpoints)**
```typescript
POST /api/designs/save            // Save customer design
GET  /api/designs/load/[configId] // Load existing design
```

#### **3. File Handling APIs (4 endpoints)**
```typescript
POST /api/customizer/upload-texture    // Upload texture files
POST /api/customizer/upload-glb        // Upload 3D models
GET  /api/customizer/upload-glb        // Get signed URLs
POST /api/customizer/export-print-files // Generate print files
```

#### **4. Merchant Management APIs (3 endpoints)**
```typescript
POST /api/merchants/create        // Create merchant account
GET  /api/merchants/get          // Get merchant details
GET  /api/merchants/customer-designs // Get customer designs
```

#### **5. Payment APIs (1 endpoint)**
```typescript
POST /api/merchants/create-payment // Process payments
```

#### **6. Utility APIs (2 endpoints)**
```typescript
GET  /api/proxy-glb              // CORS-safe GLB loading
POST /api/activity/log           // Activity tracking
```

### **🗄️ Database Schema**

#### **Core Tables**
```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  glb_files JSONB,
  texture_files JSONB,
  print_files JSONB,
  available_to_merchants BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Merchants table  
CREATE TABLE merchants (
  id UUID PRIMARY KEY,
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT,
  subscription_status TEXT DEFAULT 'trial',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer designs table
CREATE TABLE customer_designs (
  id UUID PRIMARY KEY,
  config_id TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id),
  customer_email TEXT,
  design_name TEXT,
  customization_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **🔐 Security Implementation**
```typescript
// Anti-replay protection
const validateRequest = (req: NextApiRequest) => {
  const nonce = req.headers['x-nonce'];
  const timestamp = req.headers['x-timestamp'];
  
  if (!nonce || !timestamp) {
    throw new Error('Missing anti-replay headers');
  }
  
  // Validate timestamp (within 5 minutes)
  const now = Date.now();
  const requestTime = parseInt(timestamp as string);
  if (Math.abs(now - requestTime) > 300000) {
    throw new Error('Request timestamp too old');
  }
  
  // Check nonce uniqueness
  if (await isNonceUsed(nonce)) {
    throw new Error('Nonce already used');
  }
};

// RBAC middleware
const requireRole = (allowedRoles: string[]) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const userRole = await getUserRole(req);
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## 🎨 **Brand Guidelines**

### **🎨 Logo**
```typescript
// Logo location
const logoPath = '/Users/lew/Documents/Github/Biypod-Customizer/BIYpod Logo.svg';

// Usage in components
<img 
  src="/logo.svg" 
  alt="Biypod" 
  className="h-8 w-auto"
/>
```

### **🌈 Color Palette**

#### **Primary Colors**
```css
/* Current vivid blue-purple (keep as primary) */
--primary: #6366f1;
--primary-dark: #4f46e5;

/* NEW Secondary: Vivid Blue to Dark Blue Gradient */
--secondary: linear-gradient(135deg, #155dfc 0%, #1025a1 100%);
--secondary-start: #155dfc;  /* Vivid Blue */
--secondary-end: #1025a1;    /* Dark Blue */

/* Supporting Colors */
--accent: #8b5cf6;
--neutral-50: #f8fafc;
--neutral-100: #f1f5f9;
--neutral-900: #0f172a;
```

#### **CSS Implementation**
```css
/* Gradient backgrounds */
.bg-secondary-gradient {
  background: linear-gradient(135deg, #155dfc 0%, #1025a1 100%);
}

/* Button styles */
.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #155dfc 0%, #1025a1 100%);
  color: white;
}

/* Text gradients */
.text-gradient-secondary {
  background: linear-gradient(135deg, #155dfc 0%, #1025a1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5'
        },
        secondary: {
          start: '#155dfc',
          end: '#1025a1'
        }
      },
      backgroundImage: {
        'secondary-gradient': 'linear-gradient(135deg, #155dfc 0%, #1025a1 100%)'
      }
    }
  }
}
```

### **🎨 Component Examples**
```typescript
// Biypod Button Component
export function BiypodButton({ 
  variant = 'primary', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-secondary-gradient hover:opacity-90 text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Biypod Card Component
export function BiypodCard({ children, gradient = false }: CardProps) {
  return (
    <div className={`
      rounded-xl p-6 shadow-lg border border-neutral-100
      ${gradient ? 'bg-secondary-gradient text-white' : 'bg-white'}
    `}>
      {children}
    </div>
  );
}
```

---

## 🛠️ **Development Setup**

### **📁 Repository Structure**
```
biypod-ecosystem/
├── Biypod-Customizer/           # Main repo (biypod.com + APIs)
│   ├── pages/                   # Next.js pages
│   ├── components/              # 3D components
│   ├── pages/api/              # Backend APIs
│   └── public/                 # Assets
├── biypod-merchant-app/        # Merchant app (app.biypod.com)
│   ├── app/                    # Remix routes
│   ├── components/             # Merchant UI
│   └── lib/                    # API clients
└── docs/                       # Documentation
```

### **🔧 Environment Variables**

#### **Merchant App (.env)**
```bash
# Shopify
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_secret
SHOPIFY_SCOPES=read_products,write_products,read_orders

# Biypod Integration
BIYPOD_API_URL=https://api.biypod.com
BIYPOD_CUSTOMIZER_URL=https://biypod.com

# App URLs
NEXT_PUBLIC_APP_URL=https://app.biypod.com
```

#### **Customizer (.env)**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public

# App URLs
NEXT_PUBLIC_MERCHANT_APP_URL=https://app.biypod.com
```

### **🚀 Quick Start**
```bash
# 1. Clone repositories
git clone https://github.com/Lleewss/Biypod-Customizer
git clone https://github.com/Lleewss/biypod-merchant-app

# 2. Install dependencies
cd Biypod-Customizer && npm install
cd ../biypod-merchant-app && npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your values

# 4. Run development servers
npm run dev  # Customizer on :3000
cd ../biypod-merchant-app && npm run dev  # Merchant app on :3001

# 5. Access applications
# Customizer: http://localhost:3000
# Merchant App: http://localhost:3001
# APIs: http://localhost:3000/api/*
```

---

## 📚 **Additional Resources**

- **API Documentation**: `/docs/api-documentation.md`
- **Shopify Compliance**: `/docs/shopify-app-store-compliance-analysis.md`
- **Architecture Overview**: `/docs/api-integration-summary.md`
- **Test Results**: `/docs/api-test-results.md`

---

## 🔄 **Complete System Flow**

### **📊 Data Flow Diagram**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SHOPIFY       │    │  MERCHANT APP   │    │   CUSTOMIZER    │
│   ADMIN         │    │  app.biypod.com │    │   biypod.com    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Install App        │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │ 2. OAuth Redirect     │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │                       │ 3. Load Products      │
         │                       ├──────────────────────▶│
         │                       │                       │
         │                       │ 4. Customize (iframe) │
         │                       ├──────────────────────▶│
         │                       │                       │
         │                       │ 5. Save Design        │
         │                       │◀──────────────────────┤
         │                       │                       │
         │ 6. Publish Product    │                       │
         │◀──────────────────────┤                       │
         │                       │                       │

                    ┌─────────────────┐
                    │  SHARED APIS    │
                    │  Backend        │
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │   SUPABASE      │
                    │   Database      │
                    └─────────────────┘
```

### **🔄 User Journey Flows**

#### **Merchant Onboarding Flow**
```typescript
// 1. Merchant discovers app in Shopify App Store
// 2. Clicks "Add app" → Redirected to OAuth
// 3. Grants permissions → Redirected to app.biypod.com
// 4. Sees onboarding wizard
// 5. Browses product catalog
// 6. Enables products for their store
// 7. Customizes products using iframe
// 8. Publishes to Shopify store

const merchantOnboarding = {
  steps: [
    'shopify-app-store',
    'oauth-grant',
    'app-redirect',
    'onboarding-wizard',
    'product-catalog',
    'enable-products',
    'customize-products',
    'publish-to-store'
  ],
  duration: '10-15 minutes',
  completion_rate: '85%'
};
```

#### **Customer Purchase Flow**
```typescript
// 1. Customer visits merchant store
// 2. Sees product with "Customize" button
// 3. Clicks customize → Opens biypod.com
// 4. Uses 3D customizer
// 5. Saves design
// 6. Adds to cart
// 7. Completes checkout

const customerJourney = {
  touchpoints: [
    'merchant-store',
    'product-page',
    'customize-button',
    'biypod-customizer',
    'design-save',
    'add-to-cart',
    'checkout'
  ],
  conversion_rate: '12-18%',
  avg_session_time: '8 minutes'
};
```

---

## 🧪 **Testing & Quality Assurance**

### **🔍 Testing Strategy**
```typescript
// Unit Tests
describe('BiypodAPI', () => {
  test('should fetch product catalog', async () => {
    const api = new BiypodAPI(TEST_API_URL, mockSession);
    const catalog = await api.getCatalog();
    expect(catalog.products).toHaveLength(5);
  });
});

// Integration Tests
describe('Customizer Integration', () => {
  test('should save design via API', async () => {
    const design = await saveDesign(mockDesignData);
    expect(design.success).toBe(true);
    expect(design.configId).toBeDefined();
  });
});

// E2E Tests
describe('Merchant Flow', () => {
  test('should complete product customization', async () => {
    await page.goto('https://app.biypod.com');
    await page.click('[data-testid="customize-product"]');
    await page.waitForSelector('iframe[title="Biypod Customizer"]');
    // Test iframe interaction
  });
});
```

### **🚀 Performance Monitoring**
```typescript
// Web Vitals tracking
if (typeof window !== 'undefined' && window.shopify?.webVitals) {
  window.shopify.webVitals.onReport((metrics) => {
    fetch('/api/web-vitals', {
      method: 'POST',
      body: JSON.stringify(metrics)
    });
  });
}

// API performance monitoring
const apiMetrics = {
  response_time: '<200ms',
  uptime: '99.9%',
  error_rate: '<0.1%'
};
```

---

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **1. Iframe Communication Issues**
```typescript
// Problem: PostMessage not working between domains
// Solution: Verify origins and message format

// Correct implementation
window.addEventListener('message', (event) => {
  // Always verify origin
  if (event.origin !== 'https://app.biypod.com') return;

  // Handle message
  switch (event.data.type) {
    case 'DESIGN_SAVED':
      handleDesignSaved(event.data);
      break;
  }
});
```

#### **2. 3D Model Loading Issues**
```typescript
// Problem: GLB files not loading
// Solution: Check CORS and file paths

// Debug GLB loading
const loader = new GLTFLoader();
loader.load(
  '/models/product.glb',
  (gltf) => console.log('Loaded:', gltf),
  (progress) => console.log('Progress:', progress),
  (error) => console.error('Error:', error)
);
```

#### **3. API Authentication Failures**
```typescript
// Problem: 401/403 errors
// Solution: Verify session tokens and headers

// Debug API calls
const debugAPI = async (endpoint: string) => {
  console.log('Session:', session);
  console.log('Headers:', {
    'Authorization': `Bearer ${session.accessToken}`,
    'X-Shop-Domain': session.shop
  });
};
```

---

## 📈 **Monitoring & Analytics**

### **📊 Key Metrics**
```typescript
const kpis = {
  technical: {
    api_response_time: '<200ms',
    uptime: '99.9%',
    error_rate: '<0.1%',
    lighthouse_score: '>90'
  },
  business: {
    merchant_activation: '85%',
    customer_conversion: '15%',
    design_completion: '78%',
    monthly_revenue: '$50k+'
  }
};
```

### **🔍 Logging Strategy**
```typescript
// Structured logging
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      data,
      timestamp: new Date().toISOString(),
      service: 'biypod-merchant-app'
    }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      service: 'biypod-merchant-app'
    }));
  }
};
```

---

## 🎓 **Learning Resources**

### **📚 Required Reading**
1. **Shopify App Development**: [Shopify Dev Docs](https://shopify.dev/apps)
2. **Remix Framework**: [Remix Docs](https://remix.run/docs)
3. **Three.js 3D Graphics**: [Three.js Docs](https://threejs.org/docs)
4. **Supabase Backend**: [Supabase Docs](https://supabase.com/docs)

### **🛠️ Development Tools**
```bash
# Essential tools
- VS Code with extensions:
  - Shopify Liquid
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - GitLens

# Browser extensions:
- React Developer Tools
- Shopify App Bridge DevTools
- Web Vitals Extension
```

### **🔗 Important Links**
- **Shopify Partner Dashboard**: [partners.shopify.com](https://partners.shopify.com)
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)
- **GitHub Repositories**: [github.com/Lleewss](https://github.com/Lleewss)

---

## 🎯 **Success Checklist for New Hires**

### **Week 1: Environment Setup**
- [ ] Clone both repositories
- [ ] Set up local development environment
- [ ] Run both apps locally
- [ ] Understand system architecture
- [ ] Review brand guidelines

### **Week 2: Code Understanding**
- [ ] Trace a complete user flow
- [ ] Understand API integrations
- [ ] Review 3D customization logic
- [ ] Study Shopify compliance requirements
- [ ] Practice iframe communication

### **Week 3: First Contribution**
- [ ] Fix a small bug or add a feature
- [ ] Write tests for your changes
- [ ] Submit pull request
- [ ] Deploy to staging
- [ ] Verify in production

### **Month 1: Full Productivity**
- [ ] Independently develop features
- [ ] Understand performance implications
- [ ] Contribute to architecture decisions
- [ ] Mentor other new hires
- [ ] Optimize system performance

---

**Welcome to the Biypod team! You're now ready to build the future of 3D e-commerce customization! 🚀**
