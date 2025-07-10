import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, task_id, status, stage } = body

    console.log('📡 Update task status/stage request:', { email, task_id, status, stage })

    if (!email || !task_id) {
      return NextResponse.json(
        { error: 'Missing required fields: email and task_id' },
        { status: 400 }
      )
    }

    // Prepare the API data
    const apiData: any = {
      email,
      task_id: parseInt(task_id.toString()),
    }

    // Add status or stage based on what's being updated
    if (status !== undefined) {
      // Map status strings to status IDs
      const statusMap: { [key: string]: number } = {
        'pending': 1,      // Intermediate
        'ongoing': 2,      // On-going  
        'completed': 3,    // Completed
      }
      apiData.status = statusMap[status] || 1
    }

    if (stage !== undefined) {
      // Map stage strings to stage IDs
      const stageMap: { [key: string]: number } = {
        'design': 47,      // Design
        'html': 48,        // HTML
        'development': 49, // Development
        'qa': 51,          // QA
      }
      apiData.stage = stageMap[stage] || 47
    }

    console.log('📡 Calling task-status API with data:', JSON.stringify(apiData, null, 2))

    // Call the external API
    const apiUrl = 'https://workflow-dev.e8demo.com/task-status/'
    
    // Try with form data first (as per your previous successful implementations)
    const formData = new FormData()
    Object.keys(apiData).forEach(key => {
      if (apiData[key] !== null && apiData[key] !== undefined) {
        formData.append(key, apiData[key].toString())
      }
    })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
      signal: AbortSignal.timeout(30000),
    })

    console.log('📡 API response status:', response.status)

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
