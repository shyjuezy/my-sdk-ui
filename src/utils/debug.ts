/**
 * Debug utilities for VecuIDV SDK development
 */

export const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Enhanced console logging with timestamps and context
export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (DEBUG_MODE) {
      console.log(`🐛 [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (DEBUG_MODE) {
      console.info(`ℹ️ [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`⚠️ [${new Date().toISOString()}] ${message}`, ...args);
  },
  
  error: (message: string, ...args: unknown[]) => {
    console.error(`❌ [${new Date().toISOString()}] ${message}`, ...args);
  },
  
  sdk: (message: string, ...args: unknown[]) => {
    if (DEBUG_MODE) {
      console.log(`🔧 [SDK] [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  
  provider: (providerName: string, message: string, ...args: unknown[]) => {
    if (DEBUG_MODE) {
      console.log(`🏭 [${providerName.toUpperCase()}] [${new Date().toISOString()}] ${message}`, ...args);
    }
  }
};

// SDK State Inspector
export const inspectSDKState = (sdk: unknown) => {
  if (!DEBUG_MODE) return;
  
  console.group('🔍 SDK State Inspector');
  console.log('Initialized:', (sdk as { initialized?: boolean })?.initialized);
  console.log('Active Sessions:', (sdk as { activeSessions?: Map<string, unknown> })?.activeSessions);
  console.log('Provider Registry:', (sdk as { providerRegistry?: Map<string, unknown> })?.providerRegistry);
  console.log('Provider Loader:', (sdk as { providerLoader?: unknown })?.providerLoader);
  console.groupEnd();
};


// Performance Timing
export const createTimer = (label: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      logger.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
};

// Breakpoint helper for debugging
export const debugBreakpoint = (label: string, data?: unknown) => {
  if (DEBUG_MODE) {
    console.log(`🔴 BREAKPOINT: ${label}`);
    if (data) {
      console.log('Data:', data);
    }
    // Use debugger statement to pause execution
    debugger;
  }
};

// Global debug utilities (available in browser console)
if (typeof window !== 'undefined' && DEBUG_MODE) {
  (window as unknown as { vecuDebug: unknown }).vecuDebug = {
    logger,
    inspectSDKState,
    createTimer,
    debugBreakpoint
  };
  
  console.log('🎯 VecuIDV Debug utilities available as window.vecuDebug');
}