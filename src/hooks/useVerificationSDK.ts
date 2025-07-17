import { useState, useRef, useCallback } from 'react';
import { VecuIDV, VecuIDVConstructor, VerificationSession, VerificationEvent } from '@/types/verification';
import { config } from '@/lib/config';

declare global {
  interface Window {
    VecuIDV?: { VecuIDV: VecuIDVConstructor };
  }
}

export function useVerificationSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const vecuIDVRef = useRef<VecuIDV | null>(null);

  const initializeSDKVerification = useCallback(async (docvToken: string) => {
    try {
      setIsVerifying(true);
      
      // Wait for SDK to be loaded
      if (!sdkLoaded || !window.VecuIDV) {
        throw new Error('SDK not loaded yet. Please wait...');
      }
      
      const VecuIDVConstructor = window.VecuIDV.VecuIDV;
      
      // Initialize SDK
      vecuIDVRef.current = new VecuIDVConstructor({
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
      });
      
      // Subscribe to events - return cleanup function
      const eventHandlers = {
        'verification:completed': (event: VerificationEvent) => {
          console.log('Verification completed successfully!', event.data);
          setIsVerifying(false);
        },
        'verification:failed': (event: VerificationEvent) => {
          console.error('Verification failed:', event.data.error);
          setIsVerifying(false);
        },
        'error': (event: VerificationEvent) => {
          console.error('SDK Error:', event.data.message);
          setIsVerifying(false);
        }
      };

      // Register event handlers
      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        vecuIDVRef.current?.on(eventName, handler);
      });
      
      const sdkInstance = vecuIDVRef.current;
      if (!sdkInstance) {
        throw new Error('Failed to initialize SDK instance');
      }
      
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
      
      // Store the session in the SDK's active sessions
      sdkInstance.activeSessions.set(testSessionData.id, testSessionData);
      
      // Load the Socure provider
      const provider = await sdkInstance.providerLoader.load('socure');
      
      // Initialize the verification UI
      const container = document.querySelector('#verification-container');
      if (!container) {
        throw new Error('Verification container not found');
      }
      
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

      return () => {
        // Cleanup function
        // Cleanup function
        // Note: You'd need to implement off() method in the SDK to properly clean up event handlers
      };
      
    } catch (error) {
      console.error('SDK initialization error:', error);
      setIsVerifying(false);
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
    const container = document.getElementById('verification-container');
    if (container) {
      container.innerHTML = '';
    }
  }, []);

  return {
    sdkLoaded,
    setSdkLoaded,
    isVerifying,
    initializeSDKVerification,
    stopVerification,
  };
}
