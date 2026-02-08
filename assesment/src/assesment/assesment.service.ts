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
  const skills = await this.tracksService.getSkillsByTrackAndLevel(track, level);
  
  if (!skills || skills.length === 0) {
    throw new NotFoundException('No skills found');
  }

  const result = await this.llmService.generateFullAssessment(track, level, skills);

  return {
    metadata: { track, level, skills },
    assessment: {
      mcqs: result.mcqs,
      openEnded: result.openEnded,
      coding: result.code
    }
  };
}
}