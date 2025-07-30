import { useState, useRef, useCallback } from "react";
import { config } from "@/lib/config";
import { logger, createTimer } from "@/utils/debug";
import type { CustomerInfo } from "@/types/customer";

// Types for SDK global interface with hybrid approach
interface IVecuIDVSDKGlobal {
  launch: (
    sdkKey: string,
    transactionToken: string,
    containerSelector: string | HTMLElement,
    options?: {
      onProgress?: (event: {
        step: string;
        percentage: number;
        message?: string;
      }) => void;
      onSuccess?: (result: unknown) => void;
      onError?: (error: Error) => void;
      provider?: string;
      mode?: "modal" | "embedded";
      theme?: Record<string, unknown>;
      language?: string;
      config?: Record<string, unknown>;
    }
  ) => Promise<() => void>;
  startVerificationWithCustomer: (
    sdkKey: string,
    containerSelector: string | HTMLElement,
    options: {
      customerInfo: CustomerInfo;
      referenceId?: string;
      onProgress?: (event: {
        step: string;
        percentage: number;
        message?: string;
      }) => void;
      onSuccess?: (result: unknown) => void;
      onError?: (error: Error) => void;
      provider?: string;
      deploymentStage?: "sandbox" | "production" | "preprod";
      mode?: "modal" | "embedded";
      theme?: Record<string, unknown>;
      language?: string;
      config?: Record<string, unknown>;
    }
  ) => Promise<() => void>;
  configure: (options: {
    apiUrl?: string;
    timeout?: number;
    maxRetries?: number;
    logLevel?: "debug" | "info" | "warn" | "error";
    debug?: boolean;
    enableDirectAPI?: boolean;
    apiEndpoints?: {
      startVerification?: string;
    };
  }) => void;
}


export function useVerificationSDKHybrid() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "completed" | "failed"
  >("idle");
  const [completionData, setCompletionData] = useState<{
    message: string;
    result: Record<string, unknown>;
    sessionId: string;
  } | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);

  const initializeSDKVerificationWithCustomer = useCallback(
    async (
      customerInfo: CustomerInfo,
      deploymentStage: "sandbox" | "production" | "preprod"
    ) => {
      const initTimer = createTimer("SDK Hybrid Initialization");

      try {
        setIsVerifying(true);
        setVerificationState("verifying");
        logger.sdk("Starting SDK hybrid verification initialization", {
          customerInfo,
          deploymentStage,
        });

        // Load SDK bundle dynamically
        if (typeof window !== "undefined" && !(window as unknown as { VecuIDVSDK?: IVecuIDVSDKGlobal }).VecuIDVSDK) {
          try {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "/lib/vecu-idv-sdk.bundle.js";
              script.onload = () => {
                logger.sdk("SDK bundle loaded successfully");
                resolve();
              };
              script.onerror = (error) => {
                logger.error("Failed to load SDK bundle", error);
                reject(new Error("Failed to load SDK bundle"));
              };
              document.head.appendChild(script);
            });

            // Check if VecuIDVSDK is available
            const globalSDK = (window as unknown as { VecuIDVSDK?: IVecuIDVSDKGlobal }).VecuIDVSDK;
            if (!globalSDK) {
              throw new Error(
                "VecuIDVSDK not found on window object after bundle load"
              );
            }

            logger.sdk("VecuIDVSDK loaded successfully", globalSDK);
          } catch (error) {
            logger.error("Failed to load SDK", error);
            throw new Error("Could not load VecuIDV SDK");
          }
        }

        const VecuIDVSDK = (window as unknown as { VecuIDVSDK: IVecuIDVSDKGlobal }).VecuIDVSDK;

        // Configure SDK globally with enableDirectAPI and proxy URL
        VecuIDVSDK.configure({
          apiUrl: "/api/vecu-proxy", // Use proxy to avoid CORS
          debug: config.isDevelopment,
          logLevel: config.isDevelopment ? "debug" : "info",
          enableDirectAPI: true,
        });

        // Find and prepare the verification container
        const container = document.getElementById("verification-container");
        if (!container) {
          throw new Error("Verification container not found");
        }

        // Clear any existing content and make it visible with loading spinner
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center min-h-[400px] space-y-4 m-auto">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-gray-600 text-lg">Loading verification ...</p>
            <p class="text-gray-500 text-sm">Please wait while we prepare your verification</p>
          </div>
        `;
        container.classList.remove("hidden");
        container.style.display = "flex";

        // Ensure container is ready
        await new Promise((resolve) => setTimeout(resolve, 50));

        logger.sdk("Container found and prepared with loading spinner");

        const verificationTimer = createTimer("SDK Launch with Customer");

        // Update loading message
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center min-h-[400px] space-y-4 m-auto">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-gray-600 text-lg">Initializing verification...</p>
            <p class="text-gray-500 text-sm">Starting verification process</p>
          </div>
        `;

        // Use the new hybrid method
        cleanupFnRef.current = await VecuIDVSDK.startVerificationWithCustomer(
          config.sdkKey,
          container,
          {
            customerInfo,
            deploymentStage,
            mode: "embedded",
            onProgress: (event) => {
              logger.sdk(
                `Progress: ${event.step} (${event.percentage}%)`,
                event
              );
            },
            onSuccess: (result) => {
              logger.sdk("🎉 Verification completed successfully!", result);

              const completionData = {
                message: "Verification completed successfully!",
                result: (result as Record<string, unknown>) || {},
                sessionId: (result as { sessionId?: string })?.sessionId || "unknown",
              };

              // Clear and hide the verification container
              const container = document.getElementById(
                "verification-container"
              );
              if (container) {
                container.innerHTML = "";
                container.style.display = "none";
                container.classList.add("hidden");
              }

              setCompletionData(completionData);
              setVerificationState("completed");
              setIsVerifying(false);
            },
            onError: (error) => {
              logger.error("Verification failed:", error);
              setVerificationState("failed");
              setIsVerifying(false);
            },
            config: {
              qrCode: true,
            },
          }
        );

        verificationTimer.end();

        logger.sdk("SDK hybrid verification launched successfully", {
          deploymentStage,
        });
        initTimer.end();

        return cleanupFnRef.current;
      } catch (error) {
        console.error("SDK hybrid initialization error:", error);
        setIsVerifying(false);
        setVerificationState("failed");
        throw error;
      }
    },
    []
  );

  const stopVerification = useCallback(async () => {
    try {
      // Call cleanup function if available
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
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
      container.style.display = "none";
      container.classList.add("hidden");
    }
  }, []);

  const resetVerification = useCallback(() => {
    setVerificationState("idle");
    setCompletionData(null);
    setIsVerifying(false);

    // Show the container again
    const container = document.getElementById("verification-container");
    if (container) {
      container.style.display = "none";
      container.classList.add("hidden");
    }
  }, []);

  return {
    isVerifying,
    verificationState,
    completionData,
    initializeSDKVerificationWithCustomer,
    stopVerification,
    resetVerification,
  };
}