"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const tracks = [
  { value: "frontend", label: "Frontend Development" },
  { value: "backend", label: "Backend Development" },
  { value: "fullstack", label: "Full Stack Development" },
  { value: "mobile", label: "Mobile Development" },
  { value: "devops", label: "DevOps & Cloud" },
  { value: "data", label: "Data Engineering" },
]

const levels = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-Level (2-5 years)" },
  { value: "senior", label: "Senior (5-8 years)" },
  { value: "lead", label: "Lead / Staff (8+ years)" },
]

export default function Home() {
  const router = useRouter()
  const [track, setTrack] = useState("")
  const [level, setLevel] = useState("")

  const handleStart = () => {
    if (track && level) {
      router.push(`/assessment?track=${track}&level=${level}`)
    }
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/20 via-background to-background" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">
              Welcome to <span className="text-teal-500">Technical Assessment</span>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Please select your track and experience level to begin the assessment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="track" className="text-foreground">Track</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger id="track" className="w-full">
                  <SelectValue placeholder="Select your track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-foreground">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level" className="w-full">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 text-black font-semibold py-5"
              onClick={handleStart}
              disabled={!track || !level}
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-sm text-muted-foreground">
          Your progress will be saved automatically
        </p>
      </div>
    </main>
  )
}
