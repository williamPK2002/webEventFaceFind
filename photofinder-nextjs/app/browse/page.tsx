"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PhotoGrid } from "@/components/photo-grid"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

export default function BrowsePhotosPage() {
  const router = useRouter()
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date-newest" | "date-oldest" | "confidence">("date-newest")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      router.push("/login")
      return
    }

    // Fetch real events and photos from backend
    const loadData = async () => {
      try {
        const eventsRes = await fetch('http://localhost:3000/events')
        const eventsData = await eventsRes.json()

        const photosRes = await fetch('http://localhost:3000/photos')
        const photosData = await photosRes.json()

        // Transform backend data to match frontend format
        const transformedPhotos = photosData.map((photo: any) => {
          const event = eventsData.find((e: any) => e.id === photo.eventId)
          return {
            id: photo.id,
            url: `http://localhost:3000/photos/view/${photo.id}`,
            eventName: event?.name || 'Unknown Event',
            eventDate: event?.date || photo.createdAt,
            confidence: 0.95, // Placeholder
          }
        })

        setAllPhotos(transformedPhotos)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load data:', err)
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // Apply filters
  useEffect(() => {
    let results = allPhotos

    // Filter by event
    if (selectedEvents.length > 0) {
      results = results.filter((photo) => selectedEvents.includes(photo.eventName))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter((photo) => photo.eventName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Sort
    if (sortBy === "date-newest") {
      results.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    } else if (sortBy === "date-oldest") {
      results.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    } else if (sortBy === "confidence") {
      results.sort((a, b) => b.confidence - a.confidence)
    }

    setFilteredPhotos(results)
  }, [allPhotos, selectedEvents, searchQuery, sortBy])

  const events = [...new Set(allPhotos.map((p) => p.eventName))]

  const handleToggleEvent = (eventName: string) => {
    setSelectedEvents((prev) => (prev.includes(eventName) ? prev.filter((e) => e !== eventName) : [...prev, eventName]))
  }

  const handleClearFilters = () => {
    setSelectedEvents([])
    setSearchQuery("")
    setSortBy("date-newest")
  }

  const isFiltered = selectedEvents.length > 0 || searchQuery.trim() !== "" || sortBy !== "date-newest"

  return (
    <>
      <Header showLogout />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        {/* Header Section */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Browse All Photos</h1>
            <p className="text-muted-foreground">
              {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date-newest">Newest First</option>
                  <option value="date-oldest">Oldest First</option>
                  <option value="confidence">Best Match</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {selectedEvents.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {selectedEvents.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Collapsible Filter Section */}
            {showFilters && (
              <Card className="border border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Filter by Event</h3>
                    {isFiltered && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-primary hover:text-primary/80"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {events.map((event) => (
                      <label
                        key={event}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedEvents.includes(event)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event)}
                          onChange={() => handleToggleEvent(event)}
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground block truncate">{event}</span>
                          <span className="text-xs text-muted-foreground">
                            {allPhotos.filter((p) => p.eventName === event).length} photos
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Photo Grid or Empty State */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading photos...</p>
            </div>
          ) : filteredPhotos.length > 0 ? (
            <>
              <PhotoGrid photos={filteredPhotos} />
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Showing {filteredPhotos.length} of {allPhotos.length} photos
              </div>
            </>
          ) : (
            <Card className="border border-border">
              <CardContent className="py-12 text-center space-y-4">
                <p className="text-muted-foreground">No photos match your filters</p>
                {isFiltered && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
