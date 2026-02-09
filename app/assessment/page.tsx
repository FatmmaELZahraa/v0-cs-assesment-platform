// "use client"

// import { useSearchParams, useRouter } from "next/navigation"
// import { useState, useEffect, Suspense } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
// import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Play } from "lucide-react"
// import { CodeEditor } from "@/components/code-editor"
// // Make sure this path is correct for your project structure
// import { executeCode } from "@/assesment/src/services/execution.service"



// type QuestionType = "mcq" | "open-ended" | "code"

// interface Question {
//   id: number
//   type: QuestionType
//   title: string
//   description: string
//   options?: string[]
//   starterCode?: string
//   language?: string
//   testCases?: { input: string; expectedOutput: string }[]
// }

// function AssessmentContent() {
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const track = searchParams.get("track") || "frontend"
//   const level = searchParams.get("level") || "mid"

//   // ------------------------------------------------------------------
//   // 1. ALL HOOKS MUST BE DECLARED HERE (Before any return statements)
//   // ------------------------------------------------------------------
//   const [questions, setQuestions] = useState<Question[]>([])
//   const [loading, setLoading] = useState(true)
//   const [currentQuestion, setCurrentQuestion] = useState(0)
//   const [answers, setAnswers] = useState<Record<number, string>>({})
//   const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes
  
//   // State for Code Execution
//   const [isRunning, setIsRunning] = useState(false)
//   const [testResults, setTestResults] = useState<{passed: boolean, input: string, output: string, expected: string}[]>([])
//   const [executionError, setExecutionError] = useState("")

//   // Hook: Fetch Questions
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         setLoading(true)
//         console.log(`Fetching questions for ${track} - ${level}...`)
        
//         const response = await fetch(`http://localhost:5000/assessment/generate?track=${track}&level=${level}`)
        
//         if (!response.ok) throw new Error(`Server Error: ${response.status}`)
        
//         const data = await response.json()
//         console.log("Full Data from NestJS:", data)

//         // Handle nested structure { assessment: { ... } }
//         const assessment = data.assessment || {}
//         const mcqs = assessment.mcqs || []
//         const openEnded = assessment.openEnded || []
//         // Handle 'coding' (backend) vs 'code' (frontend) mismatch
//         const codingChallenges = assessment.coding || assessment.code || []

//         const formattedQuestions: Question[] = [
//           ...mcqs.map((q: any, i: number) => ({
//             id: i + 1,
//             type: "mcq" as QuestionType,
//             title: "Technical MCQ",
//             description: q.question,
//             options: q.options
//           })),
//           ...openEnded.map((q: any, i: number) => ({
//             id: i + 10,
//             type: "open-ended" as QuestionType,
//             title: "Theoretical Question",
//             description: q.question
//           })),
//           ...codingChallenges.map((q: any, i: number) => ({
//             id: i + 20,
//             type: "code" as QuestionType,
//             title: q.title || "Coding Challenge",
//             description: q.problem || q.description,
//             starterCode: q.starterCode || q.starter_code,
//             language: "python", // Defaulting to Python based on your backend response
//             // Add default test cases if backend doesn't send them
//             testCases: q.testCases || [
//               { input: "1", expectedOutput: "Test Case 1" },
//               { input: "2", expectedOutput: "Test Case 2" }
//             ]
//           }))
//         ]

//         setQuestions(formattedQuestions)
//       } catch (error) {
//         console.error("Failed to load questions", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchQuestions()
//   }, [track, level])

//   // Hook: Timer
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeRemaining((prev) => {
//         if (prev <= 0) {
//           clearInterval(timer)
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [])

//   // ------------------------------------------------------------------
//   // 2. HELPER FUNCTIONS
//   // ------------------------------------------------------------------

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
//   }

//   const handleAnswer = (value: string) => {
//     if (!questions[currentQuestion]) return
//     setAnswers((prev) => ({ ...prev, [questions[currentQuestion].id]: value }))
//   }

//   const handleNext = () => {
//     if (currentQuestion < questions.length - 1) {
//       setCurrentQuestion((prev) => prev + 1)
//       // Reset code execution state when changing questions
//       setTestResults([])
//       setExecutionError("")
//     }
//   }

//   const handlePrevious = () => {
//     if (currentQuestion > 0) {
//       setCurrentQuestion((prev) => prev - 1)
//       setTestResults([])
//       setExecutionError("")
//     }
//   }

//   const handleSubmit = () => {
//     router.push("/results")
//   }

//   const handleRunCode = async () => {
//     const activeQuestion = questions[currentQuestion]
//     const codeToExecute = answers[activeQuestion.id] || activeQuestion.starterCode
    
//     // Safety check
//     if (!activeQuestion.testCases || !codeToExecute) return

//     setIsRunning(true)
//     setTestResults([])
//     setExecutionError("")
    
//     const results = []

//     try {
//       for (const tc of activeQuestion.testCases) {
//         // Run code against the API
//         // Note: Make sure executeCode points to your Next.js API route or handles the request correctly
//         const result = await executeCode(codeToExecute, 71, tc.input) // 71 is Python, 63 is JS
        
//         const actualOutput = result.stdout ? atob(result.stdout).trim() : ""
//         const expectedOutput = tc.expectedOutput.trim()

//         results.push({
//           input: tc.input,
//           output: actualOutput,
//           expected: expectedOutput,
//           passed: actualOutput === expectedOutput
//         })
//       }
//       setTestResults(results)
//     } catch (error) {
//       console.error("Execution error:", error)
//       setExecutionError("Failed to execute code. Check your API connection.")
//     } finally {
//       setIsRunning(false)
//     }
//   }

//   const getQuestionTypeBadge = (type: QuestionType) => {
//     const variants: Record<QuestionType, { label: string; className: string }> = {
//       mcq: { label: "Multiple Choice", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
//       "open-ended": { label: "Open Ended", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
//       code: { label: "Code Challenge", className: "bg-teal-500/20 text-teal-400 border-teal-500/30" }
//     }
//     return variants[type]
//   }

//   // ------------------------------------------------------------------
//   // 3. RENDER LOGIC
//   // ------------------------------------------------------------------

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div>
//         <p className="text-teal-400 font-mono">Generating Assessment...</p>
//       </div>
//     )
//   }

//   if (questions.length === 0) return <div className="p-8 text-center">No questions found. Please check backend connection.</div>

//   const question = questions[currentQuestion]
//   const progress = ((currentQuestion + 1) / questions.length) * 100
//   const answeredCount = Object.keys(answers).length
//   const badge = getQuestionTypeBadge(question.type)

//   return (
//     <main className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
//         <div className="max-w-6xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <h1 className="text-xl font-semibold text-foreground">Technical Assessment</h1>
//               <Badge variant="outline" className="capitalize">
//                 {track.replace("-", " ")} - {level}
//               </Badge>
//             </div>
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-2 text-muted-foreground">
//                 <CheckCircle2 className="h-4 w-4 text-teal-500" />
//                 <span className="text-sm">{answeredCount}/{questions.length} answered</span>
//               </div>
//               <div className="flex items-center gap-2 text-muted-foreground">
//                 <Clock className="h-4 w-4" />
//                 <span className="text-sm font-mono">{formatTime(timeRemaining)}</span>
//               </div>
//             </div>
//           </div>
//           <div className="mt-4">
//             <Progress value={progress} className="h-2" />
//           </div>
//         </div>
//       </header>

//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex gap-6">
//           {/* Sidebar Navigation */}
//           <aside className="w-64 shrink-0 hidden md:block">
//             <Card className="sticky top-32">
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-3 gap-2">
//                   {questions.map((q, index) => (
//                     <button
//                       key={q.id}
//                       onClick={() => setCurrentQuestion(index)}
//                       className={`
//                         h-10 w-full rounded-md text-sm font-medium transition-colors
//                         ${currentQuestion === index 
//                           ? "bg-teal-500 text-black" 
//                           : answers[q.id] 
//                             ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" 
//                             : "bg-muted text-muted-foreground hover:bg-muted/80"
//                         }
//                       `}
//                     >
//                       {index + 1}
//                     </button>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </aside>

//           {/* Main Question Area */}
//           <div className="flex-1 min-w-0">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <Badge variant="outline" className={badge.className}>
//                     {badge.label}
//                   </Badge>
//                   <span className="text-sm text-muted-foreground">
//                     Question {currentQuestion + 1} of {questions.length}
//                   </span>
//                 </div>
//                 <CardTitle className="text-xl mt-3">{question.title}</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <p className="text-muted-foreground whitespace-pre-wrap">{question.description}</p>

//                 {/* MCQ Options */}
//                 {question.type === "mcq" && question.options && (
//                   <RadioGroup
//                     value={answers[question.id] || ""}
//                     onValueChange={handleAnswer}
//                     className="space-y-3"
//                   >
//                     {question.options.map((option, index) => (
//                       <div
//                         key={index}
//                         onClick={() => handleAnswer(option)}
//                         className={`
//                           flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors
//                           ${answers[question.id] === option 
//                             ? "border-teal-500 bg-teal-500/10" 
//                             : "border-border hover:border-teal-500/50 hover:bg-muted/50"
//                           }
//                         `}
//                       >
//                         <RadioGroupItem value={option} id={`option-${index}`} />
//                         <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
//                           {option}
//                         </Label>
//                       </div>
//                     ))}
//                   </RadioGroup>
//                 )}

//                 {/* Open-ended Text Area */}
//                 {question.type === "open-ended" && (
//                   <div className="space-y-2">
//                     <Label htmlFor="answer" className="text-muted-foreground">Your Answer</Label>
//                     <Textarea
//                       id="answer"
//                       placeholder="Type your answer here..."
//                       value={answers[question.id] || ""}
//                       onChange={(e) => handleAnswer(e.target.value)}
//                       className="min-h-[200px] resize-y"
//                     />
//                     <p className="text-xs text-muted-foreground text-right">
//                       {(answers[question.id] || "").length} characters
//                     </p>
//                   </div>
//                 )}

//                 {/* Code Editor */}
//                 {question.type === "code" && (
//                   <div className="space-y-4">
//                     <CodeEditor
//                       value={answers[question.id] || question.starterCode || ""}
//                       onChange={handleAnswer}
//                       language={question.language || "python"}
//                     />
                    
//                     {/* Run Code Toolbar */}
//                     <div className="flex justify-end border-t border-border pt-4">
//                        <Button 
//                         onClick={handleRunCode} 
//                         disabled={isRunning}
//                         className="bg-teal-500 hover:bg-teal-600 text-black font-medium"
//                       >
//                         {isRunning ? (
//                           <>
//                             <Clock className="mr-2 h-4 w-4 animate-spin" />
//                             Running...
//                           </>
//                         ) : (
//                           <>
//                             <Play className="mr-2 h-4 w-4 fill-current" />
//                             Run Code
//                           </>
//                         )}
//                       </Button>
//                     </div>

//                     {/* Execution Results */}
//                     {(executionError || testResults.length > 0) && (
//                       <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
//                         <Label className="text-muted-foreground">Test Results</Label>
                        
//                         {executionError && (
//                           <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 text-sm font-mono">
//                            {executionError}
//                           </div>
//                         )}

//                         <div className="space-y-2">
//                           {testResults.map((res, idx) => (
//                             <div 
//                               key={idx} 
//                               className={`
//                                 flex flex-col gap-2 text-sm font-mono rounded-lg p-3 border
//                                 ${res.passed 
//                                   ? "bg-teal-500/10 border-teal-500/30" 
//                                   : "bg-red-500/10 border-red-500/30"
//                                 }
//                               `}
//                             >
//                               <div className="flex items-center justify-between">
//                                 <span className="text-muted-foreground">Test Case {idx + 1}</span>
//                                 <Badge variant="outline" className={res.passed ? "border-teal-500 text-teal-400" : "border-red-500 text-red-400"}>
//                                   {res.passed ? "Passed" : "Failed"}
//                                 </Badge>
//                               </div>
//                               <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 mt-2">
//                                 <span className="text-muted-foreground">Input:</span>
//                                 <span className="text-foreground">{res.input}</span>
//                                 <span className="text-muted-foreground">Expected:</span>
//                                 <span className="text-teal-400">{res.expected}</span>
//                                 {!res.passed && (
//                                   <>
//                                     <span className="text-muted-foreground">Actual:</span>
//                                     <span className="text-red-400">{res.output}</span>
//                                   </>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Navigation Buttons */}
//                 <div className="flex items-center justify-between pt-6 border-t border-border">
//                   <Button
//                     variant="outline"
//                     onClick={handlePrevious}
//                     disabled={currentQuestion === 0}
//                     className="bg-transparent"
//                   >
//                     <ChevronLeft className="h-4 w-4 mr-2" />
//                     Previous
//                   </Button>
                  
//                   {currentQuestion === questions.length - 1 ? (
//                     <Button
//                       onClick={handleSubmit}
//                       className="bg-teal-500 hover:bg-teal-600 text-black"
//                     >
//                       Submit Assessment
//                     </Button>
//                   ) : (
//                     <Button
//                       onClick={handleNext}
//                       className="bg-teal-500 hover:bg-teal-600 text-black"
//                     >
//                       Next
//                       <ChevronRight className="h-4 w-4 ml-2" />
//                     </Button>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }

// export default function AssessmentPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="text-muted-foreground">Loading assessment...</div>
//       </div>
//     }>
//       <AssessmentContent />
//     </Suspense>
//   )
// }



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
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Play } from "lucide-react"
import { CodeEditor } from "@/components/code-editor"
// Ensure this path matches your project structure exactly
import { executeCode } from "@/assesment/src/services/execution.service"

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

function AssessmentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const track = searchParams.get("track") || "frontend"
  const level = searchParams.get("level") || "mid"

  // ------------------------------------------------------------------
  // 1. STATE HOOKS
  // ------------------------------------------------------------------
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(60 * 60) // 60 minutes
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<{passed: boolean, input: string, output: string, expected: string}[]>([])
  const [executionError, setExecutionError] = useState("")

  // ------------------------------------------------------------------
  // 2. EFFECT HOOKS
  // ------------------------------------------------------------------
  
  // Fetch Questions
 // Hook 1: Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        // Fetch from your NestJS backend
        const response = await fetch(`http://localhost:5000/assessment/generate?track=${track}&level=${level}`)
        
        if (!response.ok) throw new Error(`Server Error: ${response.status}`)
        
        const data = await response.json()
        const assessment = data.assessment || {}
        
        // 1. Gather raw data
        const rawMcqs = assessment.mcqs || []
        const rawOpen = assessment.openEnded || []
        const rawCode = assessment.code || assessment.coding || [] // Handle both key names

        // 2. Merge data
        const combinedData = [
          ...rawMcqs.map((q: any) => ({ ...q, _type: 'mcq' })),
          ...rawOpen.map((q: any) => ({ ...q, _type: 'open-ended' })),
          ...rawCode.map((q: any) => ({ ...q, _type: 'code' }))
        ]

        // 3. Map to Question interface
        const formattedQuestions: Question[] = combinedData.map((q: any, index: number) => {
          const type = q._type as QuestionType
          
          let title = "Question"
          if (type === 'mcq') title = "Technical MCQ"
          else if (type === 'open-ended') title = "Theoretical Question"
          else if (type === 'code') title = q.title || "Coding Challenge"

          return {
       id: index + 1,
    type: type,
    title: title,
    description: q.question || q.problem || q.description || "",
    options: q.options,
    starterCode: q.starterCode || q.starter_code,
    language: "python",
    
    // 👇 UPDATE THIS SECTION 👇
    // If API gives test cases, use them.
    // If NOT, provide a generic "Dummy" case so the code can still run.
    testCases: (q.testCases && q.testCases.length > 0) 
      ? q.testCases 
      : [
          { 
            input: "", // Empty input (works for simple print scripts)
            expectedOutput: "Your Output Here" // Placeholder
          }
        ]
          }
        })

        setQuestions(formattedQuestions)
      } catch (error) {
        console.error("Failed to load questions", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [track, level])
  // Timer
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

  // ------------------------------------------------------------------
  // 3. HELPER FUNCTIONS
  // ------------------------------------------------------------------

  // This was missing in the previous code
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (value: string) => {
    if (!questions[currentQuestion]) return
    setAnswers((prev) => ({ ...prev, [questions[currentQuestion].id]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setTestResults([])
      setExecutionError("")
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setTestResults([])
      setExecutionError("")
    }
  }

  const handleSubmit = () => {
    router.push("/results")
  }

  // const handleRunCode = async () => {
  //   const activeQuestion = questions[currentQuestion]
  //   if (!activeQuestion) return
    
  //   const codeToExecute = answers[activeQuestion.id] || activeQuestion.starterCode
  //   if (!activeQuestion.testCases || !codeToExecute) return

  //   setIsRunning(true)
  //   setTestResults([])
  //   setExecutionError("")
    
  //   const results = []

  //   try {
  //     for (const tc of activeQuestion.testCases) {
  //       // Run code (71 = Python, 63 = JS)
  //       const result = await executeCode(codeToExecute, 71, tc.input) 
        
  //       const actualOutput = result.stdout ? atob(result.stdout).trim() : ""
  //       const expectedOutput = tc.expectedOutput.trim()

  //       results.push({
  //         input: tc.input,
  //         output: actualOutput,
  //         expected: expectedOutput,
  //         passed: actualOutput === expectedOutput
  //       })
  //     }
  //     setTestResults(results)
  //   } catch (error) {
  //     console.error(error)
  //     setExecutionError("Execution failed. Check connection.")
  //   } finally {
  //     setIsRunning(false)
  //   }
  // }
  const handleRunCode = async () => {
    console.log("▶️ Run Code Clicked");

    const activeQuestion = questions[currentQuestion];
    
    // 1. Check Question
    if (!activeQuestion) {
      console.error("❌ No active question found");
      return;
    }

    // 2. Check Code
    const codeToExecute = answers[activeQuestion.id] || activeQuestion.starterCode;
    console.log("📝 Code to execute:", codeToExecute ? "Found" : "Missing");
    
    if (!codeToExecute) {
      setExecutionError("Please write some code first.");
      return;
    }

    // 3. Check Test Cases (The most common cause of failure)
    console.log("🧪 Test Cases:", activeQuestion.testCases);
    
    if (!activeQuestion.testCases || activeQuestion.testCases.length === 0) {
      console.error("❌ No test cases found for this question.");
      setExecutionError("No test cases available for this question. Try regenerating the assessment.");
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    setExecutionError("");
    
    const results = [];

    try {
      console.log("🚀 Starting Execution...");
      for (const tc of activeQuestion.testCases) {
        console.log(`Running test case: Input='${tc.input}'`);
        
        // Ensure executeCode is imported correctly!
        // 71 is Python, 63 is JS
        const result = await executeCode(codeToExecute, 71, tc.input); 
        console.log("Raw API Result:", result);

        // Handle stderr (Runtime Errors)
        if (result.stderr) {
            const errorText = atob(result.stderr);
            throw new Error(`Runtime Error: ${errorText}`);
        }
        
        // Handle compile_output (Syntax Errors)
        if (result.compile_output) {
             const compileError = atob(result.compile_output);
             throw new Error(`Compilation Error: ${compileError}`);
        }

        const actualOutput = result.stdout ? atob(result.stdout).trim() : "";
        const expectedOutput = tc.expectedOutput ? tc.expectedOutput.trim() : "";

        results.push({
          input: tc.input,
          output: actualOutput,
          expected: expectedOutput,
          passed: actualOutput === expectedOutput
        });
      }
      
      console.log("✅ Execution Complete. Results:", results);
      setTestResults(results);

    } catch (error: any) {
      console.error("💥 Execution Failed:", error);
      setExecutionError(error.message || "Execution failed. Check connection.");
    } finally {
      setIsRunning(false);
    }
  };

  const getBadgeStyle = (type: QuestionType) => {
    switch (type) {
      case 'mcq': return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case 'open-ended': return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case 'code': return "bg-teal-500/20 text-teal-400 border-teal-500/30"
      default: return ""
    }
  }

  const getBadgeLabel = (type: QuestionType) => {
    switch (type) {
      case 'mcq': return "Multiple Choice"
      case 'open-ended': return "Open Ended"
      case 'code': return "Code Challenge"
      default: return "Question"
    }
  }

  // ------------------------------------------------------------------
  // 4. RENDER
  // ------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div>
        <p className="text-teal-400 font-mono">Generating Assessment...</p>
      </div>
    )
  }

  if (questions.length === 0) return <div className="p-10 text-center">No questions loaded.</div>

  const question = questions[currentQuestion]
  if (!question) return <div className="p-10 text-center text-red-500">Error: Question not found.</div>

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <main className="min-h-screen bg-background">
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
                <span className="text-sm">{answeredCount}/{questions.length} answered</span>
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
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden md:block">
            <Card className="sticky top-32">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {questions.map((q, index) => (
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
              </CardContent>
            </Card>
          </aside>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getBadgeStyle(question.type)}>
                    {getBadgeLabel(question.type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <CardTitle className="text-xl mt-3">{question.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground whitespace-pre-wrap">{question.description}</p>

                {/* MCQ */}
                {question.type === "mcq" && question.options && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                  >
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className={`
                          flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors
                          ${answers[question.id] === option 
                            ? "border-teal-500 bg-teal-500/10" 
                            : "border-border hover:border-teal-500/50 hover:bg-muted/50"
                          }
                        `}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Open Ended */}
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
                    <p className="text-xs text-muted-foreground text-right">
                      {(answers[question.id] || "").length} characters
                    </p>
                  </div>
                )}

                {/* Code */}
                {question.type === "code" && (
                  <div className="space-y-4">
                    <CodeEditor
                      value={answers[question.id] || question.starterCode || ""}
                      onChange={handleAnswer}
                      language={question.language || "python"}
                    />
                    <div className="flex justify-end border-t border-border pt-4">
                       <Button 
                        onClick={handleRunCode} 
                        disabled={isRunning}
                        className="bg-teal-500 hover:bg-teal-600 text-black font-medium"
                      >
                        {isRunning ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4 fill-current" />
                            Run Code
                          </>
                        )}
                      </Button>
                    </div>

                    {(executionError || testResults.length > 0) && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <Label className="text-muted-foreground">Test Results</Label>
                        {executionError && (
                          <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 text-sm font-mono">
                           {executionError}
                          </div>
                        )}
                        <div className="space-y-2">
                          {testResults.map((res, idx) => (
                            <div key={idx} className={`flex flex-col gap-2 text-sm font-mono rounded-lg p-3 border ${res.passed ? "bg-teal-500/10 border-teal-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Test Case {idx + 1}</span>
                                <Badge variant="outline" className={res.passed ? "border-teal-500 text-teal-400" : "border-red-500 text-red-400"}>
                                  {res.passed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 mt-2">
                                <span className="text-muted-foreground">Input:</span>
                                <span className="text-foreground">{res.input}</span>
                                <span className="text-muted-foreground">Expected:</span>
                                <span className="text-teal-400">{res.expected}</span>
                                {!res.passed && (
                                  <>
                                    <span className="text-muted-foreground">Actual:</span>
                                    <span className="text-red-400">{res.output}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Navigation */}
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
                  
                  {currentQuestion === questions.length - 1 ? (
                    <Button onClick={handleSubmit} className="bg-teal-500 hover:bg-teal-600 text-black">
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="bg-teal-500 hover:bg-teal-600 text-black">
                      Next <ChevronRight className="h-4 w-4 ml-2" />
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
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentContent />
    </Suspense>
  )
}