declare module 'vecu-idv-web-sdk' {
  export interface VecuIDVConfig {
    apiKey: string;
    apiUrl: string;
    environment?: 'development' | 'production';
    providers: {
      socure?: {
        publicKey: string;
        environment: 'sandbox' | 'production';
        qrCode?: boolean;
      };
    };
  }

  export interface VerificationSession {
    id: string;
    provider: string;
    providerSessionId: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
  }

  export interface VerificationEvent {
    type: string;
    data: {
      [key: string]: unknown;
      error?: string;
      message?: string;
    };
  }

  export interface VerificationResult {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
  }

  export interface Provider {
    initializeVerification(options: {
      sessionId: string;
      token: string;
      container: HTMLElement;
      mode: 'embedded' | 'popup';
      config: {
        publicKey: string;
        qrCode?: boolean;
      };
    }): Promise<unknown>;
    destroy(): void;
  }

  export class VecuIDV {
    initialized: boolean;
    activeSessions: Map<string, VerificationSession>;
    providerLoader: {
      load(provider: string): Promise<Provider>;
    };
    providerRegistry: Map<string, Provider>;

    constructor(config: VecuIDVConfig);
    
    init(): Promise<void>;
    destroy(): void;
    
    on(event: string, handler: (event: VerificationEvent) => void): void;
    off(event: string, handler: (event: VerificationEvent) => void): void;
    
    createVerification(options: {
      user?: Record<string, unknown>;
      container?: string;
      preferredProvider?: string;
    }): Promise<VerificationSession>;
    
    cancelVerification(sessionId: string): Promise<void>;
  }
}