// Customer information types matching the SDK interface

export interface CustomerAddress {
  line1: string;
  line2?: string;
  locality: string;
  minorAdminDivision?: string;
  majorAdminDivision: string;
  country: string;
  postalCode: string;
  type: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address: CustomerAddress;
}