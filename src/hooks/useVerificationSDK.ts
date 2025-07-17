import { useState, useRef, useCallback } from "react";
import { config } from "@/lib/config";
import { VecuIDV } from "vecu-idv-web-sdk";
import type { IVecuEvent } from "vecu-idv-web-sdk";
import type { VecuIDVTestInstance, VecuEventData } from "@/types/verification";

// Type alias for the VecuIDV instance
type VecuIDVInstance = InstanceType<typeof VecuIDV>;

declare global {
  interface Window {
    VecuIDV?: { VecuIDV: typeof VecuIDV };
  }
}

export function useVerificationSDK() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const vecuIDVRef = useRef<VecuIDVInstance | null>(null);

  const initializeSDKVerification = useCallback(
    async (docvToken: string) => {
      try {
        setIsVerifying(true);

        // Wait for SDK to be loaded
        if (!sdkLoaded || !window.VecuIDV) {
          throw new Error("SDK not loaded yet. Please wait...");
        }

        // Clear any existing content in the container before initializing
        const container = document.getElementById("verification-container");
        if (container) {
          container.innerHTML = "";
        }

        const VecuIDVConstructor = window.VecuIDV.VecuIDV;

        // Clean up any existing SDK instance before creating a new one
        if (vecuIDVRef.current) {
          try {
            vecuIDVRef.current.destroy();
          } catch (e) {
            console.warn("Error cleaning up previous SDK instance:", e);
          }
          vecuIDVRef.current = null;
        }

        // Initialize SDK
        vecuIDVRef.current = new VecuIDVConstructor({
          apiKey: "your-real-api-key",
          apiUrl: "http://localhost:3000/api",
          environment: "development",
          providers: {
            socure: {
              publicKey: config.sdkKey,
              environment: "sandbox",
              qrCode: true,
            },
          },
        });

        // Subscribe to events - return cleanup function
        const eventHandlers = {
          "verification:completed": (event: IVecuEvent) => {
            console.log("Verification completed successfully!", event.data);
            setIsVerifying(false);
          },
          "verification:failed": (event: IVecuEvent) => {
            const eventData = event.data as VecuEventData;
            console.error("Verification failed:", eventData.error);
            setIsVerifying(false);
          },
          error: (event: IVecuEvent) => {
            const eventData = event.data as VecuEventData;
            console.error("SDK Error:", eventData.message);
            setIsVerifying(false);
          },
        };

        // Register event handlers
        Object.entries(eventHandlers).forEach(([eventName, handler]) => {
          vecuIDVRef.current?.on(eventName, handler);
        });

        const sdkInstance = vecuIDVRef.current;
        if (!sdkInstance) {
          throw new Error("Failed to initialize SDK instance");
        }

        // Since we're bypassing the normal SDK initialization for testing,
        // we need to use the SDK's public API differently
        // The SDK is designed to be used with createVerification, but for testing
        // we're directly loading the provider

        // Force the SDK to be initialized without calling the backend
        // Note: This is a workaround for testing only
        const testInstance = sdkInstance as unknown as VecuIDVTestInstance;
        testInstance.initialized = true;

        // Create a minimal session
        const testSessionData = {
          id: "session-" + Date.now(),
          provider: "socure",
          providerSessionId: docvToken,
          status: "pending" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "test-user",
          metadata: {},
        };

        // Store the session in the SDK's active sessions
        // Note: This is accessing private properties for testing only
        testInstance.activeSessions.set(
          testSessionData.id,
          testSessionData
        );

        // Load the Socure provider
        const provider = await testInstance.providerLoader.load(
          "socure"
        );

        // Initialize the verification UI
        if (!container) {
          throw new Error("Verification container not found");
        }

        console.log(
          "[initializeSDKVerification] Initializing verification UI..."
        );
        await provider.initializeVerification({
          sessionId: testSessionData.id,
          token: docvToken,
          container: container as HTMLElement,
          mode: "embedded",
          config: {
            publicKey: config.sdkKey,
            qrCode: true,
          },
        });

        return () => {
          // Cleanup function
          // Cleanup function
          // Note: You'd need to implement off() method in the SDK to properly clean up event handlers
        };
      } catch (error) {
        console.error("SDK initialization error:", error);
        setIsVerifying(false);
        throw error;
      }
    },
    [sdkLoaded]
  );

  const stopVerification = useCallback(async () => {
    try {
      // Clean up the SDK if it exists
      if (vecuIDVRef.current) {
        vecuIDVRef.current.destroy();
        vecuIDVRef.current = null;
      }
    } catch (error) {
      console.error("Error cleaning up:", error);
    }

    // Reset UI
    setIsVerifying(false);
  }, []);

  return {
    sdkLoaded,
    setSdkLoaded,
    isVerifying,
    initializeSDKVerification,
    stopVerification,
  };
}
