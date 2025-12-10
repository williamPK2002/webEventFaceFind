"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Images } from "lucide-react"

interface EventListProps {
  events: string[]
  photoCounts: number[]
  onEventClick: (eventName: string) => void
}

export function EventList({ events, photoCounts, onEventClick }: EventListProps) {
  return (
    <div className="grid gap-4">
      {events.map((event, index) => (
        <Card key={event} className="border border-border hover:border-primary/50 transition-colors">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{event}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Images className="w-4 h-4" />
                  {photoCounts[index]} photos
                </p>
              </div>
            </div>
            <Button onClick={() => onEventClick(event)} variant="outline" className="border-border">
              View Photos
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
