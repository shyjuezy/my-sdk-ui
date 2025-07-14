import { BaseProvider } from './BaseProvider';
import { IProviderConfig } from '@/types';
export interface IProviderConstructor {
    new (config?: IProviderConfig): BaseProvider;
}
export interface IProviderMetadata {
    name: string;
    displayName: string;
    description: string;
    website: string;
    supportEmail?: string;
    documentationUrl?: string;
    logoUrl?: string;
    capabilities: IProviderCapabilities;
}
export interface IProviderCapabilities {
    documents: {
        passport: boolean;
        driverLicense: boolean;
        nationalId: boolean;
        residencePermit: boolean;
    };
    biometrics: {
        facialRecognition: boolean;
        livenessDetection: boolean;
        fingerprint: boolean;
    };
    verification: {
        addressVerification: boolean;
        phoneVerification: boolean;
        emailVerification: boolean;
        databaseChecks: boolean;
    };
    features: {
        qrCodeHandoff: boolean;
        videoVerification: boolean;
        nfcReading: boolean;
        multiLanguage: boolean;
        accessibility: boolean;
    };
}
export interface IProviderSDKConfig {
    scriptUrl: string;
    stylesheetUrl?: string;
    globalVariableName?: string;
    initTimeout?: number;
    loadTimeout?: number;
}
export interface IProviderEventMap {
    'provider:loaded': {
        provider: string;
    };
    'provider:ready': {
        provider: string;
        sessionId: string;
    };
    'provider:error': {
        provider: string;
        error: Error;
    };
    'provider:event': {
        provider: string;
        event: unknown;
    };
    'ui:created': {
        provider: string;
        container: HTMLElement;
    };
    'ui:destroyed': {
        provider: string;
    };
}
export interface IProviderSession {
    id: string;
    provider: string;
    token: string;
    status: string;
    createdAt: Date;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface IProviderSDKInstance {
    init(config: any): Promise<void>;
    createSession(options: any): Promise<any>;
    destroySession(sessionId: string): Promise<void>;
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
    destroy(): void;
}
//# sourceMappingURL=ProviderInterface.d.ts.map