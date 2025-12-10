import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock events data - would be fetched from database
    const events = [
      {
        id: "1",
        name: "Spring Orientation 2024",
        date: "2024-03-15",
        status: "completed",
        faceSearchEnabled: true,
        privacyLevel: "public",
      },
      {
        id: "2",
        name: "Sports Day 2024",
        date: "2024-04-20",
        status: "completed",
        faceSearchEnabled: true,
        privacyLevel: "public",
      },
      {
        id: "3",
        name: "Campus Concert",
        date: "2024-05-10",
        status: "active",
        faceSearchEnabled: true,
        privacyLevel: "public",
      },
    ]

    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, save to database
    const newEvent = {
      id: `event_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
