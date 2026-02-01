"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, Sparkles, Home, RotateCcw, Download } from "lucide-react"

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [showScore, setShowScore] = useState(false)
  const [scoreValue, setScoreValue] = useState(0)
  const [showCongrats, setShowCongrats] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const finalScore = 85
  const totalQuestions = 6
  const correctAnswers = 5

  // Play celebration sound using Web Audio API
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Play a series of ascending notes for celebration
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = freq
        oscillator.type = "sine"
        
        const startTime = audioContext.currentTime + index * 0.15
        const duration = 0.3
        
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      })

      // Final chord
      setTimeout(() => {
        const chordFreqs = [523.25, 659.25, 783.99]
        chordFreqs.forEach(freq => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = freq
          oscillator.type = "sine"
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
          
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 1)
        })
      }, 600)
    } catch {
      // Audio not supported, continue silently
    }
  }

  // Create confetti particles
  const createParticles = () => {
    const colors = ["#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6", "#22c55e"]
    const newParticles: Particle[] = []
    
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      })
    }
    setParticles(newParticles)
  }

  // Animate confetti
  useEffect(() => {
    if (particles.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationId: number
    let localParticles = [...particles]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      localParticles = localParticles.filter(p => p.y < canvas.height + 50)
      
      localParticles.forEach(particle => {
        particle.y += particle.speedY
        particle.x += particle.speedX
        particle.rotation += particle.rotationSpeed
        particle.speedY += 0.05 // gravity

        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 2)
        ctx.restore()
      })

      if (localParticles.length > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [particles])

  // Animation sequence
  useEffect(() => {
    // Start the celebration
    const timer1 = setTimeout(() => {
      setShowScore(true)
      playSuccessSound()
    }, 500)

    // Animate score counting up
    const timer2 = setTimeout(() => {
      let current = 0
      const increment = finalScore / 50
      const interval = setInterval(() => {
        current += increment
        if (current >= finalScore) {
          setScoreValue(finalScore)
          clearInterval(interval)
        } else {
          setScoreValue(Math.floor(current))
        }
      }, 30)
    }, 800)

    // Show congratulations
    const timer3 = setTimeout(() => {
      setShowCongrats(true)
      createParticles()
    }, 2500)

    // Show details
    const timer4 = setTimeout(() => {
      setShowDetails(true)
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
      />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Score Display */}
          <div
            className={`text-center transition-all duration-1000 ${
              showScore ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Trophy Icon */}
            <div className="relative inline-block mb-6">
              <div className={`transition-all duration-700 ${showScore ? "scale-100" : "scale-0"}`}>
                <div className="relative">
                  <Trophy className="h-24 w-24 text-amber-400 mx-auto animate-bounce" />
                  <Sparkles className="h-8 w-8 text-amber-300 absolute -top-2 -right-2 animate-ping" />
                  <Star className="h-6 w-6 text-amber-300 absolute -bottom-1 -left-2 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Score Circle */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="text-teal-500 transition-all duration-2000"
                  style={{
                    strokeDasharray: 553,
                    strokeDashoffset: 553 - (553 * scoreValue) / 100
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-foreground">{scoreValue}</span>
                <span className="text-xl text-muted-foreground">/ 100</span>
              </div>
            </div>
          </div>

          {/* Congratulations Message */}
          <div
            className={`text-center transition-all duration-1000 ${
              showCongrats ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
            }`}
          >
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Congratulations!
            </h1>
            <p className="text-xl text-muted-foreground">
              You have successfully completed the assessment
            </p>
          </div>

          {/* Details Card */}
          <Card
            className={`transition-all duration-1000 ${
              showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-teal-500">{correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-amber-400">A</p>
                  <p className="text-sm text-muted-foreground">Grade</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Performance Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Multiple Choice</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
                      </div>
                      <span className="text-sm text-muted-foreground">2/2</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Open-Ended</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "75%" }} />
                      </div>
                      <span className="text-sm text-muted-foreground">1.5/2</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Code Challenges</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: "75%" }} />
                      </div>
                      <span className="text-sm text-muted-foreground">1.5/2</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div
            className={`flex items-center justify-center gap-4 transition-all duration-1000 ${
              showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="bg-transparent"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/assessment")}
              className="bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-black">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
