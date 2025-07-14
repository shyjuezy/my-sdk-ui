export interface IProvider {
    name: string;
    version: string;
    supportedFeatures: string[];
    isLoaded: boolean;
    loadSDK(): Promise<void>;
    initializeVerification(options: IProviderInitOptions): Promise<IProviderVerificationUI>;
    processWebhookData(data: unknown): IProviderWebhookResult;
    mapEvent(event: unknown): IProviderEvent | null;
    destroy(): void;
}
export interface IProviderInitOptions {
    sessionId: string;
    token: string;
    container: HTMLElement;
    mode: 'modal' | 'embedded';
    theme?: string;
    language?: string;
    userData?: Record<string, unknown>;
    config?: Record<string, any>;
}
export interface IProviderVerificationUI {
    container: HTMLElement;
    sessionId: string;
    provider: string;
    destroy(): void;
}
export interface IProviderWebhookResult {
    status: string;
    decision?: string;
    data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface IProviderEvent {
    type: string;
    data?: unknown;
    timestamp: Date;
}
export interface IProviderRegistry {
    register(provider: IProvider): void;
    unregister(name: string): void;
    get(name: string): IProvider | undefined;
    getAll(): IProvider[];
    has(name: string): boolean;
}
export interface IProviderLoader {
    load(name: string): Promise<IProvider>;
    isLoaded(name: string): boolean;
    getLoadedProviders(): string[];
}
export interface IProviderConfig {
    name: string;
    scriptUrl?: string;
    apiUrl?: string;
    publicKey?: string;
    options?: Record<string, unknown>;
}
export type ProviderName = 'socure' | 'incode' | 'jumio' | 'onfido' | 'veriff';
export declare const SUPPORTED_PROVIDERS: ProviderName[];
export declare const PROVIDER_FEATURES: {
    readonly DOCUMENT_VERIFICATION: "document_verification";
    readonly LIVENESS_CHECK: "liveness_check";
    readonly FACE_MATCH: "face_match";
    readonly ADDRESS_VERIFICATION: "address_verification";
    readonly DATABASE_CHECK: "database_check";
    readonly PHONE_VERIFICATION: "phone_verification";
    readonly EMAIL_VERIFICATION: "email_verification";
    readonly QR_CODE_HANDOFF: "qr_code_handoff";
    readonly VIDEO_VERIFICATION: "video_verification";
};
export type ProviderFeature = typeof PROVIDER_FEATURES[keyof typeof PROVIDER_FEATURES];
//# sourceMappingURL=providers.d.ts.map