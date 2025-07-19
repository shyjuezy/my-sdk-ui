import { useState, useRef, useCallback } from 'react';
import { VecuIDV, VecuIDVConstructor, VerificationSession, VerificationEvent } from '@/types/verification';
import { config } from '@/lib/config';
import { logger, inspectSDKState, inspectProviderState, createTimer, debugBreakpoint } from '@/utils/debug';

declare global {
  interface Window {
    VecuIDV?: { VecuIDV: VecuIDVConstructor };
  }
}

export function useVerificationSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'completed' | 'failed'>('idle');
  const [completionData, setCompletionData] = useState<{
    message: string;
    result: Record<string, unknown>;
    sessionId: string;
  } | null>(null);
  const vecuIDVRef = useRef<VecuIDV | null>(null);

  const initializeSDKVerification = useCallback(async (docvToken: string) => {
    const initTimer = createTimer('SDK Initialization');
    
    try {
      setIsVerifying(true);
      setVerificationState('verifying');
      logger.sdk('Starting SDK verification initialization', { docvToken });
      
      // Wait for SDK to be loaded
      if (!sdkLoaded || !window.VecuIDV) {
        throw new Error('SDK not loaded yet. Please wait...');
      }
      
      const VecuIDVConstructor = window.VecuIDV.VecuIDV;
      logger.sdk('VecuIDV Constructor found', VecuIDVConstructor);
      
      // Initialize SDK
      const sdkConfig = {
        apiKey: 'your-real-api-key',
        apiUrl: 'http://localhost:3000/api',
        environment: 'development',
        providers: {
          socure: {
            publicKey: config.sdkKey,
            environment: 'sandbox',
            qrCode: true
          }
        }
      };
      
      logger.sdk('Initializing SDK with config', sdkConfig);
      debugBreakpoint('Before SDK Construction', { config: sdkConfig });
      
      vecuIDVRef.current = new VecuIDVConstructor(sdkConfig);
      
      logger.sdk('SDK instance created successfully');
      inspectSDKState(vecuIDVRef.current);
      
      // Subscribe to events - return cleanup function
      const eventHandlers = {
        'verification:completed': (event: VerificationEvent) => {
          
          const message = String(event.data.message || 'Verification completed successfully!');
          logger.sdk('🎉 Verification completed:', message, event.data);
          
          const completionData = {
            message,
            result: (event.data.result || event.data) as Record<string, unknown>,
            sessionId: String(event.data.sessionId || 'unknown')
          };
          
          
          // Clear the verification container to remove Socure's "Thank You" message
          const container = document.getElementById('verification-container');
          if (container) {
            container.innerHTML = '';
            container.style.display = 'none'; // Hide the container
          }
          
          // Set completion state and data
          setCompletionData(completionData);
          setVerificationState('completed');
          setIsVerifying(false);
          
        },
        'verification:failed': (event: VerificationEvent) => {
          logger.error('Verification failed:', event.data.error);
          setVerificationState('failed');
          setIsVerifying(false);
        },
        'error': (event: VerificationEvent) => {
          logger.error('SDK Error:', event.data.message);
          setVerificationState('failed');
          setIsVerifying(false);
        }
      };

      // Register event handlers
      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        vecuIDVRef.current?.on(eventName, handler);
        logger.sdk(`✅ Registered event handler: ${eventName}`);
      });
      
      const sdkInstance = vecuIDVRef.current;
      if (!sdkInstance) {
        throw new Error('Failed to initialize SDK instance');
      }
      
      logger.sdk('Bypassing backend initialization (test mode)');
      debugBreakpoint('Before Force Initialize', sdkInstance);
      
      // Force the SDK to be initialized without calling the backend
      sdkInstance.initialized = true;
      
      // Create a minimal session
      const testSessionData: VerificationSession = {
        id: 'session-' + Date.now(),
        provider: 'socure',
        providerSessionId: docvToken,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      logger.sdk('Created test session data', testSessionData);
      
      // Store the session in the SDK's active sessions
      sdkInstance.activeSessions.set(testSessionData.id, testSessionData);
      logger.sdk('Stored session in activeSessions map');
      
      debugBreakpoint('Before Provider Loading', { sessionId: testSessionData.id });
      
      // Load the Socure provider
      const providerTimer = createTimer('Provider Loading');
      logger.provider('socure', 'Loading Socure provider...');
      const provider = await sdkInstance.providerLoader.load('socure');
      providerTimer.end();
      
      logger.provider('socure', 'Provider loaded successfully');
      inspectProviderState(provider, 'socure');
      
      // Initialize the verification UI
      const container = document.querySelector('#verification-container');
      if (!container) {
        throw new Error('Verification container not found');
      }
      
      logger.provider('socure', 'Container found, initializing verification UI', container);
      debugBreakpoint('Before Provider Initialization', { 
        sessionId: testSessionData.id, 
        token: docvToken,
        publicKey: config.sdkKey 
      });
      
      const verificationTimer = createTimer('Verification UI Initialization');
      await provider.initializeVerification({
        sessionId: testSessionData.id,
        token: docvToken,
        container: container as HTMLElement,
        mode: 'embedded',
        config: {
          publicKey: config.sdkKey,
          qrCode: true
        }
      });
      verificationTimer.end();
      
      logger.provider('socure', 'Verification UI initialized successfully');
      initTimer.end();

      return () => {
        logger.sdk('Cleanup function called');
      };
      
    } catch (error) {
      console.error('SDK initialization error:', error);
      setIsVerifying(false);
      setVerificationState('failed');
      throw error;
    }
  }, [sdkLoaded]);

  const stopVerification = useCallback(async () => {
    try {
      // Clean up the provider if it exists
      if (vecuIDVRef.current) {
        const provider = vecuIDVRef.current.providerRegistry?.get('socure');
        if (provider) {
          provider.destroy();
        }
        
        // Clear active sessions
        vecuIDVRef.current.activeSessions.clear();
        vecuIDVRef.current.destroy();
        vecuIDVRef.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
    
    // Reset UI
    setIsVerifying(false);
    setVerificationState('idle');
    setCompletionData(null);
    const container = document.getElementById('verification-container');
    if (container) {
      container.innerHTML = '';
    }
  }, []);

  const resetVerification = useCallback(() => {
    setVerificationState('idle');
    setCompletionData(null);
    setIsVerifying(false);
    
    // Show the container again
    const container = document.getElementById('verification-container');
    if (container) {
      container.style.display = 'flex';
    }
  }, []);

  // Manual trigger for testing - forces completion state
  const triggerCompletion = useCallback((testMessage?: string) => {
    const completionData = {
      message: testMessage || 'Verification completed successfully! (Manual trigger)',
      result: { status: 'completed' } as Record<string, unknown>,
      sessionId: 'manual-test-session'
    };
    
    // Clear container
    const container = document.getElementById('verification-container');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
    
    setCompletionData(completionData);
    setVerificationState('completed');
    setIsVerifying(false);
  }, []);

  return {
    sdkLoaded,
    setSdkLoaded,
    isVerifying,
    verificationState,
    completionData,
    initializeSDKVerification,
    stopVerification,
    resetVerification,
    triggerCompletion, // For manual testing
  };
}
