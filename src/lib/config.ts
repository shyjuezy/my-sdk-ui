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
      "eyJraWQiOiJUMThCcUFkbVItNjZWS1gyaW5SVG9QZUdESVJFTi0yekdSZUhqUzN4d0NVIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULi1pUk9rQ2FhelBKRm45cEExX0Q0QUlrWjl4eGtDaHJhdmFCSVhiZ2Y5NkUiLCJpc3MiOiJodHRwczovL2F1dGhvcml6ZS5jb3hhdXRvaW5jLmNvbS9vYXV0aDIvYXVzMTMydWF4eTJlb21obWkzNTciLCJhdWQiOiJub24tcHJvZHVjdGlvbi1yZXNvdXJjZXMiLCJpYXQiOjE3NTM5MTIyMzUsImV4cCI6MTc1Mzk5ODYzNSwiY2lkIjoiZDQwMmUxY2EtMmU2Yy00M2UzLWI1MzQtMzVkYWM0OTJjNTU1Iiwic2NwIjpbInZlaGljbGUtc3Zjcy53aG9sZXNhbGUuZXhhbXBsZS5pbnRlcm5hbCJdLCJzdWIiOiJkNDAyZTFjYS0yZTZjLTQzZTMtYjUzNC0zNWRhYzQ5MmM1NTUiLCJjbHMiOiJjbGllbnQifQ.zyM4fnFTW8Of0oprVbC9X_gMEDTVDs79lGPooEEVEt4u_66jD-VVabpMR45zHhyYbco2q9Pi-w2G4MA1Xx4prSwHmCquY21hLylf5FbwDJaWLW04d_kVVE7djpouMjXQwSzMR2dRz1tQgOwpaYusKcQ7fKEpaoRMocTYCCAeT8-LqvE1mgUkgKMyH7HK2ucEsAJYy9buQBRxJ7TAXaJddWXQlR4Lok2V6oqFzG84-MleBqKI1JabmjFijWNBjsBQsXa0wRgIXkGAbqkW0FMcI-R-gfQCLVuEEt_9yUmIxyqga2Mh5pMulOoZg8mfnNGRGfNcDymMqSMNKz19U-JlfQ",
  };
}

export const config = getConfig();

// Helper function to construct API endpoints
export function getApiEndpoint(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.apiBaseUrl}${normalizedPath}`;
}
