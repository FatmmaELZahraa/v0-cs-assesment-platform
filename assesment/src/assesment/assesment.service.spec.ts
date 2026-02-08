import { Injectable, NotFoundException } from '@nestjs/common';
import { TracksService } from '../skills/skills.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly tracksService: TracksService,
    private readonly llmService: LlmService,
  ) {}

  async createAssessment(track: string, level: string) {
    // 1. جلب المهارات من MongoDB
    const skills = await this.tracksService.getSkillsByTrackAndLevel(track, level);
    
    if (!skills || skills.length === 0) {
      throw new NotFoundException('No skills found for this track and level');
    }

    // 2. تشغيل الـ 3 نماذج بالتوازي لسرعة التنفيذ
    const [mcqs, openEnded, coding] = await Promise.all([
      this.llmService.generateMCQs(track, level, skills),
      this.llmService.generateOpenEnded(track, level, skills),
      this.llmService.generateCodeChallenges(track, level, skills),
    ]);

    return {
      metadata: { track, level, skills },
      assessment: { mcqs, openEnded, coding }
    };
  }
}