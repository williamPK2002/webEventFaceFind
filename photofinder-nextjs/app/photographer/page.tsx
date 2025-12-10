"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  Upload,
  Loader2,
  Camera,
  LogOut,
  ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  FolderUp,
  Trash2,
  Trash,
  ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/api-client"



export default function PhotographerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([])
  const [photographerUser, setPhotographerUser] = useState<{
    name: string
    email: string
    id: string
  } | null>(null)

  const [selectedEvent, setSelectedEvent] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([])
  // Fetch real events and photos from backend
  const loadData = async () => {
    try {
      const eventsRes = await fetch('http://localhost:3000/events');
      const eventsData = await eventsRes.json();
      const safeEvents = Array.isArray(eventsData) ? eventsData : [];
      if (!Array.isArray(eventsData)) {
        console.error('Events API returned non-array:', eventsData);
      }
      setEvents(safeEvents);

      const photosRes = await fetch('http://localhost:3000/photos');
      const photosData = await photosRes.json();

      if (Array.isArray(photosData)) {
        const transformedPhotos = photosData.map((photo: any) => {
          const event = safeEvents.find((e: any) => e.id === photo.eventId);
          const dimensions = photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'N/A';
          return {
            id: photo.id,
            filename: photo.storageUrl.split('/').pop() || 'unknown',
            eventName: event?.name || 'Unknown Event',
            uploadDate: photo.createdAt,
            status: photo.processingStatus.toLowerCase(),
            size: dimensions,
            thumbnail: `http://localhost:3000/photos/view/${photo.id}`,
            metadata: {
              datetime: photo.createdAt,
            },
          };
        });

        // Remove duplicates by ID (just in case)
        const uniquePhotos = Array.from(
          new Map(transformedPhotos.map(p => [p.id, p])).values()
        );

        setUploadedPhotos(uniquePhotos);
      } else {
        console.error('Photos API returned non-array:', photosData);
        setUploadedPhotos([]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setEvents([]);
      setUploadedPhotos([]);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem("user_role")
    const authToken = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (!authToken || userRole !== "photographer") {
      setError("You must be logged in as a photographer to access this page.")
      setIsLoading(false)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
      return
    }

    if (userData) {
      try {
        setPhotographerUser(JSON.parse(userData))
      } catch (e) {
        console.error("[v0] Failed to parse user data:", e)
        setPhotographerUser({
          name: "Alex Thompson",
          email: "photographer@mfu.ac.th",
          id: "photographer-1",
        })
      }
    } else {
      setPhotographerUser({
        name: "Alex Thompson",
        email: "photographer@mfu.ac.th",
        id: "photographer-1",
      })
    }

    loadData();

    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter((file) => file.type.startsWith("image/"))
    setSelectedFiles((prev) => [...prev, ...imageFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const clearAllFiles = () => {
    setSelectedFiles([])
    setUploadProgress({})
  }

  const handleBatchUpload = async () => {
    if (!selectedEvent) {
      alert("Please select an event first")
      return
    }
    if (selectedFiles.length === 0) {
      alert("Please select files to upload")
      return
    }

    setIsUploading(true)
    const uploadPromises = selectedFiles.map(async (file, i) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("eventId", selectedEvent)

      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[file.name] || 0
            if (current >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return { ...prev, [file.name]: current + 10 }
          })
        }, 200)

        const response = await fetch(`http://localhost:3000/photos/upload`, {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)

        if (response.ok) {
          const data = await response.json()
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

          // No longer updating local state immediately, will refetch all photos
        } else {
          setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }))
        }
      } catch (error) {
        console.error("[v0] Upload error:", error)
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }))
      }
    })

    await Promise.all(uploadPromises)
    setIsUploading(false)

    // After all uploads are attempted, refetch all data using the existing loadData function
    await loadData();

    setTimeout(() => {
      clearAllFiles()
    }, 2000)
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
      return
    }

    try {
      console.log('Deleting photo:', photoId);
      const response = await apiClient.deletePhoto(photoId);
      console.log('Delete response:', response);

      if (response.error) {
        throw new Error(response.error)
      }

      // Reload data from server to ensure sync
      await loadData();
      console.log('Photo deleted and data reloaded');
    } catch (error) {
      console.error("[v0] Delete error:", error)
      alert("Failed to delete photo. Please try again.")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "completed":
      case "processed":
        return { icon: <CheckCircle className="w-3 h-3" />, variant: "default" as const, label: "Completed" }
      case "processing":
        return { icon: <Clock className="w-3 h-3" />, variant: "secondary" as const, label: "Processing" }
      case "failed":
        return { icon: <XCircle className="w-3 h-3" />, variant: "destructive" as const, label: "Failed" }
      default:
        return { icon: <Clock className="w-3 h-3" />, variant: "outline" as const, label: "Pending" }
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </>
    )
  }

  if (error || !isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <Card className="w-full max-w-md border border-border bg-muted/30 flex-col">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-destructive" />
                Authentication Required
              </CardTitle>
              <CardDescription>You need to be logged in as a photographer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => router.push("/login")} className="w-full bg-primary hover:bg-primary/90">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Camera className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Photographer Portal</h1>
                <p className="text-xs text-muted-foreground">Campus Event Photo Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {photographerUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10">
                      <span className="text-sm font-medium text-foreground">{photographerUser.name}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <span className="text-sm text-muted-foreground">{photographerUser.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        localStorage.removeItem("auth_token")
                        localStorage.removeItem("user_role")
                        localStorage.removeItem("user_data")
                        router.push("/")
                      }}
                      className="text-destructive focus:text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex w-64 border-r border-border bg-muted/30 flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Upload Portal</h2>
          </div>
          <nav className="flex-1 p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-4">WORKFLOW</div>
              <div className="text-sm text-foreground p-2 bg-primary/10 rounded border border-primary/20">
                Step 1: Select Event
              </div>
              <div className="text-sm text-muted-foreground p-2">Step 2: Upload Files</div>
              <div className="text-sm text-muted-foreground p-2">Step 3: Review & Process</div>
            </div>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="p-4 md:p-8">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="upload">Upload Photos</TabsTrigger>
                <TabsTrigger value="my-photos">My Uploaded Photos ({uploadedPhotos.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Photo Upload Portal</h1>
                  <p className="text-muted-foreground">Upload your photos from campus events</p>
                </div>

                <div className="grid gap-6">
                  <Card className="border border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Select Event
                      </CardTitle>
                      <CardDescription>Choose the event you photographed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Select an Event --</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name}
                          </option>
                        ))}
                      </select>
                    </CardContent>
                  </Card>

                  <Card className="border border-border">
                    <CardHeader>
                      <CardTitle>Upload Photos</CardTitle>
                      <CardDescription>
                        Drag and drop or select your photo files (supports multiple files)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm font-medium text-foreground mb-1">Drag photos here or click to select</p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Supports JPG, PNG, HEIC (Max 100MB per file)
                        </p>
                        <div className="flex gap-2 justify-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-input"
                          />
                          <label htmlFor="file-input">
                            <Button variant="outline" asChild>
                              <span>Select Files</span>
                            </Button>
                          </label>

                          <input
                            type="file"
                            {...({ webkitdirectory: "", directory: "" } as any)}
                            multiple
                            onChange={handleFolderSelect}
                            className="hidden"
                            id="folder-input"
                          />
                          <label htmlFor="folder-input">
                            <Button variant="outline" asChild>
                              <span className="flex items-center gap-2">
                                <FolderUp className="w-4 h-4" />
                                Select Folder
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                              Selected Files ({selectedFiles.length})
                            </p>
                            <Button variant="ghost" size="sm" onClick={clearAllFiles}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Clear All
                            </Button>
                          </div>
                          <div className="max-h-64 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
                            {selectedFiles.map((file, index) => {
                              const progress = uploadProgress[file.name]
                              const hasError = progress === -1
                              const isComplete = progress === 100

                              return (
                                <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                  <ImageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                    {progress !== undefined && (
                                      <Progress
                                        value={hasError ? 100 : progress}
                                        className={`h-1 mt-1 ${hasError ? "bg-destructive/20" : ""}`}
                                      />
                                    )}
                                  </div>
                                  {isComplete && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                  {hasError && <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
                                  {!isUploading && !isComplete && !hasError && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>



                  <Button
                    onClick={handleBatchUpload}
                    disabled={isUploading || selectedFiles.length === 0 || !selectedEvent}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Uploading {selectedFiles.length} photos...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ""}Photos
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="my-photos">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">My Uploaded Photos</h1>
                  <p className="text-muted-foreground">View and manage your uploaded event photos</p>
                </div>

                <div className="grid gap-4">
                  {uploadedPhotos.map((photo) => {
                    const statusDisplay = getStatusDisplay(photo.status)
                    return (
                      <Card key={photo.id} className="border border-border hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={photo.thumbnail || "/placeholder.svg"}
                                alt={photo.filename}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                <Badge variant={statusDisplay.variant} className="text-xs flex items-center gap-1">
                                  {statusDisplay.icon}
                                  {statusDisplay.label}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-foreground text-base leading-tight mb-1">
                                    {photo.filename}
                                  </h3>
                                  <p className="text-sm text-primary font-medium">{photo.eventName}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePhoto(photo.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
                                <div>
                                  <span className="text-muted-foreground">Uploaded:</span>
                                  <span className="ml-2 text-foreground">
                                    {new Date(photo.uploadDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Dimensions:</span>
                                  <span className="ml-2 text-foreground">{photo.size}</span>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-border">
                                <span className="text-xs text-muted-foreground">
                                  Captured: {photo.metadata.datetime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {uploadedPhotos.length === 0 && (
                  <Card className="border border-dashed border-border">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No photos uploaded yet</h3>
                      <p className="text-sm text-muted-foreground">Start uploading photos from the Upload tab</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  )
}
