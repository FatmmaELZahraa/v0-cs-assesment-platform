import { Injectable } from '@nestjs/common';
import { TracksService  } from '../skills/skills.service';
import { LlmService } from '../llm/llm.service'; // your LLM wrapper
import {  CODE_PROMPT } from './prompts/code';
import {  ESSAY_PROMPT } from './prompts/openended';
import {  MCQ_PROMPT } from './prompts/mcq';



@Injectable()
export class TechnicalService {
  constructor(
    private readonly skillsService: TracksService,
    private readonly llmService: LlmService,
  ) {}

  async generateQuestions(track: string, level: string, mcqCount = 5, language = 'JavaScript') {
    // 1️⃣ Get skills from MongoDB
    const skills = await this.skillsService.getSkillsByTrackAndLevel(track.toLowerCase(), level.toLowerCase());

    // 2️⃣ Build prompts
    const mcqPrompt = MCQ_PROMPT(track, level, skills, mcqCount);
    const essayPrompt = ESSAY_PROMPT(track, level, skills);
    const codePrompt = CODE_PROMPT(track, level, skills, language);

    // 3️⃣ Generate questions from LLM
    const [mcq, essay, code] = await Promise.all([
      this.llmService.generateMCQs(track, level, skills),
      this.llmService.generateOpenEnded(track, level, skills),
      this.llmService.generateCodeChallenges(track, level, skills),
    ]);

    return { mcq, essay, code };
  }
}
