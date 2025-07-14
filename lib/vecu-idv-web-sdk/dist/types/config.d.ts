export interface IVecuIDVConfig {
    apiKey: string;
    apiUrl?: string;
    environment?: 'development' | 'staging' | 'production';
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    autoRetry?: boolean;
    maxRetries?: number;
    timeout?: number;
    debug?: boolean;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
}
export interface IAPIConfig {
    baseUrl: string;
    apiKey: string;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
}
export type Environment = 'development' | 'staging' | 'production';
export type Theme = 'light' | 'dark' | 'auto';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
//# sourceMappingURL=config.d.ts.map