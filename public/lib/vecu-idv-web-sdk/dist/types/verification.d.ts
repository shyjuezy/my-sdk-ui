export interface IVerificationOptions {
    user: IUserData;
    container?: string | HTMLElement;
    mode?: 'modal' | 'embedded';
    preferredProvider?: string;
    excludeProviders?: string[];
    requiredFeatures?: string[];
    providerConfig?: Record<string, any>;
    onReady?: () => void;
    onProgress?: (progress: IProgress) => void;
    onComplete?: (result: IVerificationResult) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
    metadata?: Record<string, unknown>;
}
export interface IUserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: IAddress;
    documentNumber?: string;
    [key: string]: unknown;
}
export interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
export interface IVerificationSession {
    id: string;
    provider: string;
    status: VerificationStatus;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    providerSessionId?: string;
    metadata?: Record<string, unknown>;
}
export interface IVerificationResult {
    sessionId: string;
    provider: string;
    status: VerificationStatus;
    decision?: VerificationDecision;
    documentData?: IDocumentData;
    livenessData?: ILivenessData;
    fraudSignals?: IFraudSignals;
    metadata?: Record<string, unknown>;
    completedAt: Date;
}
export interface IDocumentData {
    type: string;
    number: string;
    issuingCountry: string;
    expirationDate?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    address?: IAddress;
    [key: string]: unknown;
}
export interface ILivenessData {
    passed: boolean;
    score?: number;
    confidence?: number;
    [key: string]: unknown;
}
export interface IFraudSignals {
    overallRisk: 'low' | 'medium' | 'high';
    signals: IFraudSignal[];
}
export interface IFraudSignal {
    type: string;
    risk: 'low' | 'medium' | 'high';
    description: string;
}
export interface IProgress {
    step: string;
    percentage: number;
    message?: string;
}
export interface IVerificationUI {
    container: HTMLElement;
    provider: string;
    destroy: () => void;
}
export type VerificationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired' | 'cancelled';
export type VerificationDecision = 'approved' | 'declined' | 'review' | 'retry';
export interface IVerificationUIOptions {
    container: string | HTMLElement;
    mode: 'modal' | 'embedded';
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    sessionData: IVerificationSession;
    userData?: IUserData;
}
//# sourceMappingURL=verification.d.ts.map