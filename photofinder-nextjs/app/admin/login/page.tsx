"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, Lock } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate admin authentication
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (email === "admin@university.edu" && password === "admin123") {
        localStorage.setItem("admin_token", "admin_token_" + Date.now())
        localStorage.setItem("admin_name", "Admin User")
        router.push("/admin/dashboard")
      } else {
        setError("Invalid admin credentials")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-border backdrop-blur-sm bg-card/80">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase">Admin</span>
          </div>
          <CardTitle className="text-2xl">Admin Console</CardTitle>
          <CardDescription>Sign in to manage events and photos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              size="lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Demo credentials: admin@university.edu / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
