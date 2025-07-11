import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, task_id, status, stage } = body

    console.log('📡 Update task status request:', { email, task_id, status, stage })

    if (!email || !task_id) {
      return NextResponse.json(
        { error: 'Missing required fields: email and task_id' },
        { status: 400 }
      )
    }

    // Prepare the API data - your API only accepts email, task_id, and status
    const apiData: any = {
      email,
      task_id: parseInt(task_id.toString()),
    }

    // Determine which API endpoint to use and prepare data accordingly
    let apiUrl: string;
    let updateType: 'status' | 'stage';

    if (status !== undefined) {
      // Status update - use task-status API
      updateType = 'status';
      apiUrl = 'https://workflow-dev.e8demo.com/task-status/';

      // Map status strings to status IDs
      const statusMap: { [key: string]: number } = {
        'pending': 1,      // Pending
        'ongoing': 2,      // On-going
        'completed': 3,    // Completed
        // Also handle the actual API values with proper casing
        'Pending': 1,      // Pending
        'On-going': 2,     // On-going
        'Completed': 3,    // Completed
      }

      const statusId = statusMap[status];
      if (statusId) {
        apiData.status = statusId;
        console.log(`📋 Status mapping: '${status}' → ID: ${statusId}`);
      } else {
        console.warn(`⚠️ Unknown status '${status}', defaulting to pending (1)`);
        apiData.status = 1; // Default to pending
      }
    } else if (stage !== undefined) {
      // Stage update - use task-stage API
      updateType = 'stage';
      apiUrl = 'https://workflow-dev.e8demo.com/task-stage/';

      // Map stage strings to stage IDs
      const stageMap: { [key: string]: number } = {
        'design': 47,      // Design
        'html': 48,        // HTML
        'development': 49, // Development
        'qa': 51,          // QA
        'discovery': 46,   // Discovery
        // Also handle proper casing
        'Design': 47,
        'HTML': 48,
        'Development': 49,
        'QA': 51,
        'Discovery': 46,
      }

      const stageId = stageMap[stage];
      if (stageId) {
        apiData.stage = stageId;
        console.log(`🎯 Stage mapping: '${stage}' → ID: ${stageId}`);
      } else {
        console.warn(`⚠️ Unknown stage '${stage}', defaulting to design (47)`);
        apiData.stage = 47; // Default to design
      }
    } else {
      console.warn('⚠️ No status or stage provided');
      return NextResponse.json(
        { error: 'Either status or stage must be provided' },
        { status: 400 }
      )
    }

    console.log(`📡 Calling ${updateType} API with data:`, JSON.stringify(apiData, null, 2))
    console.log(`🎯 API Parameters Summary for ${updateType} update:`,
      updateType === 'status'
        ? { email: apiData.email, task_id: apiData.task_id, status: apiData.status }
        : { email: apiData.email, task_id: apiData.task_id, stage: apiData.stage }
    )

    // Validate that we have all required parameters
    const hasRequiredParams = updateType === 'status'
      ? (apiData.email && apiData.task_id && apiData.status)
      : (apiData.email && apiData.task_id && apiData.stage);

    if (!hasRequiredParams) {
      console.error('❌ Missing required parameters for API:', apiData)
      return NextResponse.json(
        { error: `Missing required parameters for ${updateType} update` },
        { status: 400 }
      )
    }

    console.log(`📡 Using API endpoint: ${apiUrl}`)
    
    // Try with form data first (as per your previous successful implementations)
    const formData = new FormData()
    Object.keys(apiData).forEach(key => {
      if (apiData[key] !== null && apiData[key] !== undefined) {
        formData.append(key, apiData[key].toString())
      }
    })

    console.log('📡 FormData contents:')
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
      signal: AbortSignal.timeout(30000),
    })

    console.log('📡 API response status:', response.status)

    if (response.ok) {
      const responseText = await response.text()
      console.log('✅ API success response:', responseText)

      try {
        const jsonResponse = JSON.parse(responseText)
        return NextResponse.json(jsonResponse)
      } catch (parseError) {
        console.log('📄 Response is not JSON, returning as text')
        return NextResponse.json({
          success: true,
          message: 'Task updated successfully',
          raw_response: responseText
        })
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API error response:', errorText)
      
      // Try with JSON if form data fails
      console.log('📡 Trying with JSON...')
      const jsonResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiData),
        signal: AbortSignal.timeout(30000),
      })

      if (!jsonResponse.ok) {
        const jsonErrorText = await jsonResponse.text()
        console.error('❌ JSON API error response:', jsonErrorText)
        throw new Error(`API request failed: ${jsonResponse.status} - ${jsonErrorText}`)
      }

      const jsonResult = await jsonResponse.json()
      console.log('✅ JSON API success response:', jsonResult)
      return NextResponse.json(jsonResult)
    }

    const result = await response.json()
    console.log('✅ API success response:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Update task status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update task status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
