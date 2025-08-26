# 📋 **SHOPIFY COMPLIANCE ANALYSIS #18: Security - Secure Token Generation**

## 🔗 **Source Document**
**URL**: https://shopify.dev/docs/apps/build/security/generate-secure-tokens
**Date**: Current (Updated regularly)
**Category**: Security & Token Management

## 📊 **CRITICAL TOKEN SECURITY REQUIREMENTS**

### **🎯 MANDATORY ENTROPY REQUIREMENTS**
- **MINIMUM ENTROPY**: 128 bits of entropy for secure token generation
- **EXCEPTION**: 64 bits allowed where token length is a concern
- **RANDOMNESS**: Must be cryptographically secure random generation
- **PURPOSE**: Ensure security of Shopify merchant data

### **🔒 PUBLIC TOKEN RESTRICTIONS**
- **EXPIRATION**: Maximum 7 days for publicly accessible tokens
- **PROTECTION**: Must prevent token leakage to third parties
- **INDEXING**: Must prevent search engine indexing of token URLs
- **ENFORCEMENT**: Apps with insecure tokens will be REJECTED

## 🔍 **BIYPOD CUSTOMIZER CRITICAL IMPACT ANALYSIS**

### **🎯 HIGH-RISK AREAS FOR 3D CUSTOMIZER**

#### **1. 3D Model Access Tokens:**
- **CURRENT RISK**: Tokens for accessing customer 3D models and designs
- **SECURITY CONCERN**: Weak tokens could expose proprietary customer designs
- **REQUIREMENT**: 128-bit entropy for model access tokens
- **CHALLENGE**: Balancing security with performance for real-time 3D rendering

#### **2. Customization Session Tokens:**
- **CURRENT RISK**: Session tokens for 3D customizer interface
- **SECURITY CONCERN**: Session hijacking could allow unauthorized customization
- **REQUIREMENT**: Secure session management with proper expiration
- **CHALLENGE**: Maintaining sessions during long customization processes

#### **3. File Upload Tokens:**
- **CURRENT RISK**: Tokens for uploading custom 3D models and textures
- **SECURITY CONCERN**: Weak upload tokens could allow malicious file uploads
- **REQUIREMENT**: Short-lived, high-entropy tokens for uploads
- **CHALLENGE**: Managing token lifecycle for large file uploads

#### **4. Preview and Sharing Tokens:**
- **CURRENT RISK**: Tokens for sharing 3D customization previews
- **SECURITY CONCERN**: Public preview URLs could expose customer designs
- **REQUIREMENT**: Time-limited tokens with proper access controls
- **CHALLENGE**: Balancing shareability with security

## 📋 **DETAILED TOKEN SECURITY CHECKLIST**

### **🔐 Entropy Requirements**

#### **128-bit Entropy Tokens (MANDATORY):**
- [ ] **Authentication tokens** - User login and session tokens
- [ ] **API access tokens** - Shopify API and internal API access
- [ ] **3D model access** - Tokens for accessing customer designs
- [ ] **Payment tokens** - Any payment-related authentication
- [ ] **Admin functions** - Merchant configuration and settings

#### **64-bit Entropy Tokens (ACCEPTABLE):**
- [ ] **Short URLs** - Where length is critical for user experience
- [ ] **QR codes** - Where space constraints apply
- [ ] **SMS tokens** - Where character limits apply
- [ ] **Temporary IDs** - Non-sensitive temporary identifiers

### **🎯 Biypod Customizer Specific Tokens**

#### **3D Model Security Tokens:**
- [ ] **Model access tokens** - 128-bit entropy, 24-hour expiration
- [ ] **Design sharing tokens** - 128-bit entropy, 7-day maximum
- [ ] **Preview tokens** - 128-bit entropy, 1-hour expiration
- [ ] **Download tokens** - 128-bit entropy, 15-minute expiration

#### **Session and Upload Tokens:**
- [ ] **Customizer sessions** - 128-bit entropy, session-based expiration
- [ ] **File upload tokens** - 128-bit entropy, 30-minute expiration
- [ ] **Real-time sync tokens** - 128-bit entropy, connection-based
- [ ] **Collaboration tokens** - 128-bit entropy, project-based expiration

## 🚀 **SECURE TOKEN IMPLEMENTATION**

### **Cryptographically Secure Token Generation:**

#### **Node.js Implementation:**
```javascript
const crypto = require('crypto');

class SecureTokenGenerator {
  // Generate 128-bit entropy token (recommended)
  static generate128BitToken() {
    return crypto.randomBytes(16).toString('hex'); // 32 hex chars = 128 bits
  }
  
  // Generate 64-bit entropy token (length-constrained use cases)
  static generate64BitToken() {
    return crypto.randomBytes(8).toString('hex'); // 16 hex chars = 64 bits
  }
  
  // Generate URL-safe base64 token
  static generateUrlSafeToken(bits = 128) {
    const bytes = bits / 8;
    return crypto.randomBytes(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  // Generate token with expiration
  static generateExpiringToken(expirationHours = 24) {
    const token = this.generate128BitToken();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + expirationHours);
    
    return {
      token,
      expires: expiration.toISOString(),
      expiresTimestamp: expiration.getTime()
    };
  }
}

// 3D Model access token
const modelToken = SecureTokenGenerator.generateExpiringToken(24);

// File upload token (short-lived)
const uploadToken = SecureTokenGenerator.generateExpiringToken(0.5); // 30 minutes

// Preview sharing token
const previewToken = SecureTokenGenerator.generateExpiringToken(168); // 7 days max
```

#### **Python Implementation:**
```python
import secrets
import base64
from datetime import datetime, timedelta

class SecureTokenGenerator:
    @staticmethod
    def generate_128_bit_token():
        """Generate 128-bit entropy token"""
        return secrets.token_hex(16)  # 16 bytes = 128 bits
    
    @staticmethod
    def generate_64_bit_token():
        """Generate 64-bit entropy token for length-constrained cases"""
        return secrets.token_hex(8)  # 8 bytes = 64 bits
    
    @staticmethod
    def generate_url_safe_token(bits=128):
        """Generate URL-safe base64 token"""
        bytes_needed = bits // 8
        return secrets.token_urlsafe(bytes_needed)
    
    @staticmethod
    def generate_expiring_token(expiration_hours=24):
        """Generate token with expiration"""
        token = SecureTokenGenerator.generate_128_bit_token()
        expiration = datetime.utcnow() + timedelta(hours=expiration_hours)
        
        return {
            'token': token,
            'expires': expiration.isoformat(),
            'expires_timestamp': expiration.timestamp()
        }

# 3D Model access token
model_token = SecureTokenGenerator.generate_expiring_token(24)

# File upload token (short-lived)
upload_token = SecureTokenGenerator.generate_expiring_token(0.5)  # 30 minutes
```

#### **PHP Implementation:**
```php
<?php
class SecureTokenGenerator {
    // Generate 128-bit entropy token
    public static function generate128BitToken() {
        return bin2hex(random_bytes(16)); // 16 bytes = 128 bits
    }
    
    // Generate 64-bit entropy token
    public static function generate64BitToken() {
        return bin2hex(random_bytes(8)); // 8 bytes = 64 bits
    }
    
    // Generate URL-safe base64 token
    public static function generateUrlSafeToken($bits = 128) {
        $bytes = $bits / 8;
        $randomBytes = random_bytes($bytes);
        return rtrim(strtr(base64_encode($randomBytes), '+/', '-_'), '=');
    }
    
    // Generate token with expiration
    public static function generateExpiringToken($expirationHours = 24) {
        $token = self::generate128BitToken();
        $expiration = new DateTime();
        $expiration->add(new DateInterval('PT' . $expirationHours . 'H'));
        
        return [
            'token' => $token,
            'expires' => $expiration->format('c'),
            'expires_timestamp' => $expiration->getTimestamp()
        ];
    }
}

// 3D Model access token
$modelToken = SecureTokenGenerator::generateExpiringToken(24);
?>
```

### **Token Management System:**
```javascript
// Token management with Redis storage
const redis = require('redis');
const client = redis.createClient();

class TokenManager {
  // Store token with expiration
  static async storeToken(tokenData, purpose, userId = null) {
    const key = `token:${purpose}:${tokenData.token}`;
    const value = JSON.stringify({
      purpose,
      userId,
      created: new Date().toISOString(),
      expires: tokenData.expires
    });
    
    // Set expiration in Redis
    const ttl = Math.floor((tokenData.expiresTimestamp - Date.now()) / 1000);
    await client.setex(key, ttl, value);
    
    return tokenData.token;
  }
  
  // Validate and retrieve token
  static async validateToken(token, purpose) {
    const key = `token:${purpose}:${token}`;
    const data = await client.get(key);
    
    if (!data) {
      throw new Error('Token not found or expired');
    }
    
    const tokenInfo = JSON.parse(data);
    
    // Double-check expiration
    if (new Date() > new Date(tokenInfo.expires)) {
      await client.del(key);
      throw new Error('Token expired');
    }
    
    return tokenInfo;
  }
  
  // Revoke token
  static async revokeToken(token, purpose) {
    const key = `token:${purpose}:${token}`;
    await client.del(key);
  }
  
  // Generate 3D model access token
  static async generate3DModelToken(modelId, userId) {
    const tokenData = SecureTokenGenerator.generateExpiringToken(24);
    await this.storeToken(tokenData, `3d_model:${modelId}`, userId);
    return tokenData.token;
  }
  
  // Generate file upload token
  static async generateUploadToken(userId) {
    const tokenData = SecureTokenGenerator.generateExpiringToken(0.5); // 30 min
    await this.storeToken(tokenData, 'file_upload', userId);
    return tokenData.token;
  }
}
```

## 🔧 **SEARCH ENGINE PROTECTION**

### **Preventing Token Indexing:**

#### **HTML Meta Tags:**
```html
<!-- Prevent search engine indexing of token URLs -->
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet">
```

#### **HTTP Headers:**
```javascript
// Express.js middleware for token-protected routes
const preventIndexing = (req, res, next) => {
  // Set referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Prevent indexing
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  
  next();
};

// Apply to token-protected routes
app.get('/3d-model/:token', preventIndexing, (req, res) => {
  // Serve 3D model with token validation
});
```

#### **robots.txt Configuration:**
```
# Prevent crawling of token-protected paths
User-agent: *
Disallow: /api/tokens/
Disallow: /3d-models/*/access/
Disallow: /preview/
Disallow: /share/
```

### **URL Structure for Token Security:**
```javascript
// Secure URL patterns for 3D customizer
const secureUrls = {
  // 3D model access (private)
  modelAccess: `/api/3d-models/${modelId}/access/${token}`,
  
  // File upload (temporary)
  fileUpload: `/api/upload/${token}`,
  
  // Preview sharing (time-limited)
  previewShare: `/preview/${token}`,
  
  // Download link (short-lived)
  downloadLink: `/download/${token}`
};

// Token validation middleware
const validateTokenMiddleware = (purpose) => {
  return async (req, res, next) => {
    try {
      const token = req.params.token;
      const tokenInfo = await TokenManager.validateToken(token, purpose);
      req.tokenInfo = tokenInfo;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};
```

## ⚠️ **CRITICAL WARNINGS**

### **App Review Risks:**
- **AUTOMATIC REJECTION**: Apps with insufficient token entropy will be rejected
- **TOKEN ANALYSIS**: Shopify analyzes token generation patterns during review
- **EXPIRATION ENFORCEMENT**: Public tokens without proper expiration will be flagged
- **INDEXING DETECTION**: Search engine indexable tokens will cause rejection

### **Security Risks:**
- **BRUTE FORCE ATTACKS**: Weak tokens can be guessed or brute-forced
- **SESSION HIJACKING**: Predictable tokens enable session takeover
- **DATA EXPOSURE**: Leaked tokens can expose sensitive customer data
- **PRIVILEGE ESCALATION**: Compromised tokens may grant unauthorized access

### **3D Customizer Specific Risks:**
- **DESIGN THEFT**: Weak model access tokens could expose customer designs
- **UNAUTHORIZED UPLOADS**: Compromised upload tokens enable malicious file uploads
- **PREVIEW LEAKAGE**: Insecure preview tokens could leak confidential designs
- **COLLABORATION ABUSE**: Weak collaboration tokens could allow unauthorized access

## 🏆 **SUCCESS CRITERIA**

### **Token Security:**
- ✅ **128-bit entropy** for all authentication and access tokens
- ✅ **Proper expiration** for all publicly accessible tokens (≤7 days)
- ✅ **Secure generation** using cryptographically secure random functions
- ✅ **Token management** with proper storage and validation

### **3D Customizer Security:**
- ✅ **Model access tokens** properly secured with 128-bit entropy
- ✅ **Upload tokens** short-lived with secure validation
- ✅ **Preview sharing** time-limited with access controls
- ✅ **Session management** secure throughout customization process

### **Search Engine Protection:**
- ✅ **No indexing** of token-protected URLs
- ✅ **Proper referrer policy** to prevent token leakage
- ✅ **Cache prevention** for sensitive token URLs
- ✅ **robots.txt** properly configured

## 🔧 **TOKEN LIFECYCLE MANAGEMENT**

### **Automated Token Cleanup:**
```javascript
// Automated token cleanup service
class TokenCleanupService {
  static async cleanupExpiredTokens() {
    const pattern = 'token:*';
    const keys = await client.keys(pattern);
    
    for (const key of keys) {
      const ttl = await client.ttl(key);
      if (ttl === -1) { // No expiration set
        await client.del(key);
      }
    }
  }
  
  // Run cleanup every hour
  static startCleanupSchedule() {
    setInterval(this.cleanupExpiredTokens, 3600000); // 1 hour
  }
}
```

### **Token Audit Logging:**
```javascript
// Token usage audit logging
class TokenAuditLogger {
  static async logTokenUsage(token, purpose, userId, action, ip) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      token: token.substring(0, 8) + '...', // Partial token for security
      purpose,
      userId,
      action, // 'created', 'used', 'expired', 'revoked'
      ip,
      userAgent: req.get('User-Agent')
    };
    
    // Store in secure audit log
    await auditLogger.log('token_usage', logEntry);
  }
}
```

---

## 🚨 **MANDATORY TOKEN SECURITY**

**Secure token generation is MANDATORY for all Shopify apps. Tokens must have sufficient entropy (128-bit minimum) and proper expiration for public tokens. Apps with weak or insecure tokens will be automatically rejected during review.**

**Priority**: 🔴 **CRITICAL - MANDATORY SECURITY REQUIREMENT**
**Timeline**: ⏰ **Must be implemented before app submission**
**Impact**: 🔒 **App approval + Data security + User protection**

**All tokens must be cryptographically secure with proper entropy and expiration. No exceptions.**

---

## 📊 **PROGRESS UPDATE**

**Completed**: 18/70+ articles analyzed  
**Remaining**: ~52 articles to audit  
**Current Progress**: 25.7% complete

**Next**: Continuing with article #19 (Security - URL Shortening)...
