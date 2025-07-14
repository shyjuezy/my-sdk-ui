import { IVecuIDVConfig, IVerificationOptions, IUserData } from '@/types';
export declare function validateConfig(config: IVecuIDVConfig): void;
export declare function validateVerificationOptions(options: IVerificationOptions): void;
export declare function validateUserData(userData: IUserData): void;
export declare function isValidEmail(email: string): boolean;
export declare function isValidPhone(phone: string): boolean;
export declare function isValidDate(date: string): boolean;
export declare function isValidUrl(url: string): boolean;
export declare function isValidPostalCode(postalCode: string): boolean;
export declare function isValidSessionId(sessionId: string): boolean;
export declare function sanitizeString(input: string): string;
export declare function sanitizeUserData(userData: IUserData): IUserData;
//# sourceMappingURL=validators.d.ts.map