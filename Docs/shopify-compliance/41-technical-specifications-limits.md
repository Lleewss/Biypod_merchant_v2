# Technical Specifications & Limits

## Overview
Comprehensive documentation of all technical limits, specifications, and requirements for Shopify app development and App Store compliance.

## API Rate Limits & Quotas

### GraphQL Admin API Limits
- **Query Cost Limit**: Maximum 1000 points per query
- **Bucket Size**: 1000 points total capacity
- **Leak Rate**: 50 points per second refill rate
- **Burst Capacity**: Up to full bucket size
- **Per App/Store**: Limits are per app per store combination

### REST Admin API Limits
- **Standard Stores**: 2 requests per second
- **Shopify Plus**: 4 requests per second (some endpoints 8 req/sec)
- **Burst Allowance**: 40 requests per minute
- **Replenishment**: 2 requests per second

### Customer Account API Limits
- **Cost Points**: 7500 points per store per customer
- **Replenishment Rate**: 100-200 points per second
- **Query Complexity**: Higher complexity = higher cost

### Storefront API Limits
- **Public Apps**: 1000 requests per minute per IP
- **Private Apps**: 2000 requests per minute per IP
- **Plus Stores**: Higher limits available

## Performance Requirements

### Response Time Standards
- **App Loading**: <3 seconds initial load
- **API Responses**: <2 seconds average
- **Checkout Impact**: Minimal impact on checkout speed
- **Admin Performance**: Fast admin interface loading

### Built for Shopify Performance Criteria
- **Admin Performance**: 75th percentile requirements
- **Checkout Performance**: No negative impact
- **API Efficiency**: Optimized query patterns
- **Resource Usage**: Minimal server resource consumption

## Data Limits & Constraints

### Product Limits
- **Products per Store**: No hard limit (performance considerations)
- **Variants per Product**: 100 variants maximum
- **Options per Product**: 3 options maximum
- **Option Values**: 100 values per option
- **Product Images**: 250 images per product
- **Product Title**: 255 characters maximum
- **Product Description**: No hard limit (performance considerations)

### Order Limits
- **Line Items per Order**: 1000 line items maximum
- **Order Notes**: 65,535 characters maximum
- **Order Tags**: No hard limit
- **Fulfillments per Order**: No hard limit

### Customer Limits
- **Customer Tags**: No hard limit
- **Customer Notes**: 65,535 characters maximum
- **Addresses per Customer**: No hard limit
- **Customer Metafields**: Standard metafield limits apply

### Collection Limits
- **Products per Collection**: No hard limit (performance considerations)
- **Collection Rules**: Complex rule combinations supported
- **Collection Images**: 1 image per collection

## File & Media Limits

### Image Requirements
- **Maximum File Size**: 20 MB per image
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Recommended Resolution**: 2048x2048 pixels
- **Minimum Resolution**: 100x100 pixels
- **Aspect Ratios**: Various ratios supported

### File Upload Limits
- **General Files**: 20 MB maximum
- **Theme Files**: 20 MB maximum
- **App Assets**: 20 MB per file
- **Bulk Import Files**: 15 MB maximum

## App Configuration Limits

### Webhook Limits
- **Subscriptions per App**: 100 webhooks maximum
- **Payload Size**: 1 MB maximum
- **Timeout**: 5 seconds maximum response time
- **Retry Window**: 48 hours maximum

### Metafield Limits
- **Metafields per Resource**: 250 metafields maximum
- **Metafield Value Size**: 65,535 characters maximum
- **Metafield Key Length**: 30 characters maximum
- **Namespace Length**: 20 characters maximum

### App Extension Limits
- **Extensions per App**: No hard limit
- **Extension Size**: Varies by extension type
- **Configuration Size**: Limited by extension type

## Security Specifications

### TLS/SSL Requirements
- **Minimum Version**: TLS 1.2
- **Recommended Version**: TLS 1.3
- **Certificate Authority**: Trusted CA required
- **Cipher Suites**: Strong encryption required
- **HSTS**: HTTP Strict Transport Security recommended

### Authentication Requirements
- **OAuth 2.0**: Required for public apps
- **Session Tokens**: Required for embedded apps
- **Token Expiry**: 24 hours for online tokens
- **Refresh Tokens**: Available for offline access
- **Scope Limitations**: Request minimum required scopes

### Content Security Policy
- **Frame Ancestors**: Proper CSP headers required
- **Script Sources**: Whitelist trusted sources
- **Style Sources**: Secure style loading
- **Image Sources**: Secure image loading

## Browser & Device Support

### Supported Browsers
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile Browsers**: iOS Safari, Chrome Mobile

### Device Requirements
- **Desktop**: 1024x768 minimum resolution
- **Tablet**: Responsive design required
- **Mobile**: Mobile-optimized interface
- **Touch Support**: Touch-friendly controls

## Infrastructure Requirements

### Hosting Requirements
- **HTTPS**: SSL/TLS encryption required
- **Uptime**: 99.9% availability target
- **Geographic Distribution**: CDN recommended
- **Backup Systems**: Disaster recovery plans
- **Monitoring**: Health checks and alerting

### Database Requirements
- **Encryption**: Data encryption at rest
- **Backups**: Regular automated backups
- **Performance**: Optimized query performance
- **Scaling**: Horizontal scaling capability
- **Compliance**: Data protection compliance

## App Bridge Specifications

### App Bridge Version Requirements
- **Minimum Version**: App Bridge 2.0
- **Recommended Version**: App Bridge 3.0+
- **Session Tokens**: Required for embedded apps
- **CSRF Protection**: Built-in protection required

### Embedded App Requirements
- **Iframe Protection**: Proper CSP configuration
- **Session Management**: Secure session handling
- **Navigation**: App Bridge navigation APIs
- **Modal Support**: App Bridge modal implementation

## Function & Extension Limits

### Shopify Functions
- **Execution Time**: 5 seconds maximum
- **Memory Usage**: 128 MB maximum
- **Code Size**: 256 KB maximum
- **Dependencies**: Limited external dependencies
- **API Calls**: No external API calls allowed

### UI Extensions
- **Bundle Size**: Varies by extension type
- **Execution Context**: Sandboxed environment
- **API Access**: Limited to provided APIs
- **Performance**: Fast rendering required

## Billing & Subscription Limits

### Subscription Limits
- **Plans per App**: No hard limit
- **Trial Duration**: 30 days maximum
- **Billing Cycles**: Monthly, annual, usage-based
- **Currency Support**: Multiple currencies supported

### Usage Tracking
- **Metrics Collection**: Real-time usage tracking
- **Billing Accuracy**: Precise usage measurement
- **Reporting**: Detailed usage reports
- **Limits Enforcement**: Automatic limit enforcement

## Testing & Development Limits

### Development Store Limits
- **Products**: 100 products maximum
- **Orders**: Limited order history
- **Apps**: Multiple apps for testing
- **Data**: Test data only

### Sandbox Environment
- **API Calls**: Same limits as production
- **Features**: Full feature access
- **Testing**: Comprehensive testing capabilities
- **Reset**: Easy environment reset

## Monitoring & Observability

### Logging Requirements
- **Error Logging**: Comprehensive error tracking
- **Performance Logging**: Response time tracking
- **Security Logging**: Security event logging
- **Audit Logging**: User action tracking

### Metrics Collection
- **Performance Metrics**: Response times, throughput
- **Error Metrics**: Error rates, types
- **Usage Metrics**: Feature usage, user activity
- **Business Metrics**: Conversion, retention

## Compliance Limits

### Data Retention
- **Customer Data**: Varies by jurisdiction
- **Transaction Data**: 7 years recommended
- **Log Data**: 1 year minimum
- **Backup Data**: Secure retention policies

### Geographic Restrictions
- **Data Residency**: Regional data requirements
- **Feature Availability**: Region-specific features
- **Compliance**: Local regulation compliance
- **Access Controls**: Geographic access restrictions

## Verification Checklist

### Performance Verification
- [ ] API response times within limits
- [ ] App loading times under 3 seconds
- [ ] Rate limiting properly handled
- [ ] Resource usage optimized

### Security Verification
- [ ] TLS/SSL properly configured
- [ ] Authentication implemented correctly
- [ ] CSP headers configured
- [ ] Input validation in place

### Functional Verification
- [ ] All features working within limits
- [ ] Error handling implemented
- [ ] Monitoring and logging active
- [ ] Backup and recovery tested

## Resources & Documentation

### Official Limits Documentation
- [API Rate Limits](https://shopify.dev/docs/api/usage/limits)
- [GraphQL Limits](https://shopify.dev/docs/api/admin-graphql/usage/limits)
- [REST API Limits](https://shopify.dev/docs/api/admin-rest/usage/rate-limits)

### Performance Guidelines
- [Built for Shopify Requirements](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)
- [Performance Best Practices](https://shopify.dev/docs/apps/build/performance)

### Security Specifications
- [Security Requirements](https://shopify.dev/docs/apps/build/security)
- [Authentication Guide](https://shopify.dev/docs/api/usage/authentication)

**Status**: Comprehensive Technical Specifications
**Priority**: HIGH - Critical for development and compliance
**Last Updated**: {current_date}
