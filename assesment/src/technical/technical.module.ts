import { Module } from '@nestjs/common';
import { TechnicalService } from './technical.service';
import { TechnicalController } from './technical.controller';
import { SkillsModule } from '../skills/skills.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [SkillsModule, LlmModule],
  providers: [TechnicalService],
  controllers: [TechnicalController],
})
export class TechnicalModule {}
