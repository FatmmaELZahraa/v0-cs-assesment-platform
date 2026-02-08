import { Injectable } from '@nestjs/common';

@Injectable()
export class LlmService {
  // دالة عامة لإرسال الطلب لـ LLM
  private async callModel(prompt: string): Promise<any> {
    // هنا تضع كود الاتصال بـ OpenAI API أو LangChain
    console.log(`Calling LLM with prompt: ${prompt.substring(0, 50)}...`);
    return { result: "Generated content from LLM" }; 
  }

  async generateMCQs(track: string, level: string, skills: string[]) {
    const prompt = `Generate 5 MCQs for ${level} ${track} focusing on: ${skills.join(', ')}. Return JSON.`;
    return this.callModel(prompt);
  }

  async generateOpenEnded(track: string, level: string, skills: string[]) {
    const prompt = `Generate 3 open-ended questions for ${level} ${track} on: ${skills.join(', ')}.`;
    return this.callModel(prompt);
  }

  async generateCodeChallenges(track: string, level: string, skills: string[]) {
    const prompt = `Generate 2 coding challenges for ${level} ${track} including: ${skills.join(', ')}.`;
    return this.callModel(prompt);
  }
}