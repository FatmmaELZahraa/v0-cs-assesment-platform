"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Brain, Code, RotateCcw, Download } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);
        const originalAssessment = JSON.parse(localStorage.getItem("current_assessment") || "{}");
        const userAnswers = JSON.parse(localStorage.getItem("last_assessment_answers") || "{}");

        if (!originalAssessment.mcqs || !userAnswers.mcqs) {
          throw new Error("No assessment data found. Please retake the test.");
        }

        const response = await fetch("http://localhost:5000/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ originalAssessment, userAnswers }),
        });

        if (!response.ok) throw new Error("Failed to evaluate assessment");

        const result = await response.json();
        setEvaluation(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Brain className="h-12 w-12 animate-pulse text-teal-500" />
      <p className="text-lg font-medium">AI is evaluating your performance...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <XCircle className="h-12 w-12 text-red-500" />
      <p className="text-red-400 max-w-md">{error}</p>
      <Link href="/"><Button variant="outline">Back to Home</Button></Link>
    </div>
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Assessment Results</h1>
        <div className="flex justify-center items-center gap-8">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Score</p>
            <p className="text-6xl font-black text-teal-500">{evaluation?.totalScore ?? 0}%</p>
          </div>
          <div className="h-16 w-[1px] bg-border/50" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Grade</p>
            <p className="text-6xl font-black text-purple-500">{evaluation?.overallGrade || evaluation?.aiEvaluation?.overallGrade || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
            title="MCQs" 
            score={evaluation?.metadata?.mcqScore ?? 0} 
            icon={<CheckCircle2 className="text-blue-400" />} 
        />
        <StatCard 
            title="Theory" 
            score={evaluation?.metadata?.openEndedScore ?? 0} 
            icon={<Brain className="text-purple-400" />} 
        />
        <StatCard 
            title="Coding" 
            score={evaluation?.metadata?.codingScore ?? 0} 
            icon={<Code className="text-teal-400" />} 
        />
      </div>

      {/* AI Feedback */}
      <Card className="border-teal-500/20 bg-teal-500/5 overflow-hidden">
        <CardHeader className="bg-teal-500/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-teal-500" />
            AI Detailed Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-foreground leading-relaxed italic">
            "{evaluation?.details?.overallFeedback || evaluation?.aiEvaluation?.overallFeedback}"
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Link href="/">
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <RotateCcw className="h-4 w-4" /> Retake Test
          </Button>
        </Link>
        {/* <Button className="bg-teal-500 hover:bg-teal-600 text-black w-full sm:w-auto gap-2">
          <Download className="h-4 w-4" /> Download PDF Report
        </Button> */}
      </div>
    </main>
  );
}

function StatCard({ title, score, icon }: { title: string, score: number, icon: React.ReactNode }) {
  return (
    <Card className="hover:border-teal-500/30 transition-colors">
      <CardContent className="pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <span className="font-semibold">{title}</span>
        </div>
        <span className="text-2xl font-bold">{score}%</span>
      </CardContent>
    </Card>
  );
}