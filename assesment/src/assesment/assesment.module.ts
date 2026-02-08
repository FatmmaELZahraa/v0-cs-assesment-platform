import { Module } from '@nestjs/common';
import { AssessmentService } from './assesment.service';
import { AssessmentController } from './assesment.controller';
import { SkillsModule } from '../skills/skills.module'; // 👈 استيراد مديول المهارات
import { LlmModule } from '../llm/llm.module';       // 👈 استيراد مديول الـ LLM

@Module({
  imports: [
    SkillsModule, // يوفر TracksService
    LlmModule     // يوفر LlmService
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}