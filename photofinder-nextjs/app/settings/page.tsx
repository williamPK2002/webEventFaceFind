"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Bell, Shield, CheckCircle2 } from "lucide-react"
import { PrivacyConsentForm, type ConsentData } from "@/components/privacy-consent-form"

export default function SettingsPage() {
  const router = useRouter()
  const [consent, setConsent] = useState<ConsentData>({
    globalFaceSearch: true,
    dataProcessing: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("consent_preferences")
    if (saved) {
      const parsed = JSON.parse(saved)
      setConsent({
        globalFaceSearch: parsed.globalFaceSearch ?? true,
        dataProcessing: parsed.dataProcessing ?? true,
      })
    }
  }, [])

  const handleConsentChange = (key: keyof ConsentData) => {
    setConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSavePreferences = async () => {
    console.log("[v0] Starting save preferences")
    setIsSaving(true)
    setShowSuccess(false)
    await new Promise((resolve) => setTimeout(resolve, 500))

    localStorage.setItem(
      "consent_preferences",
      JSON.stringify({
        ...consent,
        accepted: true,
        timestamp: new Date().toISOString(),
      }),
    )
    setIsSaving(false)
    console.log("[v0] Setting showSuccess to true")
    setShowSuccess(true)
    setTimeout(() => {
      console.log("[v0] Hiding success banner")
      setShowSuccess(false)
    }, 3000)
  }

  useEffect(() => {
    console.log("[v0] showSuccess state changed:", showSuccess)
  }, [showSuccess])

  return (
    <>
      <Header showLogout />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>

          {showSuccess && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 rounded-lg flex items-center gap-3 shadow-lg animate-in slide-in-from-top duration-300">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-base font-semibold text-green-800 dark:text-green-200">
                Preferences saved successfully!
              </p>
            </div>
          )}

          <Tabs defaultValue="privacy" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="privacy">Privacy & Consent</TabsTrigger>
            </TabsList>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-4">
              <Card className="border-2 border-primary/30 bg-primary/5">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <CardTitle>Consent Status</CardTitle>
                      <CardDescription>Control your participation in the photo system</CardDescription>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: consent.globalFaceSearch ? "rgba(130, 24, 26, 0.15)" : "rgba(0, 0, 0, 0.1)",
                        color: consent.globalFaceSearch ? "var(--color-primary)" : "var(--color-muted-foreground)",
                      }}
                    >
                      {consent.globalFaceSearch ? "Opted In" : "Opted Out"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-background/80 rounded-lg border border-border">
                    <p className="text-sm text-foreground leading-relaxed">
                      {consent.globalFaceSearch
                        ? "You are currently opted in. The system can identify you in photos and send you notifications when new photos are available."
                        : "You are currently opted out. Your face will not be identified in photos and you won't receive notifications."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <CardTitle>Privacy & Consent Preferences</CardTitle>
                      <CardDescription>Control how your data is used for photo discovery</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PrivacyConsentForm
                    consent={consent}
                    onChange={handleConsentChange}
                    disabled={isSaving}
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

                  <Button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                    size="lg"
                  >
                    {isSaving ? "Saving..." : "Save Privacy Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

        </div>
      </main>
    </>
  )
}
