import { useState, useRef, useCallback } from "react";
import { config } from "@/lib/config";
import {
  logger,
  inspectSDKState,
  createTimer,
  debugBreakpoint,
} from "@/utils/debug";

// Import SDK dynamically to avoid build issues
let VecuIDV: typeof import("vecu-idv-web-sdk").VecuIDV | undefined;

// Types for our specific implementation
interface VerificationEvent {
  type: string;
  data: {
    message?: string;
    result?: Record<string, unknown>;
    sessionId?: string;
    error?: string;
  };
}

export function useVerificationSDK() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "completed" | "failed"
  >("idle");
  const [completionData, setCompletionData] = useState<{
    message: string;
    result: Record<string, unknown>;
    sessionId: string;
  } | null>(null);
  const vecuIDVRef = useRef<InstanceType<
    typeof import("vecu-idv-web-sdk").VecuIDV
  > | null>(null);

  const initializeSDKVerification = useCallback(
    async (docvToken: string, providerName: string) => {
      const initTimer = createTimer("SDK Initialization");

      console.log(
        "initializeSDKVerification########################",
        docvToken,
        providerName
      );

      try {
        setIsVerifying(true);
        setVerificationState("verifying");
        logger.sdk("Starting SDK verification initialization", { docvToken });

        // Dynamically import the SDK
        if (!VecuIDV) {
          const { VecuIDV: VecuIDVClass } = await import("vecu-idv-web-sdk");
          VecuIDV = VecuIDVClass;
        }

        logger.sdk("VecuIDV imported from npm package", VecuIDV);

        // Initialize SDK
        const sdkConfig = {
          apiKey: "your-real-api-key",
          apiUrl: "http://localhost:3000/api",
          environment: "development",
        };

        logger.sdk("Initializing SDK with config", sdkConfig);
        debugBreakpoint("Before SDK Construction", { config: sdkConfig });

        vecuIDVRef.current = new VecuIDV(sdkConfig);

        logger.sdk("SDK instance created successfully");
        inspectSDKState(vecuIDVRef.current);

        // Subscribe to events - return cleanup function
        const eventHandlers = {
          "verification:completed": (event: VerificationEvent) => {
            const message = String(
              event.data.message || "Verification completed successfully!"
            );
            logger.sdk("🎉 Verification completed:", message, event.data);

            const completionData = {
              message,
              result: (event.data.result || event.data) as Record<
                string,
                unknown
              >,
              sessionId: String(event.data.sessionId || "unknown"),
            };

            // Clear the verification container to remove Socure's "Thank You" message
            const container = document.getElementById("verification-container");
            if (container) {
              container.innerHTML = "";
              container.style.display = "none"; // Hide the container
            }

            // Set completion state and data
            setCompletionData(completionData);
            setVerificationState("completed");
            setIsVerifying(false);
          },
          "verification:failed": (event: VerificationEvent) => {
            logger.error("Verification failed:", event.data.error);
            setVerificationState("failed");
            setIsVerifying(false);
          },
          error: (event: VerificationEvent) => {
            logger.error("SDK Error:", event.data.message);
            setVerificationState("failed");
            setIsVerifying(false);
          },
        };

        // Register event handlers
        Object.entries(eventHandlers).forEach(([eventName, handler]) => {
          vecuIDVRef.current?.on(eventName, handler);
          logger.sdk(`✅ Registered event handler: ${eventName}`);
        });

        const sdkInstance = vecuIDVRef.current;
        if (!sdkInstance) {
          throw new Error("Failed to initialize SDK instance");
        }

        logger.sdk("Using hardcoded test mode - bypassing backend API");

        // Clear any existing content in the container before initializing
        const container = document.getElementById("verification-container");
        if (!container) {
          throw new Error("Verification container not found");
        }
        container.innerHTML = "";

        logger.sdk("Container found and cleared");

        // Force the SDK to be initialized without calling the backend
        // @ts-expect-error - Accessing private property for test mode
        sdkInstance.initialized = true;

        // Create a minimal test session with DocV token
        const testSessionData = {
          id: "session-" + Date.now(),
          provider: providerName,
          providerSessionId: docvToken,
          status: "pending" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        logger.sdk("Created test session data", testSessionData);

        // Store the session in the SDK's active sessions
        // @ts-expect-error - Accessing private property for test mode
        sdkInstance.activeSessions.set(testSessionData.id, testSessionData);
        logger.sdk("Stored session in activeSessions map");

        // Load the specified provider (this triggers auto-connect event forwarding)
        const providerTimer = createTimer("Provider Loading");
        logger.sdk(`Loading ${providerName} provider...`);
        // @ts-expect-error - Accessing private property for test mode
        const provider = await sdkInstance.providerLoader.load(providerName);
        providerTimer.end();

        logger.sdk(
          "Provider loaded successfully - auto-connect event forwarding should be active"
        );

        // Initialize the verification UI with DocV token
        logger.sdk(
          "Initializing verification UI with container and DocV token"
        );
        debugBreakpoint("Before Provider Initialization", {
          sessionId: testSessionData.id,
          token: docvToken,
          publicKey: config.sdkKey,
        });

        const verificationTimer = createTimer("Verification UI Initialization");
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
        verificationTimer.end();

        logger.sdk(
          "Verification UI initialized successfully with hardcoded test setup"
        );

        logger.provider(
          providerName,
          "Verification UI initialized successfully"
        );
        initTimer.end();

        return () => {
          logger.sdk("Cleanup function called");
        };
      } catch (error) {
        console.error("SDK initialization error:", error);
        setIsVerifying(false);
        setVerificationState("failed");
        throw error;
      }
    },
    []
  );

  const stopVerification = useCallback(async () => {
    try {
      // Clean up SDK instance
      if (vecuIDVRef.current) {
        vecuIDVRef.current.destroy();
        vecuIDVRef.current = null;
      }
    } catch (error) {
      console.error("Error cleaning up:", error);
    }

    // Reset UI
    setIsVerifying(false);
    setVerificationState("idle");
    setCompletionData(null);
    const container = document.getElementById("verification-container");
    if (container) {
      container.innerHTML = "";
    }
  }, []);

  const resetVerification = useCallback(() => {
    setVerificationState("idle");
    setCompletionData(null);
    setIsVerifying(false);

    // Show the container again
    const container = document.getElementById("verification-container");
    if (container) {
      container.style.display = "flex";
    }
  }, []);

  // Manual trigger for testing - forces completion state
  const triggerCompletion = useCallback((testMessage?: string) => {
    const completionData = {
      message:
        testMessage || "Verification completed successfully! (Manual trigger)",
      result: { status: "completed" } as Record<string, unknown>,
      sessionId: "manual-test-session",
    };

    // Clear container
    const container = document.getElementById("verification-container");
    if (container) {
      container.innerHTML = "";
      container.style.display = "none";
    }

    setCompletionData(completionData);
    setVerificationState("completed");
    setIsVerifying(false);
  }, []);

  return {
    isVerifying,
    verificationState,
    completionData,
    initializeSDKVerification,
    stopVerification,
    resetVerification,
    triggerCompletion, // For manual testing
  };
}
