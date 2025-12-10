"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download, CheckCircle, Heart } from "lucide-react"
import { PhotoDetailModal } from "@/components/photo-detail-modal"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

interface SearchResultGridProps {
  photos: Photo[]
}

export function SearchResultGrid({ photos }: SearchResultGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [savedPhotoIds, setSavedPhotoIds] = useState<string[]>([])

  useEffect(() => {
    // Load saved photos from API
    const loadSavedPhotos = async () => {
      try {
        const userId = localStorage.getItem("university_id") || 'guest'
        const response = await fetch(`http://localhost:3000/saved-photos/${userId}`)
        if (response.ok) {
          const savedPhotos = await response.json()
          const ids = savedPhotos.map((item: any) => item.photo.id)
          setSavedPhotoIds(ids)
        }
      } catch (err) {
        console.error('Failed to load saved photos:', err)
      }
    }
    loadSavedPhotos()
  }, [])

  const handleSavePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const userId = localStorage.getItem("university_id") || 'guest'
    const isSaved = savedPhotoIds.includes(photoId)

    try {
      if (isSaved) {
        // Remove from saved
        const response = await fetch(`http://localhost:3000/saved-photos/${userId}/${photoId}`, {
          method: 'DELETE',
          headers: {
            'user-id': userId,
          },
        })
        if (response.ok) {
          setSavedPhotoIds(savedPhotoIds.filter((id) => id !== photoId))
        }
      } else {
        // Add to saved
        const response = await fetch('http://localhost:3000/saved-photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userId,
          },
          body: JSON.stringify({ photoId }),
        })
        if (response.ok) {
          setSavedPhotoIds([...savedPhotoIds, photoId])
        }
      }
    } catch (err) {
      console.error('Failed to save/unsave photo:', err)
      alert('Failed to update saved photos. Please try again.')
    }
  }

  const handleDownload = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(photo.url)
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
      alert('Unable to download automatically. Opening photo in new tab...')
      // Fallback to opening in new tab
      window.open(photo.url, '_blank')
    }
  }

  const getConfidenceBadgeColor = (confidence: number) => {
    const percent = confidence * 100;
    if (percent >= 90) return "bg-green-500";
    if (percent >= 75) return "bg-blue-500";
    if (percent >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  }

  const getConfidenceLabel = (confidence: number) => {
    const percent = confidence * 100;
    if (percent >= 90) return "Excellent Match";
    if (percent >= 75) return "Good Match";
    if (percent >= 60) return "Fair Match";
    return "Possible Match";
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => (
          <Card
            key={photo.id}
            className="overflow-hidden border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-300 group relative"
          >
            {/* Rank Badge */}
            {index < 3 && (
              <div className="absolute top-3 left-3 z-10">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <span className="text-sm">#{index + 1}</span>
                  {index === 0 && <CheckCircle className="w-3 h-3" />}
                </div>
              </div>
            )}

            <div 
              className="relative aspect-square bg-muted overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedPhoto(photo)
                setShowDetail(true)
              }}
            >
              <Image
                src={`http://localhost:3000/photos/view/${photo.id}` || "/placeholder.svg"}
                alt={photo.eventName}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Desktop Hover Actions - Only show on hover for desktop */}
              <div className="hidden 2xl:flex absolute inset-0 items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className={`${savedPhotoIds.includes(photo.id) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-white/90 hover:bg-white text-black'} shadow-lg`}
                  onClick={(e) => handleSavePhoto(photo.id, e)}
                >
                  <Heart className={`w-4 h-4 mr-1 ${savedPhotoIds.includes(photo.id) ? 'fill-current' : ''}`} />
                  {savedPhotoIds.includes(photo.id) ? 'Saved' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPhoto(photo)
                    setShowDetail(true)
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-black shadow-lg"
                  onClick={(e) => handleDownload(photo, e)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              {/* Confidence Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div className={`${getConfidenceBadgeColor(photo.confidence)} text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg`}>
                  {Math.round(photo.confidence * 100)}%
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-1.5 ${getConfidenceBadgeColor(photo.confidence)} bg-opacity-90 text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {getConfidenceLabel(photo.confidence)}
                  </div>
                  <p className="font-bold text-white text-lg drop-shadow-lg line-clamp-1">
                    {photo.eventName}
                  </p>
                  <p className="text-xs text-white/90 drop-shadow">
                    {new Date(photo.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Always visible below the image */}
            <CardContent className="p-3 2xl:hidden">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={`flex-1 ${savedPhotoIds.includes(photo.id) ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSavePhoto(photo.id, e)
                  }}
                >
                  <Heart className={`w-4 h-4 mr-1 ${savedPhotoIds.includes(photo.id) ? 'fill-current' : ''}`} />
                  {savedPhotoIds.includes(photo.id) ? 'Saved' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPhoto(photo)
                    setShowDetail(true)
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDownload(photo, e)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPhoto && (
        <PhotoDetailModal photo={selectedPhoto} isOpen={showDetail} onClose={() => setShowDetail(false)} />
      )}
    </>
  )
}
