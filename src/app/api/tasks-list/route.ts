import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const dateRange = searchParams.get('date_range');
    const project = searchParams.get('project');

    if (!email) {
      return NextResponse.json(
        { status: 'failure', message: 'email parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Proxying tasks request for email:', email, 'date_range:', dateRange, 'project:', project);

    // Build the API URL with all parameters
    let apiUrl = `https://workflow-dev.e8demo.com/tasks-list/?email=${encodeURIComponent(email)}`;

    if (dateRange) {
      apiUrl += `&date_range=${encodeURIComponent(dateRange)}`;
    }

    if (project) {
      apiUrl += `&project[0]=${encodeURIComponent(project)}`;
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

    // Log the first task structure for debugging
    if (data.records && data.records.length > 0) {
      console.log('🔍 First task structure:', JSON.stringify(data.records[0], null, 2));
      console.log('🔍 First task status:', JSON.stringify(data.records[0].status, null, 2));
      console.log('🔍 First task stage:', JSON.stringify(data.records[0].stage, null, 2));
    }

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
    console.error('❌ Proxy error for tasks:', error);

    // Check if it's a timeout/abort error
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' ||
      error.message.includes('aborted') ||
      error.message.includes('timeout')
    );

    const message = isTimeout
      ? 'External API timeout - using demo data'
      : 'Failed to fetch tasks from external API';

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
