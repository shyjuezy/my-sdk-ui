# SDK Version Verification Guide

## Quick Check Commands

### 1. Compare File Timestamps
```bash
# Check which folder has the latest files
ls -la public/lib/vecu-idv-sdk.bundle.js public/dist/vecu-idv-sdk.bundle.js

# Current result shows lib/ is newer (15:45 vs 14:07)
```

### 2. Verify Application Usage
```bash
# Check which path your app uses
grep -n "lib\|dist" src/hooks/useVerificationSDK.ts

# Result: Line 71 uses "/lib/vecu-idv-sdk.bundle.js" ✅
```

### 3. SDK Source Version
```bash
# Check current SDK version
grep '"version"' ../vecu-idv-web-sdk/package.json
# Result: "version": "1.0.0"
```

## Current Status ✅

- **Your app uses:** `/lib/vecu-idv-sdk.bundle.js`
- **Latest files are in:** `public/lib/` (timestamp: 15:45)
- **Older files in:** `public/dist/` (timestamp: 14:07)
- **SDK version:** 1.0.0

## Ensure Latest SDK Usage

### Option 1: Always rebuild to /lib (Recommended)
```bash
# Use the existing script (copies to lib/)
npm run update:sdk
```

### Option 2: Clean old dist folder
```bash
# Remove the old dist folder to avoid confusion
rm -rf public/dist
```

### Option 3: Update build scripts to use consistent folder
Currently your scripts copy to `lib/`, which is correct since that's what your app uses.

## Runtime Verification

Add this to your component to verify SDK version in browser:

```typescript
// In your component
useEffect(() => {
  console.log('SDK file path:', '/lib/vecu-idv-sdk.bundle.js');
  console.log('Check Network tab for actual file load');
}, []);
```

## Build Process Summary

1. **Source:** `../vecu-idv-web-sdk/` (version 1.0.0)
2. **Build:** `npm run update:sdk` → copies to `public/lib/`
3. **App uses:** `/lib/vecu-idv-sdk.bundle.js` ✅
4. **Latest files:** In `public/lib/` (15:45 timestamp) ✅

**Conclusion:** You're currently using the latest SDK version! The `public/dist/` folder contains older files that aren't being used.