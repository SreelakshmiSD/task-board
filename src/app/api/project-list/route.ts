import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const dateRange = searchParams.get('date_range');

    if (!email) {
      return NextResponse.json(
        { status: 'failure', message: 'email parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Proxying projects request for email:', email, 'date_range:', dateRange);

    // Build the API URL with date range parameter
    let apiUrl = `https://workflow-dev.e8demo.com/project-list/?email=${encodeURIComponent(email)}`;
    if (dateRange) {
      apiUrl += `&date_range=${encodeURIComponent(dateRange)}`;
    }
    console.log('📡 Calling external API:', apiUrl);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    console.log('✅ External API response:', data);

    // Return the response with proper CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ Proxy error for projects:', error);

    // Check if it's a timeout/abort error
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' ||
      error.message.includes('aborted') ||
      error.message.includes('timeout')
    );

    const message = isTimeout
      ? 'External API timeout - using demo data'
      : 'Failed to fetch projects from external API';

    return NextResponse.json(
      {
        status: 'failure',
        message,
        records: []
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
