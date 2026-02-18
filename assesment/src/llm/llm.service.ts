import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';


@Injectable()
export class LlmService {
  private genAI: GoogleGenerativeAI;
  private model: any;


  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || "AIzaSyAkKiKSGT_dt6atB96qsZDdLwC0GGdaTo0");

    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
   
  }





async generateContent(prompt: string): Promise<any> {
  try {
    // FIX: Pass the prompt string directly. 
    // The SDK handles converting this to the correct request structure automatically.
    const result = await this.model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();

    // Clean up potential Markdown code blocks (common with JSON responses)
    // e.g., ```json { ... } ``` -> { ... }
    const cleanText = text.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleanText);
    } catch (jsonError) {
      console.warn("Failed to parse JSON from AI, returning raw text.");
      return cleanText;
    }

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

//   // --- Generate full assessment ---
//   async generateFullAssessment(track: string, level: string, skills: string[]) {
//     const prompt = `
// You are a senior technical interviewer.

// Generate a 6-question professional technical assessment for a ${level} ${track} developer.

// Skills: ${skills.join(", ")}

// Requirements:
// 1. MCQs (3 questions) - 4 options each, include correct answer + explanation
// 2. Open-ended questions (2 questions) - include modelAnswer + keyPoints
// 3. Coding challenge (1 problem) - real-world, description, examples, constraints, JS function template, 5+ test cases including hidden edge cases

// Return ONLY valid JSON in this structure:

// {
//   "mcqs": [
//     { "question": "", "options": ["", "", "", ""], "answer": "", "explanation": "" }
//   ],
//   "openEnded": [
//     { "question": "", "modelAnswer": "", "keyPoints": [""] }
//   ],
//   "coding": {
//     "title": "",
//     "description": "",
//     "examples": [],
//     "constraints": [],
//     "functionTemplate": "",
//     "testCases": [
//       { "input": "", "expectedOutput": "" }
//     ]
//   }
// }

// Do not include markdown or any text outside JSON.
// `;
//     return this.generateContent(prompt);
//   }


// async evaluateCodingWithAI(userCode: string, challenge: any) {
//   const prompt = `
//     Analyze this code for the challenge: "${challenge.description}"
//     User Code: ${userCode}
//     Constraints: ${challenge.constraints.join(', ')}
    
//     Check for:
//     1. Time/Space Complexity.
//     2. Logic correctness.
//     3. Edge case handling.

//     Return JSON: { "score": 0-10, "feedback": "", "passed": boolean }
//   `;
//   return this.generateContent(prompt);
// }
//   // --- Evaluate open-ended answers ---
//   async evaluateOpenEnded(userAnswer: string, question: string, keyPoints: string[]) {
//     const prompt = `
// You are an expert technical evaluator.

// Question:
// ${question}

// Expected key points:
// ${keyPoints.join(", ")}

// User answer:
// "${userAnswer}"

// Evaluate based on:
// - Technical accuracy
// - Completeness
// - Clarity
// - Coverage of key points
// - Real-world understanding

// Return JSON:
// {
//   "score": 0-10,
//   "feedback": "",
//   "missingPoints": [],
//   "strengths": []
// }
// `;

//     return this.generateContent(prompt);
//   }

//   // --- Evaluate entire assessment ---
//   async evaluateFullAssessment(body: { originalAssessment: any; userAnswers: any }) {
//     try {
//       const { originalAssessment, userAnswers } = body;

//       // MCQs
//       const mcqResults = this.evaluateMCQs(userAnswers?.mcqs || [], originalAssessment?.mcqs || []);
//       const correctMcqCount = mcqResults.filter(r => r.isCorrect).length;
//       const mcqScore = (correctMcqCount / (originalAssessment.mcqs?.length || 1)) * 40;

//       // Open-ended
//       const openEndedResults = await Promise.all(
//         (originalAssessment.openEnded || []).map((q, i) =>
//           this.evaluateOpenEnded(userAnswers.openEnded?.[i] || "", q.question, q.keyPoints || [])
//         )
//       );
//       const totalOpenPoints = openEndedResults.reduce((acc, curr) => acc + Number(curr.score || 0), 0);
//       const openEndedScore = (totalOpenPoints / ((originalAssessment.openEnded?.length || 1) * 10)) * 30;

//       // Coding
//       const codingResults = await Promise.all(
//         (originalAssessment.coding || []).map((challenge, i) =>
//           this.evaluateCodingWithAI(userAnswers.coding?.[i] || "", challenge.testCases)
//         )
//       );
//       const codingScore = codingResults.reduce((acc, c) => acc + Number(c.score || 0), 0) / (codingResults.length || 1);

//       const totalScore = Math.round(mcqScore + openEndedScore + codingScore);
//       // const overallGrade = totalScore > 85 ? "A" : totalScore > 70 ? "B" : totalScore > 50 ? "C" : "D";

//       return {
//         totalScore,
//         overallGrade: totalScore >= 85 ? "A" : totalScore >= 70 ? "B" : totalScore >= 50 ? "C" : "F",
//     overallFeedback: openEndedResults[0]?.feedback || "Great overall performance!",
//         metadata: {
//           mcqScore: Math.round(mcqScore),
//           openEndedScore: Math.round(openEndedScore),
//           codingScore: Math.round(codingScore)
//         },
//         details: { mcqResults, openEndedResults, codingResults }
//       };
//     } catch (error) {
//       console.error("Evaluation Error:", error);
//       throw error;
//     }
//   }
// ------------------------
// Generate Full Assessment
// ------------------------
async generateFullAssessment(track: string, level: string, skills: string[]) {
  const prompt = `
You are a senior technical interviewer.

Generate a 6-question professional technical assessment for a ${level} ${track} developer.

Skills: ${skills.join(", ")}

Requirements:
1. MCQs (3 questions) - 4 options each, include correct answer + explanation
2. Open-ended questions (2 questions) - include modelAnswer + keyPoints
3. Coding challenge (1 problem) - real-world, description, examples, constraints, JS function template, 5+ test cases including hidden edge cases

Return ONLY valid JSON in this structure:

{
  "mcqs": [
    { "question": "", "options": ["", "", "", ""], "answer": "", "explanation": "" }
  ],
  "openEnded": [
    { "question": "", "modelAnswer": "", "keyPoints": [""] }
  ],
  "coding": {
    "title": "",
    "description": "",
    "examples": [],
    "constraints": [],
    "functionTemplate": "",
    "testCases": [
      { "input": "", "expectedOutput": "" }
    ]
  }
}

Do not include markdown or any text outside JSON.
`;

  const result = await this.generateContent(prompt);

  // Ensure coding is always an array
  if (result?.coding && !Array.isArray(result.coding)) {
    result.coding = [result.coding];
  }

  return result;
}

// ------------------------
// Coding Evaluation
// ------------------------
async evaluateCodingWithAI(userCode: string, challenge: any) {
  const prompt = `
Analyze this code for the challenge:

Title: ${challenge.title}
Description: ${challenge.description}
Constraints: ${(challenge.constraints || []).join(', ')}

User Code:
${userCode}

Check for:
1. Time/Space Complexity
2. Logic correctness
3. Edge case handling
4. Code quality

Return JSON:
{ "score": 0-10, "feedback": "", "passed": boolean }
`;

  return this.generateContent(prompt);
}

// ------------------------
// Open-ended Evaluation
// ------------------------
async evaluateOpenEnded(
  userAnswer: string,
  question: string,
  keyPoints: string[]
) {
  const prompt = `
You are an expert technical evaluator.

Question:
${question}

Expected key points:
${keyPoints.join(", ")}

User answer:
"${userAnswer}"

Evaluate based on:
- Technical accuracy
- Completeness
- Clarity
- Coverage of key points
- Real-world understanding

Return JSON:
{
  "score": 0-10,
  "feedback": "",
  "missingPoints": [],
  "strengths": []
}
`;

  return this.generateContent(prompt);
}


  // --- MCQ evaluation helper ---
private evaluateMCQs(userAnswers: any[], referenceMcqs: any[]) {
  return referenceMcqs.map((q, index) => {
    const uAns = String(userAnswers[index] || "").trim().toLowerCase();
    const rAns = String(q.answer || "").trim().toLowerCase();

    // مطابقة ذكية: إذا كان المستخدم أرسل الحرف (A) أو النص كاملاً
    const isCorrect = uAns === rAns || 
                      rAns.startsWith(uAns) || 
                      uAns.includes(rAns);

    return {
      question: q.question,
      userAnswer: userAnswers[index],
      correctAnswer: q.answer,
      isCorrect,
      explanation: q.explanation,
    };
  });
}
}















  // --- Evaluate coding answers ---
  // async evaluateCoding(userCode: string, testCases: any[]) {
  //   let passed = 0;

  //   for (const test of testCases) {
  //     try {
  //       const fullCode = `
  //         ${userCode}
  //         return solution(${test.input});
  //       `;
  //       const result = new Function(fullCode)();
  //       if (JSON.stringify(result) === JSON.stringify(test.expectedOutput)) {
  //         passed++;
  //       }
  //     } catch (e) {}
  //   }

  //   const score = (passed / testCases.length) * 100;

  //   return { passed, total: testCases.length, score };
  // }
// Inside LlmService























