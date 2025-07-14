import { ILogger, LogLevel } from '@/types';
export declare class Logger implements ILogger {
    private level;
    private enabled;
    private prefix;
    private readonly logLevels;
    constructor(level?: LogLevel, enabled?: boolean, prefix?: string);
    error(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    private log;
    private shouldLog;
    setLevel(level: LogLevel): void;
    setEnabled(enabled: boolean): void;
    createChildLogger(prefix: string): Logger;
}
export declare function getLogger(): Logger;
export declare function setGlobalLogLevel(level: LogLevel): void;
export declare function setGlobalLogEnabled(enabled: boolean): void;
//# sourceMappingURL=logger.d.ts.map