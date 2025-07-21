# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Setup

1. Copy `.env.example` to `.env.local` and configure your environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Update the API base URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://mpbahqqt37.execute-api.us-east-1.amazonaws.com/latest
   ```

## Commands

**Development:**
- `npm run dev` - Start Next.js development server with Turbopack on localhost:3000
- `npm run build` - Build production Next.js application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (configured to ignore lib/, .next/, node_modules/)

**TypeScript:**
- `npx tsc --noEmit` - Type check without emitting files

## Architecture

This is a Next.js 15.3.5 application with App Router that serves as a testing interface for the VECU IDV Web SDK, specifically for Socure identity verification integration.

### Key Components

1. **Main Application** (`src/app/page.tsx`): Testing interface with:
   - Mode toggle (Mock/Live)
   - Configuration inputs (Socure SDK Key, DocV Transaction Token, Backend API URL)
   - Real-time event logging
   - Embedded verification UI container

2. **SDK Integration**: Uses the VECU IDV Web SDK via npm package:
   - Unified interface for multiple identity verification providers
   - Event-driven architecture
   - Lazy loading of providers
   - Custom type definitions in `src/types/vecu-idv.d.ts`

### SDK Integration Pattern

The application bypasses normal SDK backend initialization for testing purposes:
```typescript
// Force SDK initialization without backend
vecuIDVRef.current.initialized = true;

// Create minimal session
const testSessionData: VerificationSession = {
  id: 'test-session-' + Date.now(),
  provider: 'socure',
  providerSessionId: docvToken,
  status: 'pending' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Load provider directly
const provider = await vecuIDVRef.current.providerLoader.load('socure');
```

## Important Context

- The SDK is installed via npm package
- The application supports both mock mode (for UI testing) and live mode (real Socure integration)
- Event logging provides real-time feedback for debugging verification flows
- The verification UI is embedded directly in the page container
- Uses Tailwind CSS 4.1.11 (alpha version) with inline theme configuration
- API endpoints are configurable via environment variables (see `.env.example`)
- The main form at `/` uses server actions to bypass CORS issues when calling external APIs