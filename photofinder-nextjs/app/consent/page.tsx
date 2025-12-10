"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Shield, Lock } from "lucide-react"
import { PrivacyConsentForm, type ConsentData } from "@/components/privacy-consent-form"

export default function ConsentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [consent, setConsent] = useState<ConsentData>({
    globalFaceSearch: true,
    dataProcessing: true,
  })
  const [error, setError] = useState<string | null>(null)

  const handleConsent = async (accepted: boolean) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate storing consent preferences
      await new Promise((resolve) => setTimeout(resolve, 800))

      localStorage.setItem(
        "consent_preferences",
        JSON.stringify({
          ...consent,
          accepted,
          timestamp: new Date().toISOString(),
        }),
      )

      if (accepted) {
        router.push("/dashboard")
      } else {
        router.push("/consent/minimal")
      }
    } catch (err) {
      setError("Failed to save consent preferences. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConsentChange = (key: keyof ConsentData) => {
    setConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border border-border">
            <CardHeader className="space-y-2 bg-card/50">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle className="text-2xl">Privacy & Consent</CardTitle>
                  <CardDescription>Control how your data is used for photo discovery</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {error && (
                <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <PrivacyConsentForm
                consent={consent}
                onChange={handleConsentChange}
                disabled={isLoading}
              />


              {/* Privacy Rights Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border/30">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-2 text-muted-foreground">
                    <p className="font-semibold text-foreground">Your Privacy Rights</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>You can opt-out of face search at any time</li>
                      <li>Request removal or blur of photos featuring you</li>
                      <li>Download or delete your personal data</li>
                      <li>Learn more in our privacy policy</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => handleConsent(true)}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                  size="lg"
                >
                  {isLoading ? "Processing..." : "Accept & Continue"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
