import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI("AIzaSyBcUFtK-8mYyC5_3NEDZYkBS_GBT61TT5g");
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  }

async generateContent(prompt: string) {
  try {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    if (error.status === 429) {
      console.warn("Quota exceeded, returning mock data...");
      return {
        mcqs: [{ question: "Sample: What is the primary use of Node.js?", options: ["Frontend", "Backend", "Styling", "Design"], answer: "Backend" }],
        openEnded: [{ question: "Describe a complex problem you solved.", hint: "Focus on the architecture." }],
        code: [{ title: "Fibonacci", problem: "Write a function for Fibonacci.", starterCode: "function fib(n) {}" }]
      };
    }
    throw error;
  }
}

  async generateMCQs(track: string, level: string, skills: string[]) {
    const prompt = `Generate 5 MCQs for ${level} ${track}. Skills: ${skills.join(',')}. 
    Return JSON array: [{"question": "text", "options": ["a","b","c","d"], "answer": "text"}]`;
    return this.generateContent(prompt);
  }

  async generateOpenEnded(track: string, level: string, skills: string[]) {
    const prompt = `Generate 3 open-ended questions for ${level} ${track}. Skills: ${skills.join(',')}. 
    Return JSON array: [{"question": "text", "hint": "text"}]`;
    return this.generateContent(prompt);
  }

  async generateCodeChallenges(track: string, level: string, skills: string[]) {
    const prompt = `Generate 2 code challenges for ${level} ${track}. Skills: ${skills.join(',')}. 
    Return JSON array: [{"title": "text", "problem": "text", "starterCode": "text"}]`;
    return this.generateContent(prompt);
  }

  async generateFullAssessment(track: string, level: string, skills: string[]) {
  const prompt = `
    Generate a full technical assessment for a ${level} ${track} developer.
    Skills to focus on: ${skills.join(', ')}.
    
    You MUST return ONLY a valid JSON object with this structure:
    {
      "mcqs": [{"question": "string", "options": ["a", "b", "c", "d"], "answer": "string"}],
      "openEnded": [{"question": "string", "hint": "string"}],
      "code": [{"title": "string", "problem": "string", "starterCode": "string"}]
    }
  `;
  // تأكد من استخدام موديل متاح مثل gemini-1.5-flash كبديل
  return this.generateContent(prompt);
}
}