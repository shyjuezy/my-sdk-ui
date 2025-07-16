// Centralized configuration for environment variables

interface Config {
  apiBaseUrl: string;
  sdkKey: string;
  isDevelopment: boolean;
}

function getConfig(): Config {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY;
  
  if (!apiBaseUrl) {
    console.warn(
      'NEXT_PUBLIC_API_BASE_URL is not defined. Using default value. Please check your .env.local file.'
    );
  }
  
  if (!sdkKey) {
    console.warn(
      'NEXT_PUBLIC_SDK_KEY is not defined. Using default value. Please check your .env.local file.'
    );
  }
  
  return {
    apiBaseUrl: apiBaseUrl || 'https://mpbahqqt37.execute-api.us-east-1.amazonaws.com/latest',
    sdkKey: sdkKey || 'd33968c0-6f5b-4baf-b74c-2486ead0d3ee',
    isDevelopment: process.env.NODE_ENV === 'development',
  };
}

export const config = getConfig();

// Helper function to construct API endpoints
export function getApiEndpoint(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.apiBaseUrl}${normalizedPath}`;
}