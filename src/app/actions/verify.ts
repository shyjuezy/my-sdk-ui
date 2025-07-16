'use server';

import { getPhoneNumberForAPI } from '@/lib/validation';

export interface VerificationRequest {
  customerInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    phone?: string;
    address: {
      line_1: string;
      line_2?: string;
      locality: string;
      minor_admin_division?: string;
      major_admin_division: string;
      country: string;
      postal_code: string;
      type: string;
    };
  };
}

export interface VerificationResponse {
  success: boolean;
  data?: {
    sessionId?: string;
    status?: string;
    [key: string]: unknown;
  };
  error?: string;
  statusCode?: number;
}

export async function startVerification(
  request: VerificationRequest
): Promise<VerificationResponse> {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Server Action: Start Verification ===');
    console.log('Incoming request:', JSON.stringify(request, null, 2));
  }
  
  try {
    const { customerInfo } = request;

    // Prepare the request body
    const requestBody = {
      referenceId: `customer_${Date.now()}`,
      config: {
        webhookUrl: 'https://vecu-idv.emulator_idvp.com'
      },
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        ...(customerInfo.middleName && { middleName: customerInfo.middleName }),
        ...(customerInfo.email && { email: customerInfo.email }),
        ...(customerInfo.phone && { phone: getPhoneNumberForAPI(customerInfo.phone) }),
        address: {
          ...customerInfo.address,
          ...(customerInfo.address.line_2 === '' && { line_2: undefined }),
          ...(customerInfo.address.minor_admin_division === '' && {
            minor_admin_division: undefined
          })
        }
      }
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('API Request URL:', 'https://mpbahqqt37.execute-api.us-east-1.amazonaws.com/latest/identity/verify/start');
      console.log('API Request Body:', JSON.stringify(requestBody, null, 2));
    }

    const response = await fetch(
      'https://mpbahqqt37.execute-api.us-east-1.amazonaws.com/latest/identity/verify/start',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('API Response Status:', response.status, response.statusText);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    }

    if (response.ok) {
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response Data:', JSON.stringify(data, null, 2));
        console.log('=== Server Action: Success ===');
      }
      return {
        success: true,
        data,
        statusCode: response.status
      };
    } else {
      let errorMessage = 'Failed to start verification';
      let errorData = null;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        if (process.env.NODE_ENV === 'development') {
          console.log('API Error Response Data:', JSON.stringify(errorData, null, 2));
        }
      } catch {
        errorMessage = `${response.status} ${response.statusText}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('API Error: Non-JSON response');
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('=== Server Action: API Error ===');
      }
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('=== Server Action: Exception ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('==============================');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to connect to the verification service'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}