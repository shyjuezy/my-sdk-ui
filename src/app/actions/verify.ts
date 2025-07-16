'use server';

export interface VerificationRequest {
  customerInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
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
        address: {
          ...customerInfo.address,
          ...(customerInfo.address.line_2 === '' && { line_2: undefined }),
          ...(customerInfo.address.minor_admin_division === '' && {
            minor_admin_division: undefined
          })
        }
      }
    };

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

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data,
        statusCode: response.status
      };
    } else {
      let errorMessage = 'Failed to start verification';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `${response.status} ${response.statusText}`;
      }

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
      };
    }
  } catch (error) {
    console.error('Server action error:', error);
    
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