"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Download, Trash2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence?: number
}

interface PhotoDetailModalProps {
  photo: Photo | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoDetailModal({ photo, isOpen, onClose }: PhotoDetailModalProps) {
  const [showRemovalRequest, setShowRemovalRequest] = useState(false)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowRemovalRequest(false)
      setReason("")
    }
  }, [isOpen])

  if (!photo) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:3000/photos/download/${photo.id}`)
      if (!response.ok) throw new Error('Failed to download')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date(photo.eventDate).toISOString().split('T')[0]
      const timestamp = Date.now()
      a.download = `${photo.eventName.replace(/\s+/g, '_')}_${date}_${timestamp}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to download photo:', err)
      alert('Unable to download. Please try again.')
    }
  }

  const handleSubmitRemovalRequest = async () => {
    // Validate required fields
    if (!reason.trim()) {
      alert("Please provide a reason for removal")
      return
    }

    // Get user info from localStorage
    const userName = localStorage.getItem("user_name") || "Unknown User"
    const userEmail = localStorage.getItem("user_email") || ""

    setIsSubmitting(true)
    try {
      const response = await apiClient.requestPhotoRemoval(photo.id, "DELETE", userName, userEmail, reason)

      if (response.error) {
        alert("Failed to submit removal request. Please try again.")
      } else {
        alert("Removal request submitted successfully. Our team will review it within 24 hours.")
        setShowRemovalRequest(false)
        setReason("")
        onClose()
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{photo.eventName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Display */}
          <div className="relative w-full max-h-[400px] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <Image src={`http://localhost:3000/photos/view/${photo.id}` || "/placeholder.svg"} alt={photo.eventName} width={800} height={600} className="object-contain max-h-[400px] w-auto" />
          </div>

          {/* Photo Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-card border border-border rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Event</p>
              <p className="font-semibold text-foreground">{photo.eventName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
              <p className="font-semibold text-foreground">{new Date(photo.eventDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!showRemovalRequest ? (
              <>
                <Button
                  onClick={handleDownload}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive/90"
                  onClick={() => setShowRemovalRequest(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Request Removal
                </Button>
              </>
            ) : (
              <div className="space-y-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-foreground">Request Photo Removal</p>
                    <p className="text-muted-foreground">
                      Our team will review your request within 24 hours. You'll receive an email confirmation.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Reason for Removal <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Please explain why you want this photo removed"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[80px]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitRemovalRequest}
                    disabled={isSubmitting}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowRemovalRequest(false)
                      setReason("")
                    }}
                    disabled={isSubmitting}
                    className="flex-1 border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
