import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, project_id, assign_users, unassign_users } = body;

    console.log('📡 Assign/unassign employees to project request:', {
      email,
      project_id,
      assign_users,
      unassign_users
    });

    if (!email || !project_id) {
      return NextResponse.json(
        { error: 'Missing required fields: email and project_id' },
        { status: 400 }
      );
    }

    // Prepare the API data in the format expected by the external API
    const apiData: any = {
      email,
      project_id: parseInt(project_id.toString())
    };

    // Add assign_users array if provided
    if (assign_users && Array.isArray(assign_users) && assign_users.length > 0) {
      assign_users.forEach((userId, index) => {
        apiData[`assign_users[${index}]`] = parseInt(userId.toString());
      });
    }

    // Add unassign_users array if provided
    if (unassign_users && Array.isArray(unassign_users) && unassign_users.length > 0) {
      unassign_users.forEach((userId, index) => {
        apiData[`unassign_users[${index}]`] = parseInt(userId.toString());
      });
    }

    console.log('📡 Calling assign-employees-project API with data:', JSON.stringify(apiData, null, 2));

    // Make the API call to assign employee to project
    const apiUrl = 'https://workflow-dev.e8demo.com/assign-employees-project/';

    // Convert the data to form-encoded format
    const formData = new URLSearchParams();
    Object.keys(apiData).forEach(key => {
      formData.append(key, apiData[key].toString());
    });

    console.log('📡 Form data being sent:', formData.toString());

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📡 API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Assign employee to project API response:', data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Error assigning employee to project:', error);

    // Check if it's a timeout/abort error
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' ||
      error.message.includes('aborted') ||
      error.message.includes('timeout')
    );

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    const message = isTimeout
      ? 'External API timeout while assigning employee to project'
      : 'Failed to assign employee to project';

    return NextResponse.json(
      { 
        error: message,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
