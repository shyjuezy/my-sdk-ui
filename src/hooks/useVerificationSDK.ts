import { useState, useRef, useCallback } from "react";
import { config } from "@/lib/config";
import { logger, createTimer, debugBreakpoint } from "@/utils/debug";

// Types for SDK global interface
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
      mode?: 'modal' | 'embedded';
      theme?: Record<string, unknown>;
      language?: string;
      config?: Record<string, unknown>;
    }
  ) => Promise<() => void>;
  configure: (options: {
    apiUrl?: string;
    timeout?: number;
    maxRetries?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    debug?: boolean;
  }) => void;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);

  const initializeSDKVerification = useCallback(
    async (docvToken: string, providerName: string) => {
      const initTimer = createTimer("SDK Initialization");

      try {
        setIsVerifying(true);
        setVerificationState("verifying");
        logger.sdk("Starting SDK verification initialization", { docvToken });

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
            const globalSDK = (
              window as unknown as { VecuIDVSDK?: IVecuIDVSDKGlobal }
            ).VecuIDVSDK;
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

        const VecuIDVSDK = (
          window as unknown as { VecuIDVSDK: IVecuIDVSDKGlobal }
        ).VecuIDVSDK;

        // Configure SDK globally
        VecuIDVSDK.configure({
          apiUrl: config.sdkApiUrl,
          debug: config.isDevelopment,
          logLevel: config.isDevelopment ? "debug" : "info",
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

        debugBreakpoint("Before SDK Launch", {
          token: docvToken,
          providerName: providerName,
          sdkKey: config.sdkKey,
        });

        const verificationTimer = createTimer("SDK Launch");

        // Update loading message
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center min-h-[400px] space-y-4 m-auto">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-gray-600 text-lg">Initializing verification...</p>
            <p class="text-gray-500 text-sm">Starting verification process</p>
          </div>
        `;

        // Launch verification with the SDK
        cleanupFnRef.current = await VecuIDVSDK.launch(
          config.sdkKey,
          docvToken,
          container,
          {
            provider: providerName,
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
                sessionId: (result as { sessionId?: string })?.sessionId || docvToken,
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
              
              // Clear and hide the verification container
              const container = document.getElementById("verification-container");
              if (container) {
                container.innerHTML = "";
                container.style.display = "none";
                container.classList.add("hidden");
              }
              
              setVerificationState("failed");
              setIsVerifying(false);
              
              // Set user-friendly error message
              const originalMessage = (error as Error).message || '';
              let userFriendlyMessage = '';
              
              if (originalMessage.includes('CORS') || originalMessage.includes('Access-Control-Allow-Origin')) {
                userFriendlyMessage = "Unable to connect to verification service. This may be due to network restrictions or configuration issues.";
              } else if (originalMessage.includes('Failed to fetch')) {
                userFriendlyMessage = "Network connection error. Please check your internet connection and try again.";
              } else if (originalMessage.includes('timeout') || originalMessage.includes('timed out')) {
                userFriendlyMessage = "Request timed out. Please try again.";
              } else if (originalMessage.includes('401') || originalMessage.includes('Unauthorized')) {
                userFriendlyMessage = "Authentication failed. Please check your credentials.";
              } else if (originalMessage.includes('403') || originalMessage.includes('Forbidden')) {
                userFriendlyMessage = "Access denied. Please check your permissions.";
              } else if (originalMessage.includes('404')) {
                userFriendlyMessage = "Verification service not found. Please check your configuration.";
              } else if (originalMessage.includes('500') || originalMessage.includes('Internal Server Error')) {
                userFriendlyMessage = "Verification service is temporarily unavailable. Please try again later.";
              } else {
                userFriendlyMessage = "Something went wrong during verification. Please try again.";
              }
              
              setErrorMessage(userFriendlyMessage);
            },
            config: {
              publicKey: config.sdkKey,
              qrCode: true,
            },
          }
        );

        verificationTimer.end();

        logger.sdk("SDK verification launched successfully", {
          provider: providerName,
          token: docvToken,
        });

        logger.provider(
          providerName,
          "Verification UI initialized successfully"
        );
        initTimer.end();

        return cleanupFnRef.current;
      } catch (error) {
        console.error("SDK initialization error:", error);
        
        // Clear and hide the verification container
        const container = document.getElementById("verification-container");
        if (container) {
          container.innerHTML = "";
          container.style.display = "none";
          container.classList.add("hidden");
        }
        
        setIsVerifying(false);
        setVerificationState("failed");
        
        // Enhanced error handling with user-friendly messages
        const originalMessage = (error as Error).message || '';
        let userFriendlyMessage = '';
        
        if (originalMessage.includes('CORS') || originalMessage.includes('Access-Control-Allow-Origin')) {
          userFriendlyMessage = "Unable to connect to verification service. This may be due to network restrictions or configuration issues.";
        } else if (originalMessage.includes('Failed to fetch')) {
          userFriendlyMessage = "Network connection error. Please check your internet connection and try again.";
        } else if (originalMessage.includes('timeout') || originalMessage.includes('timed out')) {
          userFriendlyMessage = "Request timed out. Please try again.";
        } else if (originalMessage.includes('401') || originalMessage.includes('Unauthorized')) {
          userFriendlyMessage = "Authentication failed. Please check your credentials.";
        } else if (originalMessage.includes('403') || originalMessage.includes('Forbidden')) {
          userFriendlyMessage = "Access denied. Please check your permissions.";
        } else if (originalMessage.includes('404')) {
          userFriendlyMessage = "Verification service not found. Please check your configuration.";
        } else if (originalMessage.includes('500') || originalMessage.includes('Internal Server Error')) {
          userFriendlyMessage = "Verification service is temporarily unavailable. Please try again later.";
        } else {
          userFriendlyMessage = "Something went wrong during verification. Please try again.";
        }
        
        // Set the error message for UI display
        setErrorMessage(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
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
    setErrorMessage(null); // Clear error message

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
    errorMessage,
    initializeSDKVerification,
    stopVerification,
    resetVerification,
  };
}
