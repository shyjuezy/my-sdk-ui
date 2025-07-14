import { IProvider, IProviderLoader } from '@/types';
import { ProviderRegistry } from './ProviderRegistry';
export declare class ProviderLoader implements IProviderLoader {
    private registry;
    private loadingPromises;
    constructor(registry: ProviderRegistry);
    load(name: string): Promise<IProvider>;
    private loadProvider;
    private importProvider;
    isLoaded(name: string): boolean;
    getLoadedProviders(): string[];
    private capitalize;
}
//# sourceMappingURL=ProviderLoader.d.ts.map