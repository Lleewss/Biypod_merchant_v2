# Biypod API Documentation

## Overview
This document provides comprehensive documentation for all Biypod APIs, organized by functionality. All APIs are production-ready and tested.

## Base URL
- **Production**: `https://biypod.apeironian.com`
- **Development**: `http://localhost:3000`

## Authentication
Most APIs use RBAC (Role-Based Access Control) with the following access levels:
- **Public**: `allowAnonymous: true` - No authentication required
- **Merchant**: Requires merchant authentication
- **Admin**: Requires admin authentication

## API Categories

### 📦 Product Catalog APIs

#### GET /api/merchants/catalog
**Purpose**: Fetch available products for merchants to publish to their stores
**Access**: Public (allowAnonymous: true)
**Features**: Search, pagination, category filtering

**Query Parameters**:
```typescript
{
  search?: string          // Search in name/description
  category?: string        // Filter by category ID
  page?: number           // Page number (default: 1)
  limit?: number          // Items per page (default: 20)
  merchantId?: string     // Optional merchant context
}
```

**Response**:
```typescript
{
  products: Array<{
    id: string
    name: string
    description: string
    base_price: number
    available_to_merchants: boolean
    is_active: boolean
    featured: boolean
    sort_order: number
    product_images: Array<{
      id: string
      url: string
      alt_text: string
      sort_order: number
    }>
    product_categories: {
      id: string
      name: string
    }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

#### GET /api/admin/products
**Purpose**: Admin product management with full details
**Access**: Admin only (`admin:products`)
**Features**: Search, category filter, merchant product variants

**Query Parameters**:
```typescript
{
  search?: string
  categoryId?: string
  limit?: number
  offset?: number
}
```

#### GET /api/products/[id]
**Purpose**: Get single product details (by ID or slug)
**Access**: Public (`product:read`, allowAnonymous: true)
**Features**: Product images, customization options

**Path Parameters**:
- `id`: Product UUID or slug

**Response**:
```typescript
{
  id: string
  name: string
  description: string
  slug: string
  base_price: number
  glb_file_url?: string
  texture_file_url?: string
  customization_options: any
  product_images: Array<{
    id: string
    url: string
    alt_text: string
    sort_order: number
  }>
}
```

#### POST /api/merchants/publish-product
**Purpose**: Publish Biypod product to merchant's Shopify store
**Access**: Merchant only (`merchant:publish`)
**Features**: Creates Shopify product, sets metafields, usage tracking

**Request Body**:
```typescript
{
  productId: string
  shopifyProductData: {
    title: string
    description: string
    price: number
    variants?: Array<any>
  }
  customizationSettings?: any
}
```

### 🎨 Design Management APIs

#### POST /api/designs/save
**Purpose**: Save customer designs from customizer
**Access**: Public (`design:save`, allowAnonymous: true)
**Features**: Design data, product context, metadata

**Request Body**:
```typescript
{
  designData: {
    productId: string
    customerEmail: string
    merchantId?: string
    designName: string
    
    customizationData: {
      textures: Array<{
        id: string
        url: string
        position: { x: number, y: number, z: number }
        scale: { x: number, y: number, z: number }
        rotation: { x: number, y: number, z: number }
      }>
      
      colors: Array<{
        materialId: string
        color: string
        opacity: number
      }>
      
      text: Array<{
        content: string
        font: string
        size: number
        position: { x: number, y: number, z: number }
        color: string
      }>
    }
    
    productContext: {
      id: string
      name: string
      glbFiles: any[]
    }
    
    metadata: {
      customizerVersion: string
      timestamp: string
      userAgent?: string
    }
  }
}
```

**Response**:
```typescript
{
  success: boolean
  configId: string
  message: string
}
```

#### GET /api/designs/load/[configId]
**Purpose**: Load saved customer designs
**Access**: Public (`design:load`, allowAnonymous: true)

**Path Parameters**:
- `configId`: Design configuration ID

**Response**:
```typescript
{
  success: boolean
  design?: {
    id: string
    name: string
    productId: string
    merchantId?: string
    customerEmail: string
    designData: any
    createdAt: string
    updatedAt: string
  }
  message: string
}
```

### 📁 File Upload & Processing APIs

#### POST /api/customizer/upload-texture
**Purpose**: Upload texture files for customization
**Access**: Public (`customizer:texture-upload`, allowAnonymous: true)
**Features**: File validation, rate limiting (10 uploads/minute), background processing

**Request**: Multipart form data
```typescript
{
  file: File                    // Image file (PNG, JPG, JPEG)
  productId?: string           // Optional product context
  merchantId?: string          // Optional merchant context
  metadata?: string            // JSON metadata
}
```

**Response**:
```typescript
{
  success: boolean
  textureId: string
  url: string
  metadata: {
    filename: string
    size: number
    mimeType: string
    dimensions?: { width: number, height: number }
  }
  message: string
}
```

#### POST /api/customizer/upload-glb
**Purpose**: Upload GLB 3D model files
**Access**: Public (`customizer:glb-upload`, allowAnonymous: true)
**Features**: GLB validation, secure storage, metadata extraction
**Rate Limit**: 3 uploads per 5 minutes

**Request**: Multipart form data
```typescript
{
  file: File                    // GLB file
  productId?: string           // Optional product context
  merchantId?: string          // Optional merchant context
  metadata?: string            // JSON metadata
}
```

#### GET /api/customizer/upload-glb?filename=xxx
**Purpose**: Get signed URLs for existing GLB files
**Access**: Authenticated
**Features**: Secure file access

**Query Parameters**:
- `filename`: GLB filename to retrieve

#### POST /api/customizer/export-print-files
**Purpose**: Generate production-ready print files
**Access**: Merchant/Admin (`customizer:print-export`)
**Features**: Design processing, file generation, secure storage

**Request Body**:
```typescript
{
  configId: string             // Design configuration ID
  exportFormat: 'pdf' | 'png' | 'svg'
  resolution?: number          // DPI for raster formats
  includeBleed?: boolean       // Include print bleed area
}
```

#### DELETE /api/customizer/export-print-files?printFileId=xxx
**Purpose**: Delete print files with audit logging
**Access**: Admin only (`customizer:print-delete`)
**Features**: Secure deletion, audit trail

### 🏪 Merchant Management APIs

#### POST /api/merchants/create
**Purpose**: Create merchant account during Shopify installation
**Access**: Public (`merchant:create`, allowAnonymous: true)
**Features**: Shop domain validation, duplicate prevention

**Request Body**:
```typescript
{
  shop_domain: string          // e.g., "store.myshopify.com"
}
```

**Response**:
```typescript
{
  success: boolean
  message: string
  merchant: {
    id: string
    shop_domain: string
    created_at: string
    subscription_status: string
  }
}
```

#### GET /api/merchants/get
**Purpose**: Retrieve merchant information
**Access**: Public (`merchant:get`, allowAnonymous: true)

**Query Parameters**:
```typescript
{
  shop_domain: string          // Merchant's shop domain
}
```

#### GET /api/merchants/customer-designs
**Purpose**: View customer designs for merchant's products
**Access**: Merchant only (`merchant:designs`)
**Features**: Pagination, merchant-scoped data

**Query Parameters**:
```typescript
{
  merchant_id: string
  page?: number
  limit?: number
  product_id?: string          // Filter by specific product
}
```

### 💳 Payment APIs

#### POST /api/merchants/create-payment
**Purpose**: Create Stripe payment for production costs
**Access**: Merchant only (`merchant:payments`)
**Features**: Biypod fee calculation, Stripe integration

**Request Body**:
```typescript
{
  orderId: string
  amount: number               // Amount in cents
  currency?: string            // Default: 'usd'
  description?: string
  metadata?: Record<string, string>
}
```

**Response**:
```typescript
{
  success: boolean
  paymentIntent: {
    id: string
    client_secret: string
    amount: number
    currency: string
    status: string
  }
}
```

### 🔧 Utility APIs

#### GET /api/proxy-glb
**Purpose**: Proxy GLB files for CORS handling
**Access**: Public
**Features**: CORS headers, secure file serving

**Query Parameters**:
- `url`: GLB file URL to proxy

#### POST /api/activity/log
**Purpose**: Log merchant activities in embedded app
**Access**: Public (for Shopify embedding)
**Features**: Activity tracking, analytics

**Request Body**:
```typescript
{
  activity_type: string
  merchant_id: string
  metadata?: any
  timestamp?: string
}
```

## Rate Limiting

| **Endpoint** | **Limit** | **Window** |
|---|---|---|
| `/api/customizer/upload-texture` | 10 requests | 1 minute |
| `/api/customizer/upload-glb` | 3 requests | 5 minutes |
| `/api/designs/save` | 20 requests | 1 minute |
| **Default** | 100 requests | 1 minute |

## Error Responses

All APIs return consistent error responses:

```typescript
{
  success: false
  error: string
  details?: any
  status: number
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Testing

All APIs have been tested and verified. See test results in the next section.
