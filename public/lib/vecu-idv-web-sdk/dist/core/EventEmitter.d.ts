import { IEventEmitter, IEventHandler } from '@/types';
export declare class EventEmitter implements IEventEmitter {
    private events;
    constructor();
    on(event: string, handler: IEventHandler): void;
    off(event: string, handler: IEventHandler): void;
    emit(event: string, data?: unknown): void;
    once(event: string, handler: IEventHandler): void;
    removeAllListeners(event?: string): void;
    listenerCount(event: string): number;
    eventNames(): string[];
}
//# sourceMappingURL=EventEmitter.d.ts.map