import { IAPIConfig, IAPIResponse, IVerificationSession, IVerificationResult } from '@/types';
export declare class APIClient {
    private config;
    private baseHeaders;
    constructor(config: IAPIConfig);
    createVerificationSession(data: Record<string, unknown>): Promise<IAPIResponse<IVerificationSession>>;
    getVerificationSession(sessionId: string): Promise<IAPIResponse<IVerificationSession>>;
    updateVerificationSession(sessionId: string, data: Partial<IVerificationSession>): Promise<IAPIResponse<IVerificationSession>>;
    getVerificationResult(sessionId: string): Promise<IAPIResponse<IVerificationResult>>;
    cancelVerification(sessionId: string): Promise<IAPIResponse<void>>;
    private request;
    private fetchWithRetry;
    updateConfig(config: Partial<IAPIConfig>): void;
}
//# sourceMappingURL=APIClient.d.ts.map