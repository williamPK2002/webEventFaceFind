"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, ArrowLeft, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function CreateEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  })

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    setIsLoading(false)
  }, [router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError("Event name is required")
        setIsSubmitting(false)
        return
      }

      if (!formData.date) {
        setError("Event date is required")
        setIsSubmitting(false)
        return
      }

      // Validate date is not in the past
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

      // Call API to create event
      const response = await apiClient.createEvent({
        name: formData.name.trim(),
        date: new Date(formData.date).toISOString(),
        status: formData.status,
        slug: slug,
      })

      if (response.error) {
        setError(response.error || "Failed to create event")
        setIsSubmitting(false)
        return
      }

      // Success - redirect to dashboard or event management
      router.push("/admin/dashboard")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header showLogout />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </main>
      </>
    )
  }

  return (
    <>
      <Header userRole="admin" />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
            <p className="text-muted-foreground mt-2">Set up a new campus event for photo uploads and face search</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Card className="border border-destructive/30 bg-destructive/5 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Error</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Card */}
          <Card className="border border-border backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Configure the basic information for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Event Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Spring Orientation 2024"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-border"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Give your event a descriptive name</p>
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-foreground font-medium">
                    Event Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="border-border"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">The date when this event occurs</p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-foreground font-medium">
                    Event Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Draft: Not visible | Published: Visible to users | Archived: Read-only
                  </p>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex-1 border-border"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border border-border bg-primary/5 border-primary/20 mt-6 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Event will appear in your event console</p>
              <p>✓ Photographers can start uploading photos</p>
              <p>✓ Students can opt-in and search for themselves</p>
              <p>✓ Analytics will track engagement and metrics</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
