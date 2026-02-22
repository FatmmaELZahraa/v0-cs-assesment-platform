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
// // Make sure this path matches your project structure
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

// const LANGUAGE_OPTIONS = [
//   { id: 71, name: "Python (3.8.1)", value: "python" },
//   { id: 63, name: "JavaScript (Node.js 12.14)", value: "javascript" },
//   { id: 54, name: "C++ (GCC 9.2.0)", value: "cpp" },
//   { id: 62, name: "Java (OpenJDK 13.0.1)", value: "java" },
//   { id: 51, name: "C# (Mono 6.6.0)", value: "csharp" }
// ]

// function AssessmentContent() {
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const track = searchParams.get("track") || "frontend"
//   const level = searchParams.get("level") || "mid"

//   // ------------------------------------------------------------------
//   // 1. STATE HOOKS
//   // ------------------------------------------------------------------
//   const [questions, setQuestions] = useState<Question[]>([])
//   const [loading, setLoading] = useState(true)
//   const [currentQuestion, setCurrentQuestion] = useState(0)
//   const [answers, setAnswers] = useState<Record<number, string>>({})
  
//   const [languageMap, setLanguageMap] = useState<Record<number, number>>({})

//   const [timeRemaining, setTimeRemaining] = useState(60 * 60) 
  
//   // Execution State
//   const [isRunning, setIsRunning] = useState(false)
//   const [testResults, setTestResults] = useState<{passed: boolean, input: string, output: string, expected: string}[]>([])
//   const [executionError, setExecutionError] = useState("")

//   // ------------------------------------------------------------------
//   // 2. EFFECT HOOKS
//   // ------------------------------------------------------------------

//   useEffect(() => {
//     setTestResults([]);
//     setExecutionError("");
//   }, [currentQuestion]);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         setLoading(true)
//         const response = await fetch(`http://localhost:5000/assessment/generate?track=${track}&level=${level}`)
        
//         if (!response.ok) throw new Error(`Server Error: ${response.status}`)
        
//         const data = await response.json()
//         const assessment = data.assessment || {}
        
//         const rawMcqs = assessment.mcqs || []
//         const rawOpen = assessment.openEnded || []
//         const rawCode = assessment.code || assessment.coding || []

//         const combinedData = [
//           ...rawMcqs.map((q: any) => ({ ...q, _type: 'mcq' })),
//           ...rawOpen.map((q: any) => ({ ...q, _type: 'open-ended' })),
//           ...rawCode.map((q: any) => ({ ...q, _type: 'code' }))
//         ]

//         const formattedQuestions: Question[] = combinedData.map((q: any, index: number) => {
//           const type = q._type as QuestionType
          
//           let title = "Question"
//           if (type === 'mcq') title = "Technical MCQ"
//           else if (type === 'open-ended') title = "Theoretical Question"
//           else if (type === 'code') title = q.title || "Coding Challenge"

//           return {
//             id: index + 1,
//             type: type,
//             title: title,
//             description: q.question || q.problem || q.description || "",
//             options: q.options,
//             starterCode: q.starterCode || q.starter_code,
//             language: "python", // Default hint
//             testCases: (q.testCases && q.testCases.length > 0) 
//               ? q.testCases 
//               : [{ input: "", expectedOutput: "Your Output Here" }]
//           }
//         })

//         setQuestions(formattedQuestions)
//       } catch (error) {
//         console.error("Failed to load questions", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchQuestions()
//   }, [track, level])

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
//   // 3. HELPER FUNCTIONS
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

//   const handleLanguageChange = (questionId: number, langId: string) => {
//     setLanguageMap((prev) => ({ ...prev, [questionId]: parseInt(langId) }))
//   }

//   const handleNext = () => {
//     if (currentQuestion < questions.length - 1) {
//       setCurrentQuestion((prev) => prev + 1)
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

// const handleSubmit = async () => {
//   try {
//     // 1. تصفية الأسئلة حسب النوع لضمان الترتيب الصحيح
//     const mcqQuestions = questions.filter(q => q.type === 'mcq');
//     const openEndedQuestions = questions.filter(q => q.type === 'open-ended');
//     const codingQuestions = questions.filter(q => q.type === 'code');

//     // 2. حفظ الأسئلة الأصلية (بالإجابات النموذجية) للمقارنة في السيرفر
//     localStorage.setItem("current_assessment", JSON.stringify({
//       mcqs: mcqQuestions,
//       openEnded: openEndedQuestions,
//       coding: codingQuestions
//     }));

//     // 3. تجميع إجابات المستخدم بدقة (المشكلة كانت هنا)
//     const userAnswers = {
//       // نستخدم خارطة الأسئلة لضمان جلب الإجابة الصحيحة لكل ID
//       mcqs: mcqQuestions.map(q => answers[q.id] || ""),
//       openEnded: openEndedQuestions.map(q => answers[q.id] || ""),
//       coding: codingQuestions.map(q => answers[q.id] || q.starterCode || "")
//     };

//     // 4. حفظ إجابات المستخدم في localStorage
//     localStorage.setItem("last_assessment_answers", JSON.stringify(userAnswers));

//     console.log("✅ Data successfully prepared for evaluation:", userAnswers);

//     // 5. الانتقال لصفحة النتائج
//     router.push("/results");
//   } catch (error) {
//     console.error("❌ Error during submission:", error);
//     alert("An error occurred while saving your answers. Please try again.");
//   }
// };
//   // --- SOUND EFFECT HELPER ---
//   const playFeedbackSound = (isSuccess: boolean) => {
//     try {
//       // Ensure these files exist in public/sounds/
//       const soundPath = isSuccess ? "/sounds/sucess.mp3" : "/sounds/fail.mp3";
//       const audio = new Audio(soundPath);
//       audio.volume = 0.5;
//       audio.play().catch(err => console.warn("Audio play blocked", err));
//     } catch (e) {
//       console.error("Audio error", e);
//     }
//   };

//   const handleRunCode = async () => {
//     console.log("▶️ Run Code Clicked");

//     const activeQuestion = questions[currentQuestion];
    
//     if (!activeQuestion) {
//       console.error("❌ No active question found");
//       return;
//     }

//     const codeToExecute = answers[activeQuestion.id] || activeQuestion.starterCode;
    
//     if (!codeToExecute) {
//       setExecutionError("Please write some code first.");
//       playFeedbackSound(false); // Play fail sound if empty
//       return;
//     }

//     if (!activeQuestion.testCases || activeQuestion.testCases.length === 0) {
//       setExecutionError("No test cases available for this question.");
//       playFeedbackSound(false); 
//       return;
//     }

//     // Get selected language ID or default to Python (71)
//     const selectedLangId = languageMap[activeQuestion.id] || 71;
//     console.log(`Using Language ID: ${selectedLangId}`);

//     setIsRunning(true);
//     setTestResults([]);
//     setExecutionError("");
    
//     const results = [];

//     try {
//       for (const tc of activeQuestion.testCases) {
        
//         const result = await executeCode(codeToExecute, selectedLangId, tc.input); 
        
//         if (result.stderr) {
//             const errorText = atob(result.stderr);
//             throw new Error(`Runtime Error: ${errorText}`);
//         }
        
//         if (result.compile_output) {
//              const compileError = atob(result.compile_output);
//              throw new Error(`Compilation Error: ${compileError}`);
//         }

//         const actualRaw = result.stdout ? atob(result.stdout).trim() : "";
//         const expectedRaw = tc.expectedOutput ? tc.expectedOutput.trim() : "";

//         let passed = false;
//         try {
//           // Try parsing JSON first for array/object comparison
//           const actualParsed = JSON.parse(actualRaw);
//           const expectedParsed = JSON.parse(expectedRaw);
//           passed = JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
//         } catch {
//           // Fallback to strict string comparison
//           passed = actualRaw === expectedRaw;
//         }

//         results.push({
//           input: tc.input,
//           output: actualRaw,
//           expected: expectedRaw,
//           passed
//         });
//       }
      
//       setTestResults(results);

//       // --- CHECK ALL PASSED ---
//       const allPassed = results.length > 0 && results.every(r => r.passed);
//       playFeedbackSound(allPassed);

//     } catch (error: any) {
//       console.error("💥 Execution Failed:", error);
//       setExecutionError(error.message || "Execution failed. Check connection.");
//       playFeedbackSound(false); // Play fail sound on crash
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   const getBadgeStyle = (type: QuestionType) => {
//     switch (type) {
//       case 'mcq': return "bg-blue-500/20 text-blue-400 border-blue-500/30"
//       case 'open-ended': return "bg-purple-500/20 text-purple-400 border-purple-500/30"
//       case 'code': return "bg-teal-500/20 text-teal-400 border-teal-500/30"
//       default: return ""
//     }
//   }

//   const getBadgeLabel = (type: QuestionType) => {
//     switch (type) {
//       case 'mcq': return "Multiple Choice"
//       case 'open-ended': return "Open Ended"
//       case 'code': return "Code Challenge"
//       default: return "Question"
//     }
//   }

//   // ------------------------------------------------------------------
//   // 4. RENDER
//   // ------------------------------------------------------------------

//   if (loading) return <div className="p-10 text-center">Loading Assessment...</div>
//   if (questions.length === 0) return <div className="p-10 text-center">No questions loaded.</div>
//   const question = questions[currentQuestion]
//   if (!question) return <div className="p-10 text-center text-red-500">Error: Question not found.</div>

//   const progress = ((currentQuestion + 1) / questions.length) * 100
//   const answeredCount = Object.keys(answers).length

//   const currentLangId = languageMap[question.id] || 71;
//   const currentLangObj = LANGUAGE_OPTIONS.find(l => l.id === currentLangId);
//   const editorLanguage = currentLangObj ? currentLangObj.value : "python";

//   return (
//     <main className="min-h-screen bg-background">
//          <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
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
//           {/* Sidebar */}
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

//           {/* Main Area */}
//           <div className="flex-1 min-w-0">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <Badge variant="outline" className={getBadgeStyle(question.type)}>{getBadgeLabel(question.type)}</Badge>
//                 </div>
//                 <CardTitle className="text-xl mt-3">{question.title}</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <p className="text-muted-foreground whitespace-pre-wrap">{question.description}</p>

//                 {/* MCQ Section */}
//                 {question.type === "mcq" && question.options && (
//                    <RadioGroup value={answers[question.id] || ""} onValueChange={handleAnswer}>
//                       {question.options.map((option, idx) => (
//                         <div key={idx} className="flex items-center space-x-3 rounded-lg border p-4">
//                            <RadioGroupItem value={option} id={`opt-${idx}`} />
//                            <Label htmlFor={`opt-${idx}`}>{option}</Label>
//                         </div>
//                       ))}
//                    </RadioGroup>
//                 )}

//                 {/* Open Ended Section */}
//                 {question.type === "open-ended" && (
//                     <Textarea 
//                         value={answers[question.id] || ""} 
//                         onChange={(e) => handleAnswer(e.target.value)} 
//                         className="min-h-[200px]"
//                     />
//                 )}

//                 {/* Code Section */}
//                 {question.type === "code" && (
//                   <div className="space-y-4">
//                     {/* Language Selector Dropdown */}
//                     <div className="flex justify-end">
//                         <select 
//                             className="bg-background border border-border text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
//                             value={currentLangId}
//                             onChange={(e) => handleLanguageChange(question.id, e.target.value)}
//                         >
//                             {LANGUAGE_OPTIONS.map((lang) => (
//                                 <option key={lang.id} value={lang.id}>
//                                     {lang.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <CodeEditor
//                       value={answers[question.id] || question.starterCode || ""}
//                       onChange={handleAnswer}
//                       language={editorLanguage}
//                     />
                    
//                     <div className="flex justify-end border-t border-border pt-4">
//                        <Button 
//                         onClick={handleRunCode} 
//                         disabled={isRunning}
//                         className="bg-teal-500 hover:bg-teal-600 text-black font-medium"
//                       >
//                         {isRunning ? <><Clock className="mr-2 h-4 w-4 animate-spin"/> Running...</> : <><Play className="mr-2 h-4 w-4 fill-current"/> Run Code</>}
//                       </Button>
//                     </div>

//                     {/* Test Results Display */}
//                     {(executionError || testResults.length > 0) && (
//                       <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
//                         <Label className="text-muted-foreground">Test Results</Label>
//                         {executionError && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm font-mono border border-red-500/50">{executionError}</div>}
//                         <div className="space-y-2">
//                             {testResults.map((res, idx) => (
//                                 <div key={idx} className={`text-sm font-mono rounded-lg p-3 border ${res.passed ? "bg-teal-500/10 border-teal-500/30" : "bg-red-500/10 border-red-500/30"}`}>
//                                     <div className="flex justify-between mb-2">
//                                         <span>Test Case {idx + 1}</span>
//                                         <Badge variant="outline" className={res.passed ? "text-teal-400 border-teal-500" : "text-red-400 border-red-500"}>{res.passed ? "Passed" : "Failed"}</Badge>
//                                     </div>
//                                     <div>Input: {res.input}</div>
//                                     <div className="text-teal-400">Exp: {res.expected}</div>
//                                     {!res.passed && <div className="text-red-400">Act: {res.output}</div>}
//                                 </div>
//                             ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Footer Navigation */}
//                 <div className="flex items-center justify-between pt-6 border-t border-border">
//                     <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}><ChevronLeft className="mr-2 h-4 w-4"/> Previous</Button>
//                     {currentQuestion === questions.length - 1 ? 
//                         <Button onClick={handleSubmit} className="bg-teal-500 text-black">Submit</Button> : 
//                         <Button onClick={handleNext} className="bg-teal-500 text-black">Next <ChevronRight className="ml-2 h-4 w-4"/></Button>
//                     }
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
//     <Suspense fallback={<div>Loading...</div>}>
//       <AssessmentContent />
//     </Suspense>
//   )
// }



//It Works !!!!!!!!!!!!!
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense,useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Play } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { StaggeredLoader } from "@/components/staggered-loader";
import { executeCode } from "@/assesment/src/services/execution.service";

type QuestionType = "mcq" | "open-ended" | "code";

interface Question {
  id: number;
  type: QuestionType;
  title: string;
  description: string;
  options?: string[];
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string }[];
}

const LANGUAGE_OPTIONS = [
  { id: 71, name: "Python (3.8.1)", value: "python" },
  { id: 63, name: "JavaScript (Node.js 12.14)", value: "javascript" },
  { id: 54, name: "C++ (GCC 9.2.0)", value: "cpp" },
  { id: 62, name: "Java (OpenJDK 13.0.1)", value: "java" },
  { id: 51, name: "C# (Mono 6.6.0)", value: "csharp" },
];

function AssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const track = searchParams.get("track") || "frontend";
  const level = searchParams.get("level") || "mid";

  // State Hooks
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [languageMap, setLanguageMap] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(60 * 60);
   const audioRef = useRef<HTMLAudioElement | null>(null);
  // const [isRunning, setIsRunning] = useState(false);
  // const [testResults, setTestResults] = useState<any[]>([]);
  // const [executionError, setExecutionError] = useState("");

    // Execution State
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<{passed: boolean, input: string, output: string, expected: string}[]>([])
  const [executionError, setExecutionError] = useState("")

  // Fetch Questions from Backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/assessment/generate?track=${track}&level=${level}`);
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        
        const data = await response.json();
        const assessment = data.assessment || {};

        const rawMcqs = assessment.mcqs || [];
        const rawOpen = assessment.openEnded || [];
        
        // Handle coding challenge (Wrap object in array if needed)
        const rawCode = Array.isArray(assessment.coding) 
          ? assessment.coding 
          : (assessment.coding ? [assessment.coding] : []);

        const formatted: Question[] = [
          ...rawMcqs.map((q: any, i: number) => ({
            id: i + 1,
            type: "mcq" as const,
            title: "Technical MCQ",
            description: q.question,
            options: q.options,
            answer: q.answer,
           explanation: q.explanation
          })),
          ...rawOpen.map((q: any, i: number) => ({
            id: rawMcqs.length + i + 1,
            type: "open-ended" as const,
            title: "Theoretical Question",
            description: q.question,
          })),
          ...rawCode.map((q: any, i: number) => ({
            id: rawMcqs.length + rawOpen.length + i + 1,
            type: "code" as const,
            title: q.title || "Coding Challenge",
            description: q.description,
            starterCode: q.functionTemplate || "",
            testCases: q.testCases || [],
          }))
        ];

        setQuestions(formatted);
      } catch (error) {
        console.error("Failed to load assessment", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [track, level]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => setTimeRemaining(p => (p <= 0 ? 0 : p - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Play sound after test results are updated
useEffect(() => {
  if (testResults.length === 0 || !audioRef.current) return;

  const allPassed = testResults.every(res => res.passed);
  
  audioRef.current.src = allPassed ? "/sounds/sucess.mp3" : "/sounds/fail.mp3";
  audioRef.current.play().catch(err => console.log("Audio play failed:", err));

}, [testResults]);

useEffect(() => {
  if (testResults.length === 0) return;

  const allPassed = testResults.every(res => res.passed);

  if (!allPassed && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]); // vibrate pattern for failure
  }
}, [testResults]);
  // Safety Guards for "Cannot read properties of undefined"
  // if (loading) return <div className="flex justify-center items-center min-h-screen">Initializing Assessment...</div>;
  if (loading) {
  return <StaggeredLoader />;
}
  if (questions.length === 0) return <div className="flex justify-center items-center min-h-screen">LLM Rate Exhsted , Try Tommorow if still you can change Api Key which provided in Readme File.</div>;
  
  const question = questions[currentQuestion];
  if (!question) return <div className="flex justify-center items-center min-h-screen">Loading question...</div>;

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Helper Functions
  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleRunCode = async () => {
    if (question.type !== 'code') return;
    setIsRunning(true);
    setExecutionError("");
    try {
      const code = answers[question.id] || question.starterCode || "";
      const langId = languageMap[question.id] || 71;
      const results = [];

      for (const tc of (question.testCases || [])) {
        const res = await executeCode(code, langId, tc.input);
        const actual = res.stdout ? atob(res.stdout).trim() : "";
        const expected = tc.expectedOutput.trim();
        results.push({ input: tc.input, output: actual, expected, passed: actual === expected });
      }
      setTestResults(results);
    } catch (err: any) {
      setExecutionError(err.message || "Execution Error");
    } finally {
      setIsRunning(false);
    }
  };


  // const handleSubmit = async () => {
  //   try {
  //     const mcqs = questions.filter(q => q.type === 'mcq');
  //     const openEnded = questions.filter(q => q.type === 'open-ended');
  //     const coding = questions.filter(q => q.type === 'code');

  //     localStorage.setItem("current_assessment", JSON.stringify({
  //       mcqs: mcqs.map(q => ({ question: q.description, options: q.options })),
  //       openEnded: openEnded.map(q => ({ question: q.description })),
  //       coding: coding.map(q => ({ title: q.title, description: q.description, testCases: q.testCases }))
  //     }));

  //     localStorage.setItem("last_assessment_answers", JSON.stringify({
  //       mcqs: mcqs.map(q => answers[q.id] || ""),
  //       openEnded: openEnded.map(q => answers[q.id] || ""),
  //       coding: coding.map(q => answers[q.id] || q.starterCode || "")
  //     }));

  //     router.push("/results");
  //   } catch (e) {
  //     alert("Error saving assessment.");
  //   }
  // };
const handleSubmit = async () => {
  try {
   
    const mcqs = questions.filter(q => q.type === 'mcq');
    const openEnded = questions.filter(q => q.type === 'open-ended');
    const coding = questions.filter(q => q.type === 'code');

   
    localStorage.setItem("current_assessment", JSON.stringify({
      mcqs: mcqs.map(q => ({ 
        question: q.description, 
        options: q.options,
        answer: (q as any).answer, 
        explanation: (q as any).explanation 

    
      })),
      openEnded: openEnded.map(q => ({ 
        question: q.description,
        modelAnswer: (q as any).modelAnswer 
      })),
      coding: coding.map(q => ({ 
        title: q.title, 
        description: q.description, 
        testCases: q.testCases,
        solution: (q as any).solution 
      }))
    }));

   
    const userAnswers = {
      mcqs: mcqs.map(q => answers[q.id] || ""),
      openEnded: openEnded.map(q => answers[q.id] || ""),
      coding: coding.map(q => answers[q.id] || q.starterCode || "")
    };

    localStorage.setItem("last_assessment_answers", JSON.stringify(userAnswers));

    console.log(" Submitting to results page...");
    router.push("/results");
  } catch (e) {
    console.error("Submission Error:", e);
    alert("Error saving assessment. Please try again.");
  }
};
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
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


      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <aside className="hidden md:block">
          <Card>
            <CardHeader><CardTitle className="text-sm">Questions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
              {questions.map((_, i) => (
                <Button 
                  key={i} 
                  size="sm"
                  variant={currentQuestion === i ? "default" : answers[questions[i].id] ? "outline" : "ghost"}
                  onClick={() => setCurrentQuestion(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section>
          <Card>
            <CardHeader>
              <Badge className="w-fit mb-2">{question.type.toUpperCase()}</Badge>
              <CardTitle>{question.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{question.description}</p>

              {question.type === "mcq" && (
                <RadioGroup value={answers[question.id]} onValueChange={handleAnswer} className="gap-3">
                  {question.options?.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                      <RadioGroupItem value={opt} id={`q-${i}`} />
                      <Label htmlFor={`q-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "open-ended" && (
                <Textarea 
                  placeholder="Type your explanation here..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="min-h-[250px] font-sans"
                />
              )}

              {question.type === "code" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <select 
                      className="bg-background border rounded px-2 py-1 text-sm"
                      onChange={(e) => setLanguageMap(prev => ({...prev, [question.id]: parseInt(e.target.value)}))}
                    >
                      {LANGUAGE_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <CodeEditor 
                    value={answers[question.id] || question.starterCode || ""}
                    onChange={handleAnswer}
                    language={languageMap[question.id] === 63 ? "javascript" : "python"}
                  />
                  <div className="flex justify-between items-center">
                    <Button onClick={handleRunCode} disabled={isRunning} variant="secondary">
                      {isRunning ? "Running..." : "Run Tests"}
                    </Button>
                  </div>
      {(executionError || testResults.length > 0) && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <Label className="text-muted-foreground">Test Results</Label>
                        {executionError && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm font-mono border border-red-500/50">{executionError}</div>}
                        <div className="space-y-2">
                            {testResults.map((res, idx) => (
                                <div key={idx} className={`text-sm font-mono rounded-lg p-3 border ${res.passed ? "bg-teal-500/10 border-teal-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                                    <div className="flex justify-between mb-2">
                                        <span>Test Case {idx + 1}</span>
                                        <Badge variant="outline" className={res.passed ? "text-teal-400 border-teal-500" : "text-red-400 border-red-500"}>{res.passed ? "Passed" : "Failed"}</Badge>
                                    </div>
                                    <div>Input: {res.input}</div>
                                    <div className="text-teal-400">Exp: {res.expected}</div>
                                    {!res.passed && <div className="text-red-400">Act: {res.output}</div>}
                                </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button variant="outline" onClick={() => setCurrentQuestion(q => q - 1)} disabled={currentQuestion === 0}>
                  <ChevronLeft className="mr-2 w-4 h-4" /> Previous
                </Button>
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={handleSubmit} className="ml-2 hover:ml-2 700 text-black  transition-all shadow-sm">Finish & Submit</Button>
                ) : (
                  <Button onClick={() => setCurrentQuestion(q => q + 1)}>
                    Next <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default function AssessmentPage() {
  return (
  <Suspense fallback={<StaggeredLoader />}>
      <AssessmentContent />
    </Suspense>
  );
}