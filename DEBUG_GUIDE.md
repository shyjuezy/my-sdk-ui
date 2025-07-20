# VecuIDV SDK - Local Debugging Setup Guide

## 🚀 Quick Start

Your debugging setup is now complete! Here's how to use it:

### 1. Start Development with Debugging

```bash
# Option 1: Standard development
npm run dev

# Option 2: Development with Node.js debugging enabled
npm run dev:debug

# Option 3: Start local SDK development (if working on SDK source)
npm run dev:sdk
```

### 2. Debug Methods Available

#### VS Code Debugging (Recommended)

1. **Press F5** or go to Run & Debug panel
2. Choose from these configurations:
   - **"Debug VecuIDV SDK"** - Full browser debugging with breakpoints
   - **"Next.js: Debug Client-Side"** - React component debugging
   - **"Next.js: Debug Server-Side"** - API routes and server debugging
   - **"Debug Next.js (Full Stack)"** - Both client & server together

#### Browser DevTools Debugging

1. Run: `npm run debug:chrome`
2. This opens Chrome with debugging enabled
3. Go to DevTools → Sources → Set breakpoints in your code

#### VS Code + Existing Browser

1. Start your app: `npm run dev`
2. Open Chrome with: `--remote-debugging-port=9222`
3. Use **"Debug SDK in Existing Chrome"** configuration in VS Code

## 🔧 Debugging Features Added

### Enhanced Logging

Your code now has comprehensive debug logging:

```typescript
// Available throughout the app
import { logger } from '@/utils/debug';

logger.sdk('SDK message');
logger.provider('socure', 'Provider message');
logger.debug('Debug info');
logger.error('Error message');
```

### Breakpoint Helpers

```typescript
import { debugBreakpoint } from '@/utils/debug';

// This will pause execution in debug mode
debugBreakpoint('Description', { data: someData });
```

### State Inspection

```typescript
import { inspectSDKState, inspectProviderState } from '@/utils/debug';

// Inspect SDK internal state
inspectSDKState(vecuSDKInstance);

// Inspect provider state  
inspectProviderState(provider, 'socure');
```

### Performance Timing

```typescript
import { createTimer } from '@/utils/debug';

const timer = createTimer('Operation Name');
// ... do work ...
timer.end(); // Logs timing info
```

## 🎯 Key Debugging Points

Your SDK hook now has breakpoints at critical moments:

1. **Before SDK Construction** - See the config being passed
2. **Before Force Initialize** - When bypassing backend
3. **Before Provider Loading** - Right before loading Socure
4. **Before Provider Initialization** - Before UI creation

## 🌐 Browser Console Utilities

In development, open browser console and use:

```javascript
// Available as window.vecuDebug
vecuDebug.inspectSDKState(someSDK);
vecuDebug.logger.sdk('Test message');
vecuDebug.debugBreakpoint('Manual break');
```

## 📋 Debug Workflow Examples

### Debugging Provider Loading Issue

1. Set breakpoint at "Before Provider Loading"
2. Check `sdkInstance.providerLoader` exists
3. Step through `load('socure')` call
4. Inspect provider state after loading

### Debugging SDK Configuration

1. Set breakpoint at "Before SDK Construction"  
2. Examine `sdkConfig` object
3. Verify `providers.socure.publicKey` has correct value
4. Step through constructor execution

### Debugging Verification UI

1. Set breakpoint at "Before Provider Initialization"
2. Check container element exists
3. Verify token and sessionId values
4. Step through `initializeVerification` call

## 🔗 Linking Local SDK for Development

If you need to modify the SDK source code:

```bash
# Link local SDK to this project
npm run link:sdk

# Start SDK in watch mode (rebuilds on changes)
npm run dev:sdk

# Unlink when done
npm run unlink:sdk
```

## 🐛 Common Issues & Solutions

### Breakpoints Not Hit

- Ensure source maps are enabled (✅ already configured)
- Check VS Code is attached to correct Chrome instance
- Verify `debugBreakpoint()` calls are in executed code paths

### Can't See Variables in Debugger

- Use browser DevTools instead of VS Code for complex objects
- Check the Console tab for logged state information
- Use `window.vecuDebug.inspectSDKState()` for manual inspection

### Performance Issues

- Disable debug logging in production by setting `NODE_ENV=production`
- Remove `debugBreakpoint()` calls for performance-critical paths

## 📊 Debug Output Examples

When running in debug mode, you'll see logs like:

```
🔧 [SDK] [2024-01-19T10:30:00.000Z] Starting SDK verification initialization
🏭 [SOCURE] [2024-01-19T10:30:01.000Z] Loading Socure provider...  
⏱️ Provider Loading: 150.23ms
🔍 SDK State Inspector
  ├─ Initialized: true
  ├─ Active Sessions: Map(1)
  └─ Provider Registry: Map(1)
```

## 🎉 You're All Set!

Your VecuIDV SDK debugging environment is fully configured. Happy debugging! 🐛

---

**Need help?** Check the VS Code Run & Debug panel or use the browser DevTools for more advanced debugging features.