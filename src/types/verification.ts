// Centralized type definitions for verification
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    locality: string;
    minorAdminDivision?: string;
    majorAdminDivision: string;
    country: string;
    postalCode: string;
    type: string;
  };
}

export interface ValidationErrors {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | undefined;
}

// SDK Types
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

export interface VecuEventData {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export interface Provider {
  initializeVerification: (options: {
    sessionId: string;
    token: string;
    container: HTMLElement;
    mode: 'embedded' | 'popup';
    config: {
      publicKey: string;
      qrCode?: boolean;
    };
  }) => Promise<unknown>;
  destroy: () => void;
}

export interface VecuIDV {
  initialized: boolean;
  activeSessions: Map<string, VerificationSession>;
  providerLoader: {
    load: (provider: string) => Promise<Provider>;
  };
  providerRegistry?: Map<string, Provider>;
  destroy: () => void;
  on: (event: string, handler: (event: VerificationEvent) => void) => void;
}

// Extended interface for testing workarounds
export interface VecuIDVTestInstance extends VecuIDV {
  initialized: boolean;
  activeSessions: Map<string, VerificationSession>;
  providerLoader: {
    load: (provider: string) => Promise<Provider>;
  };
}

export interface VecuIDVConstructor {
  new (config: {
    apiKey: string;
    apiUrl: string;
    environment: string;
    providers: {
      socure: {
        publicKey: string;
        environment: string;
        qrCode: boolean;
      };
    };
  }): VecuIDV;
}
