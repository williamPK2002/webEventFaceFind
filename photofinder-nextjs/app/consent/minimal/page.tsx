"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function MinimalConsentPage() {
  const router = useRouter()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Limited Access Mode</CardTitle>
              <CardDescription>You have opted out of AI face search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3 p-4 bg-muted/50 border border-border/30 rounded-lg">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-semibold text-foreground">You will still have access to:</p>
                  <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                    <li>Browse events in the university calendar</li>
                    <li>View public photo galleries from events (if available)</li>
                    <li>Manually search for photos by event name</li>
                    <li>Change your preferences anytime</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Face search features will not be available. If you change your mind, you can update your preferences
                  in account settings.
                </p>
              </div>

              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
