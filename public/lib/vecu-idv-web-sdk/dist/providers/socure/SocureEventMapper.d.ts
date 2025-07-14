import { IProviderEvent } from '@/types';
import { ISocureEvent } from './types';
export declare class SocureEventMapper {
    private static eventMap;
    static mapEvent(socureEvent: ISocureEvent | any): IProviderEvent | null;
    private static mapEventData;
    private static mapCompleteData;
    private static mapErrorData;
    private static mapDocumentCaptureData;
    private static mapLivenessData;
    private static mapQRCodeData;
    private static mapRiskLevel;
    static mapWebhookData(webhookData: any): any;
    private static mapDecision;
    private static mapConfidence;
}
//# sourceMappingURL=SocureEventMapper.d.ts.map