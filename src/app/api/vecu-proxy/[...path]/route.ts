import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://c0j9hytfof.execute-api.us-east-1.amazonaws.com/shyju2';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Reconstruct the full path
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    // Get the request body
    const body = await request.json();

    // Forward the request with all headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Copy SDK-Key header if present
    const sdkKey = request.headers.get('SDK-Key');
    if (sdkKey) {
      headers['SDK-Key'] = sdkKey;
    }

    // Copy Authorization header if present
    const authorization = request.headers.get('Authorization');
    if (authorization) {
      headers['Authorization'] = authorization;
    }

    console.log(`Proxying POST request to: ${url}`);
    console.log('Headers:', headers);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Reconstruct the full path
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = `${API_BASE_URL}/${path}`;

    // Forward the request with all headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Copy SDK-Key header if present
    const sdkKey = request.headers.get('SDK-Key');
    if (sdkKey) {
      headers['SDK-Key'] = sdkKey;
    }

    // Copy Authorization header if present
    const authorization = request.headers.get('Authorization');
    if (authorization) {
      headers['Authorization'] = authorization;
    }

    console.log(`Proxying GET request to: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { params: _params }: { params: Promise<{ path: string[] }> }
) {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, SDK-Key',
    },
  });
}