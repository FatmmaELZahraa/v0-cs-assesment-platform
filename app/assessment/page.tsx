"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"

type QuestionType = "mcq" | "open-ended" | "code"

interface Question {
  id: number
  type: QuestionType
  title: string
  description: string
  options?: string[]
  starterCode?: string
  language?: string
  testCases?: { input: string; expectedOutput: string }[]
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    type: "mcq",
    title: "React Component Lifecycle",
    description: "Which hook is used to perform side effects in a functional React component?",
    options: [
      "useState",
      "useEffect",
      "useContext",
      "useReducer"
    ]
  },
  {
    id: 2,
    type: "mcq",
    title: "JavaScript Closures",
    description: "What will be the output of the following code?\n\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  }\n}\nconst fn = outer();\nconsole.log(fn());\nconsole.log(fn());",
    options: [
      "1, 1",
      "1, 2",
      "0, 1",
      "undefined, undefined"
    ]
  },
  {
    id: 3,
    type: "open-ended",
    title: "System Design",
    description: "Explain how you would design a real-time notification system for a social media application. Consider scalability, message delivery guarantees, and user experience."
  },
  {
    id: 4,
    type: "open-ended",
    title: "Problem Solving Approach",
    description: "Describe your approach to debugging a performance issue in a web application where the page load time has suddenly increased from 2 seconds to 10 seconds."
  },
  {
    id: 5,
    type: "code",
    title: "Array Manipulation",
    description: "Write a function that takes an array of integers and returns a new array containing only the unique elements, preserving the original order of first occurrence.",
    starterCode: `function getUniqueElements(arr) {
  // Your code here
  
}

// Test cases:
// getUniqueElements([1, 2, 2, 3, 4, 4, 5]) => [1, 2, 3, 4, 5]
// getUniqueElements([1, 1, 1, 1]) => [1]
// getUniqueElements([]) => []`,
    language: "javascript",
    testCases: [
      { input: "[1, 2, 2, 3, 4, 4, 5]", expectedOutput: "[1, 2, 3, 4, 5]" },
      { input: "[1, 1, 1, 1]", expectedOutput: "[1]" },
      { input: "[]", expectedOutput: "[]" }
    ]
  },
  {
    id: 6,
    type: "code",
    title: "String Processing",
    description: "Implement a function that checks if a string is a valid palindrome, considering only alphanumeric characters and ignoring case.",
    starterCode: `function isPalindrome(str) {
  // Your code here
  
}

// Test cases:
// isPalindrome("A man, a plan, a canal: Panama") => true
// isPalindrome("race a car") => false
// isPalindrome(" ") => true`,
    language: "javascript",
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: "true" },
      { input: '"race a car"', expectedOutput: "false" },
      { input: '" "', expectedOutput: "true" }
    ]
  }
]

function AssessmentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const track = searchParams.get("track") || "frontend"
  const level = searchParams.get("level") || "mid"

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes

  const question = sampleQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100
  const answeredCount = Object.keys(answers).length

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    router.push("/results")
  }

  const getQuestionTypeBadge = (type: QuestionType) => {
    const variants: Record<QuestionType, { label: string; className: string }> = {
      mcq: { label: "Multiple Choice", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      "open-ended": { label: "Open Ended", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      code: { label: "Code Challenge", className: "bg-teal-500/20 text-teal-400 border-teal-500/30" }
    }
    return variants[type]
  }

  const badge = getQuestionTypeBadge(question.type)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground">Technical Assessment</h1>
              <Badge variant="outline" className="capitalize">
                {track.replace("-", " ")} - {level}
              </Badge>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <span className="text-sm">{answeredCount}/{sampleQuestions.length} answered</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Question Navigation Sidebar */}
          <aside className="w-64 shrink-0">
            <Card className="sticky top-32">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {sampleQuestions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`
                        h-10 w-full rounded-md text-sm font-medium transition-colors
                        ${currentQuestion === index 
                          ? "bg-teal-500 text-black" 
                          : answers[q.id] 
                            ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-teal-500" />
                      <span className="text-muted-foreground">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-teal-500/20 border border-teal-500/30" />
                      <span className="text-muted-foreground">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-muted" />
                      <span className="text-muted-foreground">Unanswered</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Question Area */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={badge.className}>
                    {badge.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {sampleQuestions.length}
                  </span>
                </div>
                <CardTitle className="text-xl mt-3">{question.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground whitespace-pre-wrap">{question.description}</p>

                {/* MCQ Options */}
                {question.type === "mcq" && question.options && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`
                          flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors
                          ${answers[question.id] === option 
                            ? "border-teal-500 bg-teal-500/10" 
                            : "border-border hover:border-teal-500/50 hover:bg-muted/50"
                          }
                        `}
                        onClick={() => handleAnswer(option)}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Open-ended Text Area */}
                {question.type === "open-ended" && (
                  <div className="space-y-2">
                    <Label htmlFor="answer" className="text-muted-foreground">Your Answer</Label>
                    <Textarea
                      id="answer"
                      placeholder="Type your answer here..."
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="min-h-[200px] resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(answers[question.id] || "").length} characters
                    </p>
                  </div>
                )}

                {/* Code Editor */}
                {question.type === "code" && (
                  <div className="space-y-4">
                    <CodeEditor
                      value={answers[question.id] || question.starterCode || ""}
                      onChange={handleAnswer}
                      language={question.language || "javascript"}
                    />
                    {question.testCases && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Test Cases</Label>
                        <div className="space-y-2">
                          {question.testCases.map((tc, index) => (
                            <div key={index} className="flex items-center gap-4 text-sm font-mono bg-muted/50 rounded-lg p-3">
                              <span className="text-muted-foreground">Input:</span>
                              <span className="text-foreground">{tc.input}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-teal-400">{tc.expectedOutput}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentQuestion === sampleQuestions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      className="bg-teal-500 hover:bg-teal-600 text-black"
                    >
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-teal-500 hover:bg-teal-600 text-black"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading assessment...</div>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}
