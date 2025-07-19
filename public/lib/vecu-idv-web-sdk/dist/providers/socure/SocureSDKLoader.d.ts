import { ISocureDocVSDK } from './types';
export declare class SocureSDKLoader {
    private static instance;
    private loadPromise;
    private sdkInstance;
    private isDestroyed;
    private constructor();
    static getInstance(): SocureSDKLoader;
    load(): Promise<ISocureDocVSDK>;
    private loadSDK;
    isLoaded(): boolean;
    getSDK(): ISocureDocVSDK | null;
    destroy(): void;
}
//# sourceMappingURL=SocureSDKLoader.d.ts.map