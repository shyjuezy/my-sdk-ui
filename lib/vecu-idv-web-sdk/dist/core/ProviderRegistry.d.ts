import { IProvider, IProviderRegistry } from '@/types';
export declare class ProviderRegistry implements IProviderRegistry {
    private providers;
    constructor();
    register(provider: IProvider): void;
    unregister(name: string): void;
    get(name: string): IProvider | undefined;
    getAll(): IProvider[];
    has(name: string): boolean;
    clear(): void;
    getByFeature(feature: string): IProvider[];
    getLoadedProviders(): IProvider[];
}
//# sourceMappingURL=ProviderRegistry.d.ts.map