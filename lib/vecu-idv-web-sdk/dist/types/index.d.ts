export * from './config';
export * from './verification';
export * from './events';
export * from './providers';
export interface IVecuError extends Error {
    code: string;
    details?: unknown;
    provider?: string;
}
export interface IAPIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}
export interface ILogger {
    error(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
}
//# sourceMappingURL=index.d.ts.map