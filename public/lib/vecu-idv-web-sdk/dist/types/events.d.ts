export interface IVecuEvent {
    type: EventType;
    timestamp: Date;
    data?: unknown;
    provider?: string;
    sessionId?: string;
}
export type EventType = 'sdk:init' | 'sdk:ready' | 'sdk:error' | 'sdk:destroy' | 'provider:loaded' | 'provider:error' | 'verification:created' | 'verification:started' | 'verification:progress' | 'verification:completed' | 'verification:failed' | 'verification:cancelled' | 'verification:expired' | 'ui:ready' | 'ui:error' | 'ui:closed';
export interface IEventHandler {
    (event: IVecuEvent): void;
}
export interface IEventEmitter {
    on(event: string, handler: IEventHandler): void;
    off(event: string, handler: IEventHandler): void;
    emit(event: string, data?: unknown): void;
    once(event: string, handler: IEventHandler): void;
    removeAllListeners(event?: string): void;
}
export interface IUniversalProviderEvent {
    type: string;
    data: unknown;
    originalEvent?: unknown;
}
export interface IProgressEvent extends IVecuEvent {
    type: 'verification:progress';
    data: {
        step: string;
        percentage: number;
        message?: string;
    };
}
export interface IErrorEvent extends IVecuEvent {
    type: 'sdk:error' | 'provider:error' | 'ui:error';
    data: {
        code: string;
        message: string;
        details?: unknown;
        provider?: string;
    };
}
//# sourceMappingURL=events.d.ts.map