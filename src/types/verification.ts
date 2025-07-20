// Application-specific type definitions for verification UI
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
