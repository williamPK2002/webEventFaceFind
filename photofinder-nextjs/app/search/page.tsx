"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader, AlertCircle, Camera, Sparkles } from "lucide-react"
import { SearchResultGrid } from "@/components/search-result-grid"
import { apiClient } from "@/lib/api-client"

interface SearchResult {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

export default function FaceSearchPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      router.push("/login")
      return
    }
  }, [router])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB")
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setSearchResults([])
      setHasSearched(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSearch = async () => {
    if (!uploadedImage) {
      setError("Please upload an image first")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // Real API call
      const { data, error } = await apiClient.searchByFace(uploadedImage)

      if (error) {
        throw new Error(error)
      }

      // Backend now returns { message, results: [...] }
      console.log('Search response:', data)

      // Show debug info
      if (data && data.message) {
        alert(`Backend says: ${data.message}\nResults: ${data.results?.length || 0}`)
      }

      if (data && data.results) {
        // Sort results by confidence (highest match first)
        const sortedResults = data.results.sort((a: SearchResult, b: SearchResult) => b.confidence - a.confidence);
        setSearchResults(sortedResults);
      } else {
        setSearchResults([]);
      }

      setHasSearched(true)

    } catch (err) {
      console.error('Full error:', err)
      setError(`Face search failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <>
      <Header showLogout />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI-Powered Face Search</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Find Your Photos</h1>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg px-4">
              Upload a selfie and let AI discover all your moments across campus events
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/30 mb-8 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Upload Your Selfie
              </CardTitle>
              <CardDescription>Local processing only - your image is analyzed on your device first</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-card/50"
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                {uploadedImage ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded selfie"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Click to upload a different image</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG or GIF (max. 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSearch}
                disabled={!uploadedImage || isSearching}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-6"
                size="lg"
              >
                {isSearching ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Searching with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Search My Photos
                  </>
                )}
              </Button>

              {/* Privacy Notice */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  Your uploaded image is processed locally first and not stored on our servers. Only aggregate face
                  embeddings are used for matching against event photos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">AI Match Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Found <span className="font-bold text-primary">{searchResults.length}</span> photo{searchResults.length !== 1 ? 's' : ''} where your face was detected.
                      {searchResults.length > 0 && ' Results are sorted by match confidence (highest first).'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Your Photos</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedImage(null)
                    setSearchResults([])
                    setHasSearched(false)
                  }}
                  className="border-border"
                >
                  New Search
                </Button>
              </div>

              {searchResults.length > 0 ? (
                <SearchResultGrid photos={searchResults} />
              ) : (
                <Card className="border border-border">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No matching photos found. Try uploading a different image.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          </div>

          {/* Help Section */}
          {!hasSearched && !uploadedImage && (
            <div className="max-w-4xl mx-auto">
            <Card className="border border-border mt-8 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>- Use a clear, well-lit selfie with your face clearly visible</p>
                <p>- Similar lighting and angle to your photos in events works best</p>
                <p>- Avoid heavy filters or makeup changes from event photos</p>
                <p>- Multiple search attempts can help find more photos</p>
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
