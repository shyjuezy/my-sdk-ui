import { IVecuError } from '@/types';
export declare class VecuError extends Error implements IVecuError {
    code: string;
    details?: unknown;
    provider?: string;
    constructor(code: string, message: string, provider?: string, details?: unknown);
    toJSON(): Record<string, unknown>;
}
export declare class ConfigurationError extends VecuError {
    constructor(message: string, details?: unknown);
}
export declare class ValidationError extends VecuError {
    constructor(message: string, details?: unknown);
}
export declare class NetworkError extends VecuError {
    constructor(message: string, details?: unknown);
}
export declare class ProviderError extends VecuError {
    constructor(provider: string, message: string, details?: unknown);
}
export declare class SessionError extends VecuError {
    constructor(message: string, sessionId?: string);
}
export declare class TimeoutError extends VecuError {
    constructor(message: string, timeout: number);
}
export declare const ErrorCodes: {
    readonly INVALID_API_KEY: "INVALID_API_KEY";
    readonly MISSING_CONFIG: "MISSING_CONFIG";
    readonly INVALID_CONFIG: "INVALID_CONFIG";
    readonly SDK_NOT_INITIALIZED: "SDK_NOT_INITIALIZED";
    readonly SDK_INIT_FAILED: "SDK_INIT_FAILED";
    readonly SDK_ALREADY_INITIALIZED: "SDK_ALREADY_INITIALIZED";
    readonly PROVIDER_NOT_FOUND: "PROVIDER_NOT_FOUND";
    readonly PROVIDER_LOAD_FAILED: "PROVIDER_LOAD_FAILED";
    readonly PROVIDER_SDK_LOAD_FAILED: "PROVIDER_SDK_LOAD_FAILED";
    readonly PROVIDER_INIT_FAILED: "PROVIDER_INIT_FAILED";
    readonly PROVIDER_NOT_SUPPORTED: "PROVIDER_NOT_SUPPORTED";
    readonly SESSION_NOT_FOUND: "SESSION_NOT_FOUND";
    readonly SESSION_EXPIRED: "SESSION_EXPIRED";
    readonly SESSION_CREATE_FAILED: "SESSION_CREATE_FAILED";
    readonly SESSION_ALREADY_EXISTS: "SESSION_ALREADY_EXISTS";
    readonly VERIFICATION_FAILED: "VERIFICATION_FAILED";
    readonly VERIFICATION_CANCELLED: "VERIFICATION_CANCELLED";
    readonly VERIFICATION_TIMEOUT: "VERIFICATION_TIMEOUT";
    readonly INVALID_CONTAINER: "INVALID_CONTAINER";
    readonly UI_INIT_FAILED: "UI_INIT_FAILED";
    readonly UI_DESTROYED: "UI_DESTROYED";
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly TIMEOUT_ERROR: "TIMEOUT_ERROR";
    readonly API_ERROR: "API_ERROR";
    readonly INVALID_OPTIONS: "INVALID_OPTIONS";
    readonly INVALID_USER_DATA: "INVALID_USER_DATA";
    readonly MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD";
};
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
export declare function isVecuError(error: unknown): error is VecuError;
export declare function createErrorFromResponse(response: {
    code?: string;
    message?: string;
    details?: unknown;
}): VecuError;
export declare function normalizeError(error: unknown): VecuError;
//# sourceMappingURL=errors.d.ts.map