import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';

@Module({
  providers: [LlmService],
  exports: [LlmService], // 👈 تأكد من وجود هذا السطر
})
export class LlmModule {}