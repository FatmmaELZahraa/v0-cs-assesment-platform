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


private evaluateMCQs(userAnswers: any[], referenceMcqs: any[]) {
  return referenceMcqs.map((q, index) => {
    const uAns = String(userAnswers[index] || "").trim().toLowerCase();
    const rAns = String(q.answer || "").trim().toLowerCase();

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























