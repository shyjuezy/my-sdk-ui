// Centralized configuration for environment variables

interface Config {
  apiBaseUrl: string;
  sdkKey: string;
  sdkApiUrl: string;
  isDevelopment: boolean;
  token: string;
}

function getConfig(): Config {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY;
  const sdkApiUrl = process.env.NEXT_PUBLIC_SDK_API_URL;

  if (!apiBaseUrl) {
    console.warn(
      "NEXT_PUBLIC_API_BASE_URL is not defined. Using default value. Please check your .env.local file."
    );
  }

  if (!sdkKey) {
    console.warn(
      "NEXT_PUBLIC_SDK_KEY is not defined. Using default value. Please check your .env.local file."
    );
  }

  if (!sdkApiUrl) {
    console.warn(
      "NEXT_PUBLIC_SDK_API_URL is not defined. Using default value. Please check your .env.local file."
    );
  }

  return {
    apiBaseUrl:
      apiBaseUrl ||
      "https://int.dev.api.coxautoinc.com/vehicle-services/wholesale/vecu-idp-1.1",
    // "https://c0j9hytfof.execute-api.us-east-1.amazonaws.com/shyju2",
    sdkKey: sdkKey || "sdk_dev_cd_05369765047649393851643615662941",
    sdkApiUrl:
      sdkApiUrl ||
      "https://c0j9hytfof.execute-api.us-east-1.amazonaws.com/shyju2",
    isDevelopment: process.env.NODE_ENV === "development",
    token: process.env.NEXT_PUBLIC_TOKEN || "",
  };
}

export const config = getConfig();

// Helper function to construct API endpoints
export function getApiEndpoint(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.apiBaseUrl}${normalizedPath}`;
}
