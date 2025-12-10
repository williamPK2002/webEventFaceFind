import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code, state, role } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
    }

    const token = `oidc_token_${Date.now()}`

    const user =
      role === "photographer"
        ? {
            id: `photographer_${Math.random().toString(36).substr(2, 9)}`,
            email: "photographer@mfu.ac.th",
            name: "Somchai Photographer",
            role: "photographer",
          }
        : {
            id: `user_${Math.random().toString(36).substr(2, 9)}`,
            email: "student@mfu.ac.th",
            name: "Jane Student",
            role: "student",
          }

    return NextResponse.json({
      token,
      user,
      expiresIn: 3600,
    })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
