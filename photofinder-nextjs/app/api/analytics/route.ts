import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock analytics data
    const analytics = {
      totalEvents: 6,
      totalPhotos: 12412,
      averageOptInRate: 78.5,
      totalUsers: 2341,
      averageLatency: "245ms",
      topMoments: [
        {
          id: "moment_1",
          name: "Campus Concert Crowd Shot",
          likes: 234,
          shares: 45,
        },
      ],
      engagementStats: {
        views: 12450,
        downloads: 3421,
        shares: 892,
        removalRequests: 12,
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
