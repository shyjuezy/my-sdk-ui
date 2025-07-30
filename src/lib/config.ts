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
    token:
      "eyJraWQiOiJUMThCcUFkbVItNjZWS1gyaW5SVG9QZUdESVJFTi0yekdSZUhqUzN4d0NVIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULm05YmdXYlRIQkZHZEkxSkdQLXphcTNjRTFWRFRON1B6VzVWclRUUDB6WWMiLCJpc3MiOiJodHRwczovL2F1dGhvcml6ZS5jb3hhdXRvaW5jLmNvbS9vYXV0aDIvYXVzMTMydWF4eTJlb21obWkzNTciLCJhdWQiOiJub24tcHJvZHVjdGlvbi1yZXNvdXJjZXMiLCJpYXQiOjE3NTM4OTcwNzYsImV4cCI6MTc1Mzk4MzQ3NiwiY2lkIjoiZDQwMmUxY2EtMmU2Yy00M2UzLWI1MzQtMzVkYWM0OTJjNTU1Iiwic2NwIjpbInZlaGljbGUtc3Zjcy53aG9sZXNhbGUuZXhhbXBsZS5pbnRlcm5hbCJdLCJzdWIiOiJkNDAyZTFjYS0yZTZjLTQzZTMtYjUzNC0zNWRhYzQ5MmM1NTUiLCJjbHMiOiJjbGllbnQifQ.htOWPCDjU_98f8clgUMPtgnHKXNaQGL3Z1u_Mu0z9J18kVSfJZDI_qZ8lhc8rzrB9F3IazzLMRI5vPCRKyiGSKisYqyhGY1naLrwDTs3da4GAlDGMhuVaH6Oe2OMc7j9rn7JzXnrt0anSBJEsHrUxVKyLxeOz00Cvo5plfkQh5hvDbJuS-zLsZFUlXh0rty3f62X8lu5Humtex3Jw_cLIv3yMopWVnCaPzYfPyID_4c7Uln2R-8ZcX5kpUQa6EiBG90KZAs4rVOkJ7Fv4U8qqzyHnwvuYfmwa-O4CQQfX69QDEV42ZndyGcCNoCHnNTVH8duQRHComzjMKhwGjvRZA",
  };
}

export const config = getConfig();

// Helper function to construct API endpoints
export function getApiEndpoint(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.apiBaseUrl}${normalizedPath}`;
}
