import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { status: 'failure', message: 'action parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Proxying masters-list request for action:', action);

    // Build the API URL with action parameter
    const apiUrl = `https://workflow-dev.e8demo.com/masters-list/?action=${encodeURIComponent(action)}`;
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Masters-list API response:', { status: data.status, recordsCount: data.records?.length || 0 });

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Proxy error for masters-list:', error);

    // Check if it's a timeout/abort error
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' ||
      error.message.includes('aborted') ||
      error.message.includes('timeout')
    );

    const message = isTimeout
      ? 'External API timeout - using demo data'
      : 'Failed to fetch masters-list from external API';

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
