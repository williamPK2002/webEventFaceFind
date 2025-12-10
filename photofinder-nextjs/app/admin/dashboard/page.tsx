"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Plus, Calendar, MapPin, Image as ImageIcon, Trash2, LogOut, Settings, BarChart3, Users, Bell, Shield, AlertCircle, CheckCircle2, XCircle, Pencil } from "lucide-react"
import { PhotoDetailModal } from "@/components/photo-detail-modal"
import { SystemHealth } from "@/components/system-health"
import { apiClient } from "@/lib/api-client"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("")
  const [events, setEvents] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [removalRequests, setRemovalRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventSearch, setEventSearch] = useState("")
  const [photoSearch, setPhotoSearch] = useState("")

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }

    const storedName = localStorage.getItem("admin_name")
    if (storedName) {
      setAdminName(storedName)
    }

    const fetchData = async () => {
      try {
        const [eventsRes, photosRes, requestsRes] = await Promise.all([
          apiClient.getEvents(),
          apiClient.getAllPhotos(),
          apiClient.getRemovalRequests()
        ])

        if (eventsRes.data && Array.isArray(eventsRes.data)) {
          setEvents(eventsRes.data)
        }
        if (photosRes.data && Array.isArray(photosRes.data)) {
          setPhotos(photosRes.data)
        }
        if (requestsRes.data && Array.isArray(requestsRes.data)) {
          setRemovalRequests(requestsRes.data)
        }
      } catch (error) {
        console.error("Failed to fetch data", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      await apiClient.deletePhoto(photoId)
      setPhotos(photos.filter(p => p.id !== photoId))
    } catch (error) {
      console.error("Failed to delete photo", error)
      alert("Failed to delete photo")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This will also delete all associated photos.")) return

    try {
      await apiClient.deleteEvent(eventId)
      setEvents(events.filter(e => e.id !== eventId))
      // Also remove photos associated with this event from the local state
      setPhotos(photos.filter(p => p.eventId !== eventId))
    } catch (error) {
      console.error("Failed to delete event", error)
      alert("Failed to delete event")
    }
  }

  const handleApproveRequest = async (requestId: string, photoId: string) => {
    if (!confirm("Are you sure you want to approve this removal request and delete the photo?")) return

    try {
      // Delete the photo
      await apiClient.deletePhoto(photoId)
      // Delete the request
      await apiClient.deleteRemovalRequest(requestId)
      // Update local state
      setPhotos(photos.filter(p => p.id !== photoId))
      setRemovalRequests(removalRequests.filter(r => r.id !== requestId))
      alert("Photo removed successfully")
    } catch (error) {
      console.error("Failed to approve request", error)
      alert("Failed to approve request")
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to reject this removal request?")) return

    try {
      await apiClient.deleteRemovalRequest(requestId)
      setRemovalRequests(removalRequests.filter(r => r.id !== requestId))
      alert("Request rejected")
    } catch (error) {
      console.error("Failed to reject request", error)
      alert("Failed to reject request")
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-secondary text-secondary-foreground",
      PUBLISHED: "bg-primary text-primary-foreground",
      ARCHIVED: "bg-muted text-muted-foreground",
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  const activeEvents = events.filter((e) => e.status === "PUBLISHED").length

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(eventSearch.toLowerCase())
  )

  const filteredPhotos = photos.filter(p =>
    p.event?.name?.toLowerCase().includes(photoSearch.toLowerCase()) ||
    p.storageUrl?.toLowerCase().includes(photoSearch.toLowerCase())
  )

  return (
    <>
      <Header userRole="admin" />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {adminName}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/admin/events/create")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{activeEvents}</div>
                  <p className="text-xs text-muted-foreground mt-1">currently published</p>
                </CardContent>
              </Card>

              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{events.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">all time</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="requests">Removal Requests ({removalRequests.length})</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Events</CardTitle>
                      <CardDescription>Manage your campus events</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events..."
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading events...</div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No events found.</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event) => (
                        <div key={event.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border rounded-lg bg-card/50">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{event.name}</h3>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusBadge(event.status)}`}
                              >
                                {event.status.toLowerCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium text-foreground">{new Date(event.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-medium text-foreground">{new Date(event.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos">
              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Photos</CardTitle>
                      <CardDescription>Manage all uploaded photos ({filteredPhotos.length})</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by event or filename..."
                        value={photoSearch}
                        onChange={(e) => setPhotoSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading photos...</div>
                  ) : filteredPhotos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No photos found.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredPhotos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                          <img
                            src={`http://localhost:3000/photos/view/${photo.id}`}
                            alt="Event photo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate">
                            {photo.event?.name || new Date(photo.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle>Removal Requests</CardTitle>
                  <CardDescription>Review and manage photo removal requests from users</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
                  ) : removalRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No pending removal requests.</div>
                  ) : (
                    <div className="space-y-4">
                      {removalRequests.map((request) => (
                        <div key={request.id} className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-lg bg-card/50">
                          {request.photo && (
                            <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                              <img
                                src={request.photo.url}
                                alt="Requested photo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="font-semibold text-foreground">
                                {request.photo?.eventName || "Unknown Event"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Requested by <span className="font-medium">{request.userName}</span> on{" "}
                                {new Date(request.createdAt).toLocaleDateString()} at{" "}
                                {new Date(request.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            {request.reason && (
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Reason</p>
                                <p className="text-sm text-foreground">{request.reason}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex md:flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id, request.photoId)}
                              className="flex-1 md:flex-none bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Approve & Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              className="flex-1 md:flex-none"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health">
              <SystemHealth />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
