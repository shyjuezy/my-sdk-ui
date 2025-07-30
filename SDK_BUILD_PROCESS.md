# SDK Build Process

This document describes the process for building and deploying the VECU IDV Web SDK to the UI application.

## Overview

The VECU IDV Web SDK is built from the source code in `../vecu-idv-web-sdk` and deployed to the `public/lib/` folder in this UI application for testing and development purposes.

## Build Commands

The following npm scripts are available to manage the SDK build process:

### 1. Development Scripts

```bash
# Start SDK development with watch mode
npm run dev:sdk

# Link SDK for development (creates symlink)
npm run link:sdk

# Unlink SDK
npm run unlink:sdk
```

### 2. Production Build Scripts

```bash
# Build and copy all SDK files to public/lib/
npm run update:sdk

# Build and copy only the secure bundle file
npm run build:secure-sdk
```

## Build Outputs

### Standard Build (`npm run update:sdk`)

Creates the following files in `public/lib/`:

- **Core SDK Files:**
  - `index.js` - CommonJS build
  - `index.esm.js` - ES Module build  
  - `index.umd.js` - UMD build
  - `index.d.ts` - TypeScript definitions

- **Provider Chunks:**
  - `chunks/SocureProvider-*.js` - Lazy-loaded Socure provider chunks
  - `chunks/SocureProvider-*.esm.js` - ES Module provider chunks

- **Type Definitions:**
  - Complete TypeScript definition files for all modules
  - Source maps for debugging

### Bundle Build (`npm run build:secure-sdk`)

Creates a single bundled file:
- `vecu-idv-sdk.bundle.js` - Self-contained SDK bundle

## Integration with UI

The UI application can load the SDK in two ways:

1. **Standard Module Loading:** Use the individual files from `public/lib/`
2. **Bundle Loading:** Use the single `vecu-idv-sdk.bundle.js` file

## Build Process Details

### Source Location
- SDK source: `/Users/shyju.viswambaran/frontend/vecu-idv-web-sdk/`
- UI application: `/Users/shyju.viswambaran/frontend/my-sdk-ui/`

### Build Steps

1. **Clean & Build SDK**
   ```bash
   cd ../vecu-idv-web-sdk
   npm run build  # or npm run build:bundle for bundle
   ```

2. **Copy to Public Folder**
   ```bash
   cp -r dist/* ../my-sdk-ui/public/lib/
   ```

### Build Configuration

The SDK uses Rollup for building with the following configurations:
- **rollup.config.js** - Standard multi-format build
- **rollup.config.bundle.js** - Single bundle build

## Development Workflow

For active development:

1. **Start SDK in watch mode:**
   ```bash
   npm run dev:sdk
   ```

2. **Or use symlink for real-time updates:**
   ```bash
   npm run link:sdk
   ```

3. **For production testing:**
   ```bash
   npm run update:sdk
   npm run dev
   ```

## Files Structure

```
public/lib/
├── index.js                    # CommonJS entry
├── index.esm.js               # ES Module entry  
├── index.umd.js               # UMD entry
├── index.d.ts                 # TypeScript definitions
├── vecu-idv-sdk.bundle.js     # Single bundle file
├── chunks/                    # Lazy-loaded provider chunks
├── config/                    # Configuration type definitions
├── constants/                 # Constants type definitions
├── core/                      # Core SDK type definitions
├── providers/                 # Provider type definitions
├── services/                  # Service type definitions
├── types/                     # General type definitions
└── utils/                     # Utility type definitions
```

## Notes

- Build warnings about missing `DeploymentStage` export are expected and don't affect functionality
- The build process includes TypeScript compilation and code optimization
- Source maps are generated for debugging purposes
- The bundle version is recommended for production use

## Troubleshooting

If builds fail:

1. Ensure Node.js version >= 14
2. Check that all dependencies are installed in the SDK directory
3. Verify the UI application's public folder exists
4. Check file permissions for copying operations

For development issues, use the linking approach with `npm run link:sdk` for immediate feedback during development.