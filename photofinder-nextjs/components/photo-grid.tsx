"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Heart, Download } from "lucide-react"
import { PhotoDetailModal } from "@/components/photo-detail-modal"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence?: number
}

interface PhotoGridProps {
  photos: Photo[]
  onRemove?: (photoId: string) => void
}

export function PhotoGrid({ photos, onRemove }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [savedPhotoIds, setSavedPhotoIds] = useState<string[]>([])

  useEffect(() => {
    // Load saved photos from API
    const loadSavedPhotos = async () => {
      try {
        const userId = localStorage.getItem('university_id') || 'guest'
        const response = await fetch(`http://localhost:3000/saved-photos/${userId}`)
        if (response.ok) {
          const savedPhotos = await response.json()
          setSavedPhotoIds(savedPhotos.map((item: any) => item.photo.id))
        }
      } catch (err) {
        console.error('Failed to load saved photos:', err)
      }
    }
    loadSavedPhotos()
  }, [])

  const handleSavePhoto = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const userId = localStorage.getItem('university_id') || 'guest'

      if (savedPhotoIds.includes(photoId)) {
        // Unsave
        const response = await fetch(`http://localhost:3000/saved-photos/${userId}/${photoId}`, {
          method: 'DELETE',
          headers: { 'user-id': userId },
        })
        if (response.ok) {
          setSavedPhotoIds(savedPhotoIds.filter(id => id !== photoId))
        }
      } else {
        // Save
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
      // Use API proxy endpoint
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="overflow-hidden border border-border hover:border-primary/50 transition-colors group"
          >
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

              {/* Desktop: Overlay on hover - Only works with mouse */}
              <div className="hidden 2xl:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
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
                {onRemove && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Remove this photo from My Photos?")) {
                        onRemove(photo.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-3 space-y-1">
              <p className="font-semibold text-sm text-foreground truncate">{photo.eventName}</p>
              <p className="text-xs text-muted-foreground">{new Date(photo.eventDate).toLocaleDateString()}</p>
            </div>

            {/* Action Buttons - Always visible below the image */}
            <div className="p-3 pt-0 2xl:hidden">
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
                {onRemove && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Remove this photo from My Photos?")) {
                        onRemove(photo.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedPhoto && (
        <PhotoDetailModal photo={selectedPhoto} isOpen={showDetail} onClose={() => setShowDetail(false)} />
      )}
    </>
  )
}
