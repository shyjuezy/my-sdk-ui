"use server";

import { getPhoneNumberForAPI } from "@/lib/validation";
import { getApiEndpoint, config } from "@/lib/config";

export interface VerificationRequest {
  customerInfo: {
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
  };
}

export interface VerificationResponse {
  success: boolean;
  data?: {
    sessionId?: string;
    status?: string;
    providerDocumentId?: string;
    [key: string]: unknown;
  };
  error?: string;
  statusCode?: number;
}

export async function startVerification(
  request: VerificationRequest
): Promise<VerificationResponse> {
  if (config.isDevelopment) {
    console.log("=== Server Action: Start Verification ===");
    console.log("Incoming request:", JSON.stringify(request, null, 2));
  }

  try {
    const { customerInfo } = request;

    // Prepare the request body
    const requestBody = {
      referenceId: `customer_${Date.now()}`,
      config: {
        webhookUrl: "https://vecu-idv.emulator_idvp.com",
      },
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        ...(customerInfo.middleName && { middleName: customerInfo.middleName }),
        ...(customerInfo.email && { email: customerInfo.email }),
        ...(customerInfo.phone && {
          phone: getPhoneNumberForAPI(customerInfo.phone),
        }),
        address: {
          line_1: customerInfo.address.line1,
          ...(customerInfo.address.line2 && {
            line_2: customerInfo.address.line2,
          }),
          locality: customerInfo.address.locality,
          ...(customerInfo.address.minorAdminDivision && {
            minor_admin_division: customerInfo.address.minorAdminDivision,
          }),
          major_admin_division: customerInfo.address.majorAdminDivision,
          country: customerInfo.address.country,
          postal_code: customerInfo.address.postalCode,
          type: customerInfo.address.type,
        },
      },
    };

    console.log("requestBody", requestBody);
    console.log("getApiEndpoint#####", getApiEndpoint("identity/verify/start"));

    const apiUrl = getApiEndpoint("identity/verify/start");

    if (config.isDevelopment) {
      console.log("API Request URL:", apiUrl);
      console.log("API Request Body:", JSON.stringify(requestBody, null, 2));
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (config.isDevelopment) {
      console.log("API Response Status:", response.status, response.statusText);
      console.log(
        "API Response Headers:",
        Object.fromEntries(response.headers.entries())
      );
    }

    if (response.ok) {
      const data = await response.json();
      if (config.isDevelopment) {
        console.log("API Response Data:", JSON.stringify(data, null, 2));
        console.log("=== Server Action: Success ===");
      }
      return {
        success: true,
        data,
        statusCode: response.status,
      };
    } else {
      let errorMessage = "Failed to start verification";
      let errorData = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        if (config.isDevelopment) {
          console.log(
            "API Error Response Data:",
            JSON.stringify(errorData, null, 2)
          );
        }
      } catch {
        errorMessage = `${response.status} ${response.statusText}`;
        if (config.isDevelopment) {
          console.log("API Error: Non-JSON response");
        }
      }

      if (config.isDevelopment) {
        console.log("=== Server Action: API Error ===");
      }
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
      };
    }
  } catch (error) {
    if (config.isDevelopment) {
      console.error("=== Server Action: Exception ===");
      console.error(
        "Error type:",
        error instanceof Error ? error.constructor.name : typeof error
      );
      console.error(
        "Error message:",
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      console.error("==============================");
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network error: Unable to connect to the verification service",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
