// Simple type definitions for the SDK
export interface VecuIDVConfig {
  sdkKey: string;
  apiUrl: string;
  environment: string;
}

export interface VerificationEvent {
  type: string;
  data: {
    message?: string;
    result?: Record<string, unknown>;
    sessionId?: string;
    error?: string;
  };
}

export interface VerificationSession {
  id: string;
  provider: string;
  providerSessionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationOptions {
  container?: string | HTMLElement;
  mode?: 'embedded' | 'modal';
  user?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: {
      line1: string;
      locality: string;
      majorAdminDivision: string;
      country: string;
      postalCode: string;
    };
  };
  preferredProvider?: string;
  providerConfig?: Record<string, unknown>;
  onReady?: () => void;
  onProgress?: (progress: { step: string; percentage: number; message?: string }) => void;
  onComplete?: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export interface VecuIDVConstructor {
  new (config: VecuIDVConfig): VecuIDVInstance;
}

export interface VerificationResult {
  status: 'completed' | 'failed' | 'cancelled';
  sessionId: string;
  data?: Record<string, unknown>;
}

export interface VecuIDVInstance {
  on(event: string, handler: (event: VerificationEvent) => void): void;
  init(): Promise<void>;
  startVerification(options: {
    provider: string;
    token: string;
    container: HTMLElement;
    mode?: 'modal' | 'embedded';
    config?: Record<string, unknown>;
    onComplete?: (result: VerificationResult) => void;
    onError?: (error: Error) => void;
    onProgress?: (progress: { step: string; percentage: number; message?: string }) => void;
  }): Promise<() => void>;
  destroy(): void;
  providerLoader: {
    load(providerName: string): Promise<unknown>;
  };
}

export type VecuIDV = VecuIDVConstructor;