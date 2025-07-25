import { useState, useRef, useCallback } from "react";
import { config } from "@/lib/config";
import {
  logger,
  inspectSDKState,
  createTimer,
  debugBreakpoint,
} from "@/utils/debug";
import {
  VecuIDV as VecuIDVType,
  VecuIDVInstance,
  VerificationEvent,
} from "@/types/sdk";

// Import SDK dynamically to avoid build issues
let VecuIDV: VecuIDVType | undefined;

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
  const vecuIDVRef = useRef<VecuIDVInstance | null>(null);

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

        // Load SDK dynamically from public folder using UMD build
        if (!VecuIDV && typeof window !== "undefined") {
          try {
            // Use UMD build for better compatibility with dynamic loading
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "/lib/index.umd.js";
              script.onload = () => {
                logger.sdk("UMD script loaded successfully");
                resolve();
              };
              script.onerror = (error) => {
                logger.error("Failed to load UMD script", error);
                reject(new Error("Failed to load SDK script"));
              };
              document.head.appendChild(script);
            });

            // UMD build should expose VecuIDV globally
            const globalVecuIDV = (window as { VecuIDV?: Record<string, unknown> }).VecuIDV;
            logger.sdk("Global VecuIDV object:", globalVecuIDV);
            logger.sdk("Available keys on window.VecuIDV:", globalVecuIDV ? Object.keys(globalVecuIDV) : "none");
            
            if (!globalVecuIDV) {
              throw new Error("VecuIDV not found on window object after UMD load");
            }
            
            // The UMD build exposes the VecuIDV class in the namespace
            VecuIDV = globalVecuIDV.VecuIDV as VecuIDVType;
            logger.sdk("VecuIDV loaded from UMD build", VecuIDV);
          } catch (error) {
            logger.error("Failed to load SDK module", error);
            throw new Error("Could not load VecuIDV SDK");
          }
        }

        logger.sdk("VecuIDV imported from npm package", VecuIDV);

        // Initialize SDK
        const sdkConfig = {
          sdkKey: config.sdkKey, // For API client
          apiUrl: config.sdkApiUrl,
          environment: config.isDevelopment ? "development" : "production",
        };

        logger.sdk("Initializing SDK with config", sdkConfig);
        debugBreakpoint("Before SDK Construction", { config: sdkConfig });

        vecuIDVRef.current = new VecuIDV!(sdkConfig);

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

        logger.sdk("Initializing SDK...");

        // Initialize the SDK first
        await sdkInstance.init();
        logger.sdk("SDK initialized successfully");

        // Clear any existing content in the container before initializing
        const container = document.getElementById("verification-container");
        if (!container) {
          throw new Error("Verification container not found");
        }
        container.innerHTML = "";

        logger.sdk("Container found and cleared");

        // Create verification session using the new API
        const startVerificationOptions = {
          provider: providerName,
          token: docvToken,
          container: container as HTMLElement,
          mode: "embedded" as const,
          config: {
            publicKey: config.sdkKey,
            qrCode: true,
          },
        };

        debugBreakpoint("Before Verification Start", {
          token: docvToken,
          providerName: providerName,
          publicKey: config.sdkKey,
        });

        const verificationTimer = createTimer("Verification Start");
        const cleanup = await sdkInstance.startVerification(
          startVerificationOptions
        );
        verificationTimer.end();

        logger.sdk("Verification started successfully", {
          provider: providerName,
          token: docvToken,
        });

        logger.provider(
          providerName,
          "Verification UI initialized successfully"
        );
        initTimer.end();

        return cleanup;
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

  return {
    isVerifying,
    verificationState,
    completionData,
    initializeSDKVerification,
    stopVerification,
    resetVerification,
  };
}
