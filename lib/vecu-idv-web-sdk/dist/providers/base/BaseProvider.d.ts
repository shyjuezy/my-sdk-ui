import { IProvider, IProviderInitOptions, IProviderVerificationUI, IProviderWebhookResult, IProviderEvent, IEventEmitter } from '@/types';
import { Logger } from '@/utils/logger';
export declare abstract class BaseProvider implements IProvider {
    abstract readonly name: string;
    abstract readonly version: string;
    abstract supportedFeatures: string[];
    protected eventEmitter: IEventEmitter;
    protected logger: Logger;
    protected _isLoaded: boolean;
    protected sdkInstance: any;
    protected activeUI: IProviderVerificationUI | null;
    constructor();
    get isLoaded(): boolean;
    abstract loadSDK(): Promise<void>;
    abstract initializeVerification(options: IProviderInitOptions): Promise<IProviderVerificationUI>;
    abstract processWebhookData(data: unknown): IProviderWebhookResult;
    mapEvent(event: unknown): IProviderEvent | null;
    destroy(): void;
    protected abstract cleanupSDK(): void;
    protected loadScript(url: string, globalName?: string): Promise<void>;
    protected createUIContainer(parentContainer: HTMLElement, mode: 'modal' | 'embedded'): HTMLElement;
    protected removeUIContainer(container: HTMLElement): void;
    protected emitProviderEvent(type: string, data?: unknown): void;
    protected handleProviderError(error: unknown, context: string): never;
    on(event: string, handler: (event: IProviderEvent) => void): void;
    off(event: string, handler: (event: IProviderEvent) => void): void;
    protected validateInitOptions(options: IProviderInitOptions): void;
}
//# sourceMappingURL=BaseProvider.d.ts.map