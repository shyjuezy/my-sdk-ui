# VECU IDV Web SDK

A TypeScript SDK that provides a unified interface for multiple identity verification providers (Socure, Incode, Jumio, etc.). This SDK simplifies the integration of identity verification services into web applications.

## Features

- 🔌 **Unified Interface**: Single API for multiple identity verification providers
- 🚀 **Lazy Loading**: Providers are loaded only when needed, reducing initial bundle size
- 📦 **Tree-Shakeable**: Modular architecture for optimal bundle size
- 🎯 **TypeScript First**: Full type safety with comprehensive TypeScript definitions
- 🌐 **Framework Agnostic**: Works with any JavaScript framework (React, Vue, Angular, etc.)
- 🔄 **Event-Driven**: Unified event system across all providers
- 🛡️ **Error Handling**: Comprehensive error handling with retry logic
- 📱 **Mobile Support**: QR code handoff for mobile verification flows

## Installation

```bash
npm install @vecu-idv-web-sdk
# or
pnpm add @vecu-idv-web-sdk
# or
yarn add @vecu-idv-web-sdk
```

## Quick Start

```typescript
import { VecuIDV } from '@vecu-idv-web-sdk';

// Initialize the SDK
const vecuIDV = new VecuIDV({
  apiKey: 'your-api-key',
  environment: 'production',
  logLevel: 'info'
});

// Initialize the SDK
await vecuIDV.init();

// Create a verification session
const session = await vecuIDV.createVerification({
  user: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dateOfBirth: '1990-01-01'
  },
  container: '#verification-container', // or HTMLElement
  mode: 'embedded', // or 'modal'
  onComplete: (result) => {
    console.log('Verification completed:', result);
  },
  onError: (error) => {
    console.error('Verification error:', error);
  }
});
```

## Configuration

### SDK Configuration

```typescript
interface VecuIDVConfig {
  // Required
  apiKey: string;                          // Your VECU API key

  // Optional
  apiUrl?: string;                         // Backend API URL (default: production)
  environment?: 'development' | 'staging' | 'production';
  theme?: 'light' | 'dark' | 'auto';       // UI theme
  language?: string;                       // ISO language code
  autoRetry?: boolean;                     // Auto-retry on failure
  maxRetries?: number;                     // Maximum retry attempts
  timeout?: number;                        // Request timeout in ms
  debug?: boolean;                         // Enable debug logging
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}
```

### Verification Options

```typescript
interface VerificationOptions {
  // User data
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };

  // UI options
  container?: string | HTMLElement;        // DOM element or selector
  mode?: 'modal' | 'embedded';            // Display mode

  // Provider preferences
  preferredProvider?: string;              // Preferred provider
  excludeProviders?: string[];             // Providers to exclude

  // Features required
  requiredFeatures?: string[];             // e.g., ['liveness', 'document_ocr']

  // Callbacks
  onReady?: () => void;
  onProgress?: (progress: Progress) => void;
  onComplete?: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;

  // Metadata
  metadata?: Record<string, any>;          // Custom metadata
}
```

## Event Handling

The SDK provides a comprehensive event system for tracking verification progress:

```typescript
// Listen to specific events
vecuIDV.on('verification:progress', (event) => {
  console.log(`Progress: ${event.data.percentage}%`);
});

vecuIDV.on('provider:loaded', (event) => {
  console.log(`Provider ${event.data.provider} loaded`);
});

// Listen to all events
vecuIDV.on('*', (event) => {
  console.log('Event:', event.type, event.data);
});

// Remove event listeners
vecuIDV.off('verification:progress', handler);
```

### Available Events

- `sdk:init` - SDK initialization started
- `sdk:ready` - SDK ready to use
- `sdk:error` - SDK error occurred
- `provider:loaded` - Provider SDK loaded
- `verification:created` - Verification session created
- `verification:progress` - Verification progress update
- `verification:completed` - Verification completed successfully
- `verification:failed` - Verification failed
- `verification:cancelled` - Verification cancelled by user

## Providers

### Supported Providers

- **Socure** - Document verification, liveness check, fraud detection
- **Incode** (coming soon) - Document and biometric verification
- **Jumio** (coming soon) - Identity verification and authentication
- **Onfido** (coming soon) - Document and biometric verification
- **Veriff** (coming soon) - Identity verification platform

### Provider Features

```typescript
const PROVIDER_FEATURES = {
  DOCUMENT_VERIFICATION: 'document_verification',
  LIVENESS_CHECK: 'liveness_check',
  FACE_MATCH: 'face_match',
  ADDRESS_VERIFICATION: 'address_verification',
  DATABASE_CHECK: 'database_check',
  PHONE_VERIFICATION: 'phone_verification',
  EMAIL_VERIFICATION: 'email_verification',
  QR_CODE_HANDOFF: 'qr_code_handoff',
  VIDEO_VERIFICATION: 'video_verification',
};
```

## Error Handling

The SDK provides detailed error information with specific error codes:

```typescript
try {
  await vecuIDV.createVerification(options);
} catch (error) {
  if (error instanceof VecuError) {
    console.error(`Error ${error.code}: ${error.message}`);
    
    switch (error.code) {
      case 'SDK_NOT_INITIALIZED':
        // Handle initialization error
        break;
      case 'PROVIDER_LOAD_FAILED':
        // Handle provider loading error
        break;
      case 'SESSION_EXPIRED':
        // Handle session expiration
        break;
      default:
        // Handle other errors
    }
  }
}
```

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android

## Advanced Usage

### Custom Container Styling

```typescript
const session = await vecuIDV.createVerification({
  user: userData,
  container: document.getElementById('custom-container'),
  mode: 'embedded',
  // Custom styling handled by your CSS
});
```

### Multiple Concurrent Sessions

```typescript
// The SDK supports multiple concurrent verification sessions
const session1 = await vecuIDV.createVerification({...});
const session2 = await vecuIDV.createVerification({...});

// Check session status
const status = await vecuIDV.getVerificationStatus(session1.id);

// Cancel a specific session
await vecuIDV.cancelVerification(session1.id);
```

### Using CDN

```html
<!-- UMD build for direct browser usage -->
<script src="https://unpkg.com/@vecu-idv-web-sdk/dist/index.umd.js"></script>
<script>
  const vecuIDV = new VecuIDV.VecuIDV({
    apiKey: 'your-api-key'
  });
</script>
```

## Development

### Building the SDK

```bash
# Install dependencies
pnpm install

# Run development build with watch
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Generate documentation
pnpm docs
```

### Project Structure

```
vecu-idv-web-sdk/
├── src/
│   ├── core/           # Core SDK classes
│   ├── providers/      # Provider implementations
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   └── constants/      # SDK constants
├── tests/              # Unit and integration tests
├── examples/           # Usage examples
└── docs/               # Generated documentation
```

## Security Considerations

- **API Key Security**: Never expose API keys in frontend code
- **HTTPS Only**: All API calls are made over HTTPS
- **Content Security Policy**: Ensure your CSP allows loading provider SDKs
- **Input Sanitization**: All user inputs are sanitized

## License

MIT

## Support

For support, please contact support@vecu.com or visit our [documentation](https://docs.vecu.com).