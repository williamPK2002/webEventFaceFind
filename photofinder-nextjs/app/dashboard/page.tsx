"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { PhotoGrid } from "@/components/photo-grid"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [universityId, setUniversityId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [savedPhotos, setSavedPhotos] = useState<Photo[]>([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      router.push("/login")
      return
    }

    const storedName = localStorage.getItem("user_name")
    const storedId = localStorage.getItem("university_id")
    const storedEmail = localStorage.getItem("user_email") || "student@mfu.ac.th"
    if (storedName) setUserName(storedName)
    if (storedId) setUniversityId(storedId)
    setUserEmail(storedEmail)

    // Load saved photos from API
    const loadSavedPhotos = async () => {
      try {
        const userId = storedId || 'guest'
        
        const response = await fetch(`http://localhost:3000/saved-photos/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch saved photos')
        }

        const savedPhotosData = await response.json()

        const transformedPhotos = savedPhotosData.map((item: any) => ({
          id: item.photo.id,
          url: item.photo.storageUrl,
          eventName: item.photo.event?.name || 'Unknown Event',
          eventDate: item.photo.event?.date || item.photo.createdAt,
          confidence: 0.95,
        }))

        setSavedPhotos(transformedPhotos)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load saved photos:', err)
        setIsLoading(false)
      }
    }

    loadSavedPhotos()
  }, [router])

  const handleRemovePhoto = async (photoId: string) => {
    try {
      const userId = universityId || 'guest'
      
      const response = await fetch(`http://localhost:3000/saved-photos/${userId}/${photoId}`, {
        method: 'DELETE',
        headers: {
          'user-id': userId,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to unsave photo')
      }

      // Update local state
      setSavedPhotos(savedPhotos.filter(p => p.id !== photoId))
    } catch (err) {
      console.error('Failed to unsave photo:', err)
      alert('Failed to remove photo. Please try again.')
    }
  }

  const filteredPhotos = selectedFilter === "all" ? savedPhotos : savedPhotos.filter((p) => p.eventName === selectedFilter)
  const events = [...new Set(savedPhotos.map((p) => p.eventName))]

  return (
    <>
      <Header userRole="student" />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Photos</h1>
                <p className="text-sm text-muted-foreground mt-1">Your saved photos from campus events</p>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={() => router.push("/search")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-500 text-base"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Face Search
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your photos...</p>
            </div>
          ) : savedPhotos.length > 0 ? (
            <PhotoGrid photos={savedPhotos} onRemove={handleRemovePhoto} />
          ) : (
            <Card className="border border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No saved photos yet.</p>
                <Button onClick={() => router.push("/search")} variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Face Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
