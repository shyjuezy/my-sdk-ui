import { IVecuIDVConfig } from '@/types';
export declare const SDK_VERSION = "1.0.0";
export declare const SDK_NAME = "@vecu-idv-web-sdk";
export declare const DEFAULT_CONFIG: Partial<IVecuIDVConfig>;
export declare const API_ENDPOINTS: {
    readonly HEALTH: "/health";
    readonly SESSIONS: "/verification/sessions";
    readonly SESSION_BY_ID: (id: string) => string;
    readonly SESSION_RESULT: (id: string) => string;
    readonly SESSION_CANCEL: (id: string) => string;
    readonly PROVIDERS: "/providers";
    readonly PROVIDER_BY_NAME: (name: string) => string;
};
export declare const EVENTS: {
    readonly SDK_INIT: "sdk:init";
    readonly SDK_READY: "sdk:ready";
    readonly SDK_ERROR: "sdk:error";
    readonly SDK_DESTROY: "sdk:destroy";
    readonly PROVIDER_LOADED: "provider:loaded";
    readonly PROVIDER_READY: "provider:ready";
    readonly PROVIDER_ERROR: "provider:error";
    readonly PROVIDER_EVENT: "provider:event";
    readonly VERIFICATION_CREATED: "verification:created";
    readonly VERIFICATION_STARTED: "verification:started";
    readonly VERIFICATION_PROGRESS: "verification:progress";
    readonly VERIFICATION_COMPLETED: "verification:completed";
    readonly VERIFICATION_FAILED: "verification:failed";
    readonly VERIFICATION_CANCELLED: "verification:cancelled";
    readonly VERIFICATION_EXPIRED: "verification:expired";
    readonly UI_CREATED: "ui:created";
    readonly UI_READY: "ui:ready";
    readonly UI_ERROR: "ui:error";
    readonly UI_CLOSED: "ui:closed";
    readonly UI_DESTROYED: "ui:destroyed";
};
export declare const CSS_CLASSES: {
    readonly CONTAINER: "vecu-idv-container";
    readonly MODAL: "vecu-idv-modal";
    readonly EMBEDDED: "vecu-idv-embedded";
    readonly LOADING: "vecu-idv-loading";
    readonly ERROR: "vecu-idv-error";
    readonly HIDDEN: "vecu-idv-hidden";
};
export declare const TIMEOUTS: {
    readonly SCRIPT_LOAD: 30000;
    readonly SDK_INIT: 15000;
    readonly SESSION_CREATE: 10000;
    readonly UI_INIT: 20000;
    readonly PROVIDER_LOAD: 30000;
};
export declare const RETRY_CONFIG: {
    readonly MAX_RETRIES: 3;
    readonly INITIAL_DELAY: 1000;
    readonly MAX_DELAY: 10000;
    readonly BACKOFF_FACTOR: 2;
};
//# sourceMappingURL=index.d.ts.map