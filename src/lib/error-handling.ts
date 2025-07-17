// Error handling utilities for better error management

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
}

export class VerificationError extends Error {
  public readonly statusCode?: number;
  public readonly code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'VerificationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class SDKError extends Error {
  public readonly sdkProvider?: string;
  
  constructor(message: string, sdkProvider?: string) {
    super(message);
    this.name = 'SDKError';
    this.sdkProvider = sdkProvider;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof VerificationError) {
    return `Verification failed: ${error.message}`;
  }
  
  if (error instanceof SDKError) {
    return `SDK Error${error.sdkProvider ? ` (${error.sdkProvider})` : ''}: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

export function getHttpErrorMessage(statusCode?: number, errorMessage?: string): string {
  const baseMessage = errorMessage || 'Unknown error';
  
  switch (statusCode) {
    case 400:
      return `Bad Request: ${baseMessage}`;
    case 401:
      return `Authentication failed: ${baseMessage}`;
    case 403:
      return `Access denied: ${baseMessage}`;
    case 404:
      return `Service not found: ${baseMessage}`;
    case 429:
      return `Too many requests: ${baseMessage}`;
    case 500:
      return `Server error: ${baseMessage}`;
    case 503:
      return `Service unavailable: ${baseMessage}`;
    default:
      return baseMessage;
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}

export function handleAsyncError<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<[T | null, Error | null]> {
  return promise
    .then<[T, null]>((data: T) => [data, null])
    .catch<[null, Error]>((error: Error) => {
      if (errorMessage) {
        error.message = `${errorMessage}: ${error.message}`;
      }
      return [null, error];
    });
}
