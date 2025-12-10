"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<"student" | "photographer" | null>(null)

  const handleSSOLogin = async (role: "student" | "photographer") => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const token = "mock_token_" + Date.now()
      const userId = "user_" + Math.random().toString(36).substr(2, 9)

      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_id", userId)

      if (role === "photographer") {
        const photographerData = {
          id: userId,
          name: "Alex Thompson",
          email: "photographer@mfu.ac.th",
          role: "photographer",
        }
        localStorage.setItem("user_data", JSON.stringify(photographerData))
        localStorage.setItem("user_name", photographerData.name)
        localStorage.setItem("user_email", photographerData.email)
        localStorage.setItem("user_role", "photographer")
        router.push("/photographer")
      } else {
        const studentData = {
          id: userId,
          name: "Jane Student",
          email: "student@mfu.ac.th",
          universityId: "6531234567",
          role: "student",
        }
        localStorage.setItem("user_data", JSON.stringify(studentData))
        localStorage.setItem("user_name", studentData.name)
        localStorage.setItem("user_email", studentData.email)
        localStorage.setItem("university_id", studentData.universityId)
        localStorage.setItem("user_role", "student")
        router.push("/consent")
      }
    } catch (err) {
      setError("SSO login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (userType === null) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border border-border">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Select how you'd like to sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setUserType("student")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              size="lg"
            >
              Sign In as Student
            </Button>

            <Button
              onClick={() => setUserType("photographer")}
              variant="outline"
              className="w-full border border-border py-6"
              size="lg"
            >
              Sign In as Photographer
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            {userType === "photographer"
              ? "Sign in with your university SSO account to upload photos"
              : "Sign in with your university SSO account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            onClick={() => handleSSOLogin(userType)}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
            size="lg"
          >
            {isLoading ? "Signing in..." : "Sign In with University SSO"}
          </Button>

          <Button
            onClick={() => setUserType(null)}
            variant="outline"
            className="w-full border border-border"
            disabled={isLoading}
          >
            Back
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            {userType === "photographer"
              ? "Your professional account will give you access to the photo upload portal."
              : "Your first login will take you through our consent process to enable AI-powered photo discovery."}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
