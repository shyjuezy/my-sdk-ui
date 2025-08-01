import { useState, useRef, useCallback } from "react";
import { config } from "@/lib/config";
import { logger, createTimer } from "@/utils/debug";
import type { CustomerInfo } from "@/types/customer";
import { createVecuIDVSDK, type VecuIDVSecureSDK } from "vec-idp-web-sdk";

// Define the customer info interface to match the SDK's internal expectations
interface SDKCustomerInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address: {
    line1: string;
    line2?: string;
    locality: string;
    minorAdminDivision?: string;
    majorAdminDivision: string;
    country: string;
    postalCode: string;
    type: string;
  };
}

export function useVerificationSDKNPM() {
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

  const sdkInstanceRef = useRef<VecuIDVSecureSDK | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);

  const initializeSDKVerificationWithCustomer = useCallback(
    async (
      customerInfo: CustomerInfo,
      deploymentStage: "sandbox" | "production" | "preprod" = "sandbox"
    ) => {
      const initTimer = createTimer("NPM SDK Initialization");

      try {
        setIsVerifying(true);
        setVerificationState("verifying");
        logger.sdk("Starting NPM SDK verification initialization", {
          customerInfo,
          deploymentStage,
        });

        // Create SDK instance if not already created
        if (!sdkInstanceRef.current) {
          sdkInstanceRef.current = createVecuIDVSDK();

          // Configure the SDK instance after creation (like hybrid version)
          sdkInstanceRef.current.updateConfig({
            debug: config.isDevelopment,
            logLevel: config.isDevelopment ? "debug" : "info",
            deploymentStage: deploymentStage,
            enableDirectAPI: true,
            bearerToken: config.token,
          });

          logger.sdk("NPM SDK instance created successfully");
        }

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
            <p class="text-gray-500 text-sm">Please wait while we prepare your verification (NPM SDK)</p>
          </div>
        `;
        container.classList.remove("hidden");
        container.style.display = "flex";

        // Ensure container is ready
        await new Promise((resolve) => setTimeout(resolve, 50));

        logger.sdk("Container found and prepared with loading spinner");

        const verificationTimer = createTimer("NPM SDK Launch with Customer");

        // Update loading message
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center min-h-[400px] space-y-4 m-auto">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-gray-600 text-lg">Initializing verification...</p>
            <p class="text-gray-500 text-sm">Starting verification process with NPM SDK</p>
          </div>
        `;

        // Convert CustomerInfo to SDKCustomerInfo format
        const npmCustomerInfo: SDKCustomerInfo = {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          middleName: customerInfo.middleName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: {
            line1: customerInfo.address.line1,
            line2: customerInfo.address.line2,
            locality: customerInfo.address.locality,
            minorAdminDivision: customerInfo.address.minorAdminDivision,
            majorAdminDivision: customerInfo.address.majorAdminDivision,
            country: customerInfo.address.country,
            postalCode: customerInfo.address.postalCode,
            type: customerInfo.address.type,
          },
        };

        console.log("Calling startVerificationWithCustomer with NPM SDK");

        // Use the NPM SDK method
        cleanupFnRef.current =
          await sdkInstanceRef.current.startVerificationWithCustomer(
            container,
            {
              customerInfo: npmCustomerInfo,
              mode: "embedded",
              onProgress: (event) => {
                logger.sdk(
                  `NPM SDK Progress: ${event.step} (${event.percentage}%)`,
                  event
                );
              },
              onSuccess: (result) => {
                logger.sdk(
                  "🎉 NPM SDK Verification completed successfully!",
                  result
                );

                const completionData = {
                  message: "Verification completed successfully with NPM SDK!",
                  result: (result as Record<string, unknown>) || {},
                  sessionId:
                    (result as { sessionId?: string })?.sessionId || "unknown",
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
                logger.error("NPM SDK Verification failed:", error);
                
                // Clear and hide the verification container
                const container = document.getElementById("verification-container");
                if (container) {
                  container.innerHTML = "";
                  container.style.display = "none";
                  container.classList.add("hidden");
                }
                
                setVerificationState("failed");
                setIsVerifying(false);
              },
              config: {
                qrCode: true,
              },
            }
          );

        verificationTimer.end();

        logger.sdk("NPM SDK verification launched successfully", {
          deploymentStage,
        });
        initTimer.end();

        return cleanupFnRef.current;
      } catch (error) {
        console.error("NPM SDK initialization error:", error);
        
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

      // Destroy SDK instance
      if (sdkInstanceRef.current) {
        sdkInstanceRef.current.destroy();
        sdkInstanceRef.current = null;
      }
    } catch (error) {
      console.error("Error cleaning up NPM SDK:", error);
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
    initializeSDKVerificationWithCustomer,
    stopVerification,
    resetVerification,
  };
}
