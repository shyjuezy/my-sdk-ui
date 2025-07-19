import { IVecuIDVConfig, IVerificationOptions, IVerificationSession, IVerificationResult, IProvider, IEventHandler, VerificationStatus } from '@/types';
import { EventEmitter } from './EventEmitter';
export declare class VecuIDV {
    private config;
    private eventEmitter;
    private apiClient;
    private providerRegistry;
    private providerLoader;
    private logger;
    private initialized;
    private activeSessions;
    constructor(config: IVecuIDVConfig);
    init(): Promise<void>;
    createVerification(options: IVerificationOptions): Promise<IVerificationSession>;
    getVerificationStatus(sessionId: string): Promise<VerificationStatus>;
    getVerificationResult(sessionId: string): Promise<IVerificationResult>;
    cancelVerification(sessionId: string): Promise<void>;
    on(event: string, handler: IEventHandler): void;
    off(event: string, handler: IEventHandler): void;
    once(event: string, handler: IEventHandler): void;
    get eventEmitterInstance(): EventEmitter;
    getAvailableProviders(): IProvider[];
    getProvider(name: string): IProvider | null;
    destroy(): void;
    private resolveContainer;
    private setupVerificationEventHandlers;
    setupProviderEventForwarding(provider: IProvider, _sessionId?: string): void;
}
//# sourceMappingURL=VecuIDV.d.ts.map