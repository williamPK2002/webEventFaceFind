"use client"

import type React from "react"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface EventData {
    name: string
    date: string
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
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

        const fetchEvent = async () => {
            try {
                const response = await apiClient.getEvent(params.id as string)
                if (response.data) {
                    const eventData = response.data as EventData
                    setFormData({
                        name: eventData.name,
                        date: new Date(eventData.date).toISOString().split('T')[0],
                        status: eventData.status,
                    })
                } else {
                    setError("Event not found")
                }
            } catch (err) {
                setError("Failed to fetch event")
            } finally {
                setIsLoading(false)
            }
        }

        fetchEvent()
    }, [router, params.id])

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

            // Call API to update event
            const response = await apiClient.updateEvent(params.id as string, {
                name: formData.name.trim(),
                date: new Date(formData.date).toISOString(),
                status: formData.status,
            })

            if (response.error) {
                setError(response.error || "Failed to update event")
                setIsSubmitting(false)
                return
            }

            // Success - redirect to dashboard
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
                        <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
                        <p className="text-muted-foreground mt-2">Update event details</p>
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
                            <CardDescription>Update the information for this event</CardDescription>
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
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}
