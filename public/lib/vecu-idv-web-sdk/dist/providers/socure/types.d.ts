export interface ISocureDocVConfig {
    onProgress?: (event: ISocureCallbackResponse) => void;
    onSuccess?: (response: ISocureCallbackResponse) => void;
    onError?: (error: ISocureCallbackResponse) => void;
    qrCodeNeeded?: boolean;
}
export interface ISocureDocVSDK {
    launch(sdkKey: string, docvTransactionToken: string, containerSelector: string | HTMLElement, config?: ISocureDocVConfig): ISocureSession | void;
}
export interface ISocureCallbackResponse {
    docvTransactionToken: string;
    status: 'WAITING_FOR_USER_TO_REDIRECT' | 'WAITING_FOR_UPLOAD' | 'DOCUMENTS_UPLOADED' | 'CONSENT_DECLINED' | 'DOCUMENTS_UPLOAD_FAILED';
    key: string;
    customerUserId?: string;
    mobileNumber?: string;
    deviceSessionToken?: string;
}
export interface ISocureProgressEvent {
    event: string;
    data?: any;
}
export interface ISocureSession {
    id: string;
    status: string;
    destroy(): void;
}
export interface ISocureResult {
    referenceId: string;
    status: 'complete' | 'incomplete' | 'error';
    documentData?: ISocureDocumentData;
    livenessData?: ISocureLivenessData;
    fraud?: ISocureFraudData;
}
export interface ISocureDocumentData {
    type: string;
    documentNumber: string;
    issuingCountry: string;
    expirationDate?: string;
    issuedDate?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    dateOfBirth?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
}
export interface ISocureLivenessData {
    passed: boolean;
    score: number;
    confidence: 'high' | 'medium' | 'low';
    reason?: string;
}
export interface ISocureFraudData {
    score: number;
    signals: Array<{
        name: string;
        risk: 'high' | 'medium' | 'low';
        description: string;
    }>;
}
export interface ISocureError {
    code: string;
    message: string;
    details?: any;
}
export interface ISocureEvent {
    type: SocureEventType;
    data?: any;
    timestamp: number;
}
export type SocureEventType = 'init' | 'ready' | 'start' | 'document_front_capture' | 'document_back_capture' | 'document_processing' | 'liveness_start' | 'liveness_processing' | 'liveness_complete' | 'complete' | 'error' | 'close' | 'qr_code_displayed' | 'mobile_handoff';
export interface ISocureWebhookData {
    referenceId: string;
    customerUserId?: string;
    docvTransactionId: string;
    status: 'complete' | 'incomplete' | 'error';
    documentVerification?: {
        decision: 'accept' | 'reject' | 'review';
        documentType: string;
        documentFields: Record<string, any>;
    };
    selfieVerification?: {
        decision: 'accept' | 'reject' | 'review';
        livenessScore: number;
    };
    fraud?: {
        score: number;
        signals: string[];
    };
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=types.d.ts.map