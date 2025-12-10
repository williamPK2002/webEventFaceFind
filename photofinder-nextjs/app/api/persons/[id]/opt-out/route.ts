import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { optOutType, reason } = await request.json()

    if (!userId || !optOutType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // In production:
    // 1. Mark user consent as withdrawn
    // 2. Queue face embeddings for deletion
    // 3. Log for compliance audit trail
    // 4. Send confirmation email

    const optOutOptions = {
      global: "All face search disabled",
      event: `Face search disabled for event: ${optOutType}`,
      photos: "Mark all photos for deletion",
    }

    return NextResponse.json({
      status: "success",
      userId,
      optOutType,
      action: optOutOptions[optOutType as keyof typeof optOutOptions] || "Unknown action",
      effectiveDate: new Date().toISOString(),
      confirmationSent: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Opt-out failed" }, { status: 500 })
  }
}
