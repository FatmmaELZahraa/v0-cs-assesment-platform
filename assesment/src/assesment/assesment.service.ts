import { Injectable, NotFoundException } from '@nestjs/common';
import { TracksService } from '../skills/skills.service';
import { LlmService } from '../llm/llm.service';
import axios from 'axios';
@Injectable()
export class AssessmentService {
  constructor(
    private readonly tracksService: TracksService,
    private readonly llmService: LlmService,
  ) {}

  // ------------------------
  // Create Assessment
  // ------------------------
  async createAssessment(track: string, level: string) {
    const skills =
      await this.tracksService.getSkillsByTrackAndLevel(track, level);

    if (!skills || skills.length === 0) {
      throw new NotFoundException('No skills found');
    }

    const result =
      await this.llmService.generateFullAssessment(track, level, skills);

    const codingArray = result.coding
      ? Array.isArray(result.coding)
        ? result.coding
        : [result.coding]
      : [];

    return {
      metadata: { track, level, skills },
      assessment: {
        mcqs: result.mcqs || [],
        openEnded: result.openEnded || [],
        coding: codingArray,
      },
    };
  }

  // ------------------------
  // Evaluate Full Assessment
  // ------------------------
 async evaluateFullAssessment(submissionData: {
  originalAssessment: any;
  userAnswers: { mcqs: any[]; openEnded: any[]; coding: any[] };
}) {
  const { originalAssessment, userAnswers } = submissionData;

  // 1. Evaluate MCQs
  const mcqResults = (originalAssessment.mcqs || []).map((q: any, index: number) => {
    const uAns = String(userAnswers.mcqs?.[index] || "").trim().toLowerCase();
    const rAns = String(q.answer || "").trim().toLowerCase();
    const isCorrect = uAns === rAns || (uAns.length === 1 && rAns.startsWith(uAns));
    return {
      question: q.question,
      userAnswer: userAnswers.mcqs?.[index] || '',
      correctAnswer: q.answer,
      isCorrect
     
     
    };
  });

  const correctMcqs = mcqResults.filter(r => r.isCorrect).length;
  const mcqScore = (correctMcqs / (mcqResults.length || 1)) * 40;

  // 2. Convert coding to array safely
const codingQuestions = Array.isArray(originalAssessment.coding)
  ? originalAssessment.coding
  : originalAssessment.coding
  ? [originalAssessment.coding]
  : [];


  // 3. Build prompt or call AI for coding & open-ended evaluation
  // Example: call llmService.generateContent() for coding and open-ended

const aiEvaluation = await this.llmService.generateContent(`
Evaluate these technical responses for a ${originalAssessment.metadata?.track || 'developer'}:

Open-Ended Questions:
${(originalAssessment.openEnded || []).map((q, i) => 
  `Q: ${q.question}\nUser: ${userAnswers.openEnded?.[i] || 'N/A'}\nModel: ${q.modelAnswer}`
).join('\n')}

Coding Tasks:
${codingQuestions.map((q, i) => 
  `Task: ${q.title}\nUser Code: ${userAnswers.coding?.[i] || 'N/A'}`
).join('\n')}

Return ONLY JSON:
{ 
  "openEndedScores": [{ "score": 0-10, "feedback": "" }], 
  "codingScores": [{ "score": 0-10, "feedback": "" }], 
  "overallFeedback": "" 
}
`);

  // 4. Compute open-ended & coding scores
  const openTotalPoints = (aiEvaluation?.openEndedScores || []).reduce((acc, q) => acc + (q.score || 0), 0);
  const openEndedScore = (openTotalPoints / ((originalAssessment.openEnded?.length || 1) * 10)) * 30;

  const codingTotalPoints = (aiEvaluation?.codingScores || []).reduce((acc, q) => acc + (q.score || 0), 0);
  const codingScore = (codingTotalPoints / ((codingQuestions.length || 1) * 10)) * 30;

  const totalScore = Math.round(mcqScore + openEndedScore + codingScore);

  return {
    totalScore,
    overallGrade: totalScore >= 85 ? "A" : totalScore >= 70 ? "B" : totalScore >= 50 ? "C" : "F",
    metadata: {
      mcqScore: Math.round(mcqScore),
      openEndedScore: Math.round(openEndedScore),
      codingScore: Math.round(codingScore),
      correctMcqs,
      totalMcqs: mcqResults.length,
    },
    details: {
      mcqResults,
      openEndedResults: aiEvaluation?.openEndedScores || [],
      codingResults: aiEvaluation?.codingScores || [],
      overallFeedback: aiEvaluation?.overallFeedback || "Evaluation completed."
    },
  };
}

}
