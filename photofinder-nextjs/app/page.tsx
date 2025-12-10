"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, Shield } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Photo Finder</span>
          </div>
          <Button
            onClick={() => router.push("/login")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">Find Your Moments</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover and download your photos from campus events using AI-powered face recognition
            </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={() => router.push("/login")}
              size="lg"
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 font-semibold shadow-xl transition-all px-8 py-6 text-base"
            >
              Sign In with SSO
            </Button>
            <Button
              onClick={() => router.push("/admin/login")}
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 transition-all font-semibold shadow-xl px-8 py-6 text-base"
            >
              Admin Console
            </Button>
          </div>
        </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <Camera className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Find Your Photos</CardTitle>
              <CardDescription>Browse all photos from events you attended</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access your personal photo album with all images from campus events
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <Upload className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Face Search</CardTitle>
              <CardDescription>Upload a selfie to find yourself in photos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced AI face recognition to discover your moments automatically
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>Full control over your data and consent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">GDPR and PDPA compliant with opt-in/opt-out controls</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
