# 📋 **SHOPIFY COMPLIANCE ANALYSIS #16: Security - iframe Protection**

## 🔗 **Source Document**
**URL**: https://shopify.dev/docs/apps/build/security/set-up-iframe-protection
**Date**: Current (Updated regularly)
**Category**: Security & Clickjacking Protection

## 📊 **CRITICAL IFRAME PROTECTION REQUIREMENTS**

### **🎯 MANDATORY CSP FRAME-ANCESTORS**
- **REQUIREMENT**: ALL apps must set proper Content Security Policy frame-ancestors directive
- **PURPOSE**: Avoid clickjacking attacks on Shopify App Store apps
- **ENFORCEMENT**: Apps with missing or incorrect CSP will be REJECTED
- **RESUBMISSION**: Must address CSP issues before re-submitting for review

### **🔒 CLICKJACKING PROTECTION**
- **ATTACK TYPE**: Clickjacking allows malicious sites to trick users into clicking hidden elements
- **PROTECTION**: frame-ancestors directive controls which sites can embed your app in iframes
- **SCOPE**: Required for ALL routes that render HTML content
- **DYNAMIC REQUIREMENT**: Headers must be different for every shop

## 🔍 **BIYPOD CUSTOMIZER CRITICAL IMPACT ANALYSIS**

### **🎯 HIGH-RISK AREAS FOR 3D CUSTOMIZER**

#### **1. Embedded 3D Customizer Interface:**
- **CURRENT RISK**: 3D customizer embedded in Shopify admin vulnerable to clickjacking
- **ATTACK SCENARIO**: Malicious site could overlay invisible elements over 3D controls
- **PROTECTION NEEDED**: Dynamic frame-ancestors for each shop domain
- **CHALLENGE**: 3D interface has many interactive elements vulnerable to hijacking

#### **2. Customer-Facing Customizer:**
- **CURRENT RISK**: Storefront 3D customizer could be embedded maliciously
- **ATTACK SCENARIO**: Fake customizer interface to steal customer data
- **PROTECTION NEEDED**: Strict frame-ancestors or 'none' for customer interface
- **CHALLENGE**: Balancing security with legitimate embedding needs

#### **3. Admin Configuration Pages:**
- **CURRENT RISK**: Merchant configuration pages vulnerable to clickjacking
- **ATTACK SCENARIO**: Tricking merchants into changing settings or permissions
- **PROTECTION NEEDED**: Shop-specific frame-ancestors for admin pages
- **CHALLENGE**: Multiple admin routes need consistent protection

#### **4. API Endpoints with HTML Responses:**
- **CURRENT RISK**: Any HTML-returning endpoints vulnerable to embedding
- **ATTACK SCENARIO**: Malicious embedding of sensitive admin interfaces
- **PROTECTION NEEDED**: CSP headers on all HTML responses
- **CHALLENGE**: Identifying all routes that return HTML content

## 📋 **DETAILED CSP IMPLEMENTATION CHECKLIST**

### **🔐 Embedded Apps Requirements**

#### **Dynamic Frame-Ancestors Configuration:**
- [ ] **Shop-specific headers** - Different CSP for each shop
- [ ] **Shopify admin domain** - Include https://admin.shopify.com
- [ ] **Shop domain** - Include https://{shop}.myshopify.com
- [ ] **All HTML routes** - CSP headers on every HTML-returning route
- [ ] **Dynamic generation** - Headers generated based on current shop

#### **CSP Header Format for Embedded Apps:**
```
Content-Security-Policy: frame-ancestors https://{shop}.myshopify.com https://admin.shopify.com;
```

### **🚫 Non-Embedded Apps Requirements**

#### **Strict Frame Protection:**
- [ ] **frame-ancestors 'none'** - Disallow all framing
- [ ] **All HTML routes** - Apply to every HTML response
- [ ] **Consistent application** - No exceptions for any routes
- [ ] **Partner Dashboard config** - Ensure "Embed app in Shopify admin" is False

#### **CSP Header Format for Non-Embedded Apps:**
```
Content-Security-Policy: frame-ancestors 'none';
```

### **🎯 Biypod Customizer Specific Requirements**

#### **3D Customizer Protection:**
- [ ] **Interactive element protection** - Prevent hijacking of 3D controls
- [ ] **Customer data protection** - Secure customization interfaces
- [ ] **File upload protection** - Secure 3D model upload interfaces
- [ ] **Real-time update protection** - Secure WebSocket/SSE interfaces

#### **Multi-Route Protection:**
- [ ] **Admin dashboard** - Merchant configuration interfaces
- [ ] **3D customizer** - Main customization interface
- [ ] **Asset management** - 3D model management pages
- [ ] **Settings pages** - App configuration interfaces
- [ ] **Preview pages** - 3D model preview interfaces

## 🚀 **CSP IMPLEMENTATION EXAMPLES**

### **Express.js Dynamic CSP for Embedded Apps:**
```javascript
const express = require('express');
const app = express();

// Middleware to set dynamic CSP headers for embedded apps
const setFrameAncestors = (req, res, next) => {
  // Extract shop domain from request
  const shop = req.query.shop || req.headers['x-shopify-shop-domain'];
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop domain required' });
  }
  
  // Validate shop domain format
  if (!shop.match(/^[a-zA-Z0-9-]+\.myshopify\.com$/)) {
    return res.status(400).json({ error: 'Invalid shop domain' });
  }
  
  // Set dynamic frame-ancestors
  const cspHeader = `frame-ancestors https://${shop} https://admin.shopify.com`;
  res.setHeader('Content-Security-Policy', cspHeader);
  
  next();
};

// Apply CSP to all HTML routes
app.use(setFrameAncestors);

// 3D Customizer route
app.get('/customizer', (req, res) => {
  res.render('customizer', { shop: req.query.shop });
});

// Admin configuration route
app.get('/admin/config', (req, res) => {
  res.render('admin-config', { shop: req.query.shop });
});
```

### **Next.js CSP Implementation:**
```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const shop = request.nextUrl.searchParams.get('shop');
  
  if (!shop) {
    return NextResponse.redirect(new URL('/error', request.url));
  }
  
  // Validate shop domain
  if (!shop.match(/^[a-zA-Z0-9-]+\.myshopify\.com$/)) {
    return NextResponse.redirect(new URL('/error', request.url));
  }
  
  const response = NextResponse.next();
  
  // Set CSP header for embedded app
  const cspHeader = `frame-ancestors https://${shop} https://admin.shopify.com`;
  response.headers.set('Content-Security-Policy', cspHeader);
  
  return response;
}

export const config = {
  matcher: [
    '/customizer/:path*',
    '/admin/:path*',
    '/settings/:path*'
  ]
};
```

### **React App with CSP Validation:**
```javascript
// CSP validation component
import React, { useEffect, useState } from 'react';

const CSPValidator = ({ children }) => {
  const [isValidFrame, setIsValidFrame] = useState(false);
  
  useEffect(() => {
    // Check if app is properly framed
    const validateFraming = () => {
      try {
        // Check if we're in an iframe
        const inIframe = window !== window.top;
        
        if (inIframe) {
          // Validate parent origin
          const allowedOrigins = [
            'https://admin.shopify.com',
            /^https:\/\/[a-zA-Z0-9-]+\.myshopify\.com$/
          ];
          
          const parentOrigin = document.referrer;
          const isValidOrigin = allowedOrigins.some(origin => {
            if (typeof origin === 'string') {
              return parentOrigin.startsWith(origin);
            }
            return origin.test(parentOrigin);
          });
          
          setIsValidFrame(isValidOrigin);
        } else {
          // Not in iframe - check if this is expected
          setIsValidFrame(true);
        }
      } catch (error) {
        console.error('Frame validation error:', error);
        setIsValidFrame(false);
      }
    };
    
    validateFraming();
  }, []);
  
  if (!isValidFrame) {
    return (
      <div className="security-warning">
        <h1>Security Warning</h1>
        <p>This app must be accessed through Shopify Admin.</p>
      </div>
    );
  }
  
  return children;
};

// 3D Customizer with CSP protection
const CustomizerApp = () => {
  return (
    <CSPValidator>
      <div className="customizer-container">
        <h1>3D Product Customizer</h1>
        {/* 3D customizer interface */}
      </div>
    </CSPValidator>
  );
};
```

### **Nginx CSP Configuration:**
```nginx
server {
    listen 443 ssl;
    server_name your-app.example.com;
    
    # Dynamic CSP based on shop parameter
    location / {
        # Extract shop from query parameter
        set $shop "";
        if ($args ~ shop=([^&]+)) {
            set $shop $1;
        }
        
        # Validate shop format
        if ($shop !~ "^[a-zA-Z0-9-]+\.myshopify\.com$") {
            return 400;
        }
        
        # Set dynamic CSP header
        add_header Content-Security-Policy "frame-ancestors https://$shop https://admin.shopify.com" always;
        
        proxy_pass http://backend;
    }
    
    # Non-embedded routes
    location /public {
        add_header Content-Security-Policy "frame-ancestors 'none'" always;
        proxy_pass http://backend;
    }
}
```

## 🔧 **CSP TESTING AND VALIDATION**

### **Browser Developer Tools Testing:**
```javascript
// CSP validation script
const validateCSP = () => {
  // Check current page CSP
  const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const headerCSP = 'Check Network tab for CSP header';
  
  console.log('Meta CSP:', metaCSP?.content || 'Not found');
  console.log('Check Network tab for CSP header in response');
  
  // Test frame embedding
  const testFrame = document.createElement('iframe');
  testFrame.src = window.location.href;
  testFrame.style.display = 'none';
  
  testFrame.onload = () => {
    console.log('Frame loaded successfully - CSP may be too permissive');
  };
  
  testFrame.onerror = () => {
    console.log('Frame blocked - CSP working correctly');
  };
  
  document.body.appendChild(testFrame);
  
  setTimeout(() => {
    document.body.removeChild(testFrame);
  }, 1000);
};
```

### **Automated CSP Testing:**
```javascript
// CSP test suite
const testCSPImplementation = async (appUrl, shopDomain) => {
  const tests = [];
  
  // Test 1: Verify CSP header presence
  const response = await fetch(`${appUrl}?shop=${shopDomain}`);
  const cspHeader = response.headers.get('Content-Security-Policy');
  
  tests.push({
    name: 'CSP Header Present',
    passed: !!cspHeader,
    details: cspHeader || 'No CSP header found'
  });
  
  // Test 2: Verify frame-ancestors directive
  const hasFrameAncestors = cspHeader?.includes('frame-ancestors');
  tests.push({
    name: 'Frame-Ancestors Directive',
    passed: hasFrameAncestors,
    details: hasFrameAncestors ? 'Found' : 'Missing frame-ancestors'
  });
  
  // Test 3: Verify shop domain inclusion
  const includesShop = cspHeader?.includes(shopDomain);
  tests.push({
    name: 'Shop Domain Included',
    passed: includesShop,
    details: includesShop ? 'Shop domain found' : 'Shop domain missing'
  });
  
  // Test 4: Verify admin domain inclusion
  const includesAdmin = cspHeader?.includes('admin.shopify.com');
  tests.push({
    name: 'Admin Domain Included',
    passed: includesAdmin,
    details: includesAdmin ? 'Admin domain found' : 'Admin domain missing'
  });
  
  return tests;
};
```

## ⚠️ **CRITICAL WARNINGS**

### **App Review Risks:**
- **AUTOMATIC REJECTION**: Apps without proper CSP will be rejected
- **MISSING DIRECTIVE**: frame-ancestors directive must be present
- **INCORRECT CONFIGURATION**: Wrong CSP format will cause rejection
- **INCONSISTENT APPLICATION**: All HTML routes must have CSP headers

### **Security Risks:**
- **CLICKJACKING ATTACKS**: Users can be tricked into unintended actions
- **UI REDRESSING**: Malicious overlays can hide legitimate interface elements
- **DATA THEFT**: Sensitive information can be captured through fake interfaces
- **PRIVILEGE ESCALATION**: Admin actions can be triggered without consent

### **3D Customizer Specific Risks:**
- **CONTROL HIJACKING**: 3D interface controls can be overlaid with malicious elements
- **DESIGN THEFT**: Custom 3D models can be captured through malicious embedding
- **CUSTOMER DECEPTION**: Fake customizer interfaces can steal customer data
- **MERCHANT FRAUD**: Admin configuration can be manipulated through clickjacking

## 🏆 **SUCCESS CRITERIA**

### **CSP Implementation:**
- ✅ **Dynamic CSP headers** for embedded apps with shop-specific domains
- ✅ **Static CSP headers** for non-embedded apps with frame-ancestors 'none'
- ✅ **All HTML routes** protected with appropriate CSP headers
- ✅ **Browser validation** shows CSP working correctly

### **Security Testing:**
- ✅ **Developer tools** show correct CSP headers in Network tab
- ✅ **Frame embedding tests** blocked by CSP when appropriate
- ✅ **Shop domain validation** prevents invalid domains
- ✅ **Automated tests** verify CSP implementation

### **3D Customizer Security:**
- ✅ **Interactive elements** protected from clickjacking
- ✅ **Customer interfaces** secured against malicious embedding
- ✅ **Admin pages** protected with shop-specific CSP
- ✅ **File upload interfaces** secured against hijacking

## 🔧 **TROUBLESHOOTING COMMON ISSUES**

### **App Configuration Issues:**
1. **Embedded vs Non-Embedded Mismatch**
   - Check Partner Dashboard configuration
   - Ensure "Embed app in Shopify admin" setting matches implementation
   - Update CSP headers accordingly

2. **Missing Shop Domain**
   - Validate shop parameter extraction
   - Implement proper error handling for missing shop
   - Ensure all routes receive shop information

3. **Invalid CSP Format**
   - Verify frame-ancestors syntax
   - Check for typos in domain names
   - Ensure proper semicolon termination

### **Testing and Validation:**
```javascript
// CSP debugging helper
const debugCSP = () => {
  console.log('Current URL:', window.location.href);
  console.log('In iframe:', window !== window.top);
  console.log('Referrer:', document.referrer);
  
  // Check for CSP violations
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('CSP Violation:', {
      directive: e.violatedDirective,
      blocked: e.blockedURI,
      policy: e.originalPolicy
    });
  });
};
```

---

## 🚨 **MANDATORY IFRAME PROTECTION**

**iframe protection through CSP frame-ancestors is MANDATORY for all Shopify apps. Apps without proper CSP implementation will be automatically rejected during review. The directive must be correctly configured for embedded vs non-embedded apps.**

**Priority**: 🔴 **CRITICAL - MANDATORY SECURITY REQUIREMENT**
**Timeline**: ⏰ **Must be implemented before app submission**
**Impact**: 🛡️ **App approval + Clickjacking protection + User safety**

**All HTML routes must include proper CSP frame-ancestors directive. No exceptions.**

---

## 📊 **PROGRESS UPDATE**

**Completed**: 16/70+ articles analyzed  
**Remaining**: ~54 articles to audit  
**Current Progress**: 22.9% complete

**Next**: Continuing with article #17 (Security - Network Service Ports)...
