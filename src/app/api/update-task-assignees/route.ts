import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, task_id, assignees } = body;

    console.log('📡 Update task assignees request:', { email, task_id, assignees });

    if (!email || !task_id) {
      return NextResponse.json(
        { error: 'Missing required fields: email and task_id' },
        { status: 400 }
      );
    }

    // Prepare the API data
    const apiData: any = {
      email,
      task_id: parseInt(task_id.toString()),
    };

    // Add assignees in the format expected by the API
    if (assignees && Array.isArray(assignees)) {
      assignees.forEach((assigneeId, index) => {
        apiData[`assignees[${index}]`] = assigneeId;
      });
    }

    console.log('📡 Calling update-task-assignees API with data:', JSON.stringify(apiData, null, 2));

    // Make the API call to update task assignees
    const apiUrl = 'https://workflow-dev.e8demo.com/update-task-assignees/';
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(apiData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Update task assignees API response:', data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Error updating task assignees:', error);

    // Check if it's a timeout/abort error
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' ||
      error.message.includes('aborted') ||
      error.message.includes('timeout')
    );

    const message = isTimeout
      ? 'External API timeout while updating task assignees'
      : 'Failed to update task assignees';

    return NextResponse.json(
      {
        status: 'failure',
        message,
        error: error instanceof Error ? error.message : 'Unknown error'
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
