import { IProvider, IProviderLoader } from '@/types';
import { ProviderRegistry } from './ProviderRegistry';
interface IVecuIDVInstance {
    setupProviderEventForwarding(provider: IProvider, sessionId?: string): void;
}
export declare class ProviderLoader implements IProviderLoader {
    private registry;
    private loadingPromises;
    private sdkInstance;
    constructor(registry: ProviderRegistry, sdkInstance: IVecuIDVInstance);
    load(name: string): Promise<IProvider>;
    private loadProvider;
    private importProvider;
    isLoaded(name: string): boolean;
    getLoadedProviders(): string[];
    private capitalize;
}
export {};
//# sourceMappingURL=ProviderLoader.d.ts.map