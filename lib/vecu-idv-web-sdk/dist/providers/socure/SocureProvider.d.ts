import { BaseProvider } from '../base/BaseProvider';
import { IProviderInitOptions, IProviderVerificationUI, IProviderWebhookResult, IProviderEvent } from '@/types';
export declare class SocureProvider extends BaseProvider {
    readonly name = "socure";
    readonly version = "1.0.0";
    supportedFeatures: ("document_verification" | "liveness_check" | "face_match" | "address_verification" | "database_check" | "qr_code_handoff")[];
    private sdkLoader;
    private socureDocVSDK;
    private activeSession;
    constructor();
    loadSDK(): Promise<void>;
    initializeVerification(options: IProviderInitOptions): Promise<IProviderVerificationUI>;
    processWebhookData(data: unknown): IProviderWebhookResult;
    mapEvent(event: unknown): IProviderEvent | null;
    protected cleanupSDK(): void;
    private handleProgressEvent;
    private calculateProgress;
    private getProgressMessage;
    private destroySession;
}
//# sourceMappingURL=SocureProvider.d.ts.map