import { Controller, Get, Query } from '@nestjs/common';
import {  AssessmentService } from './assesment.service';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}
  @Get('generate')
  async generate(@Query('track') track: string, @Query('level') level: string) {
    return this.assessmentService.createAssessment(track, level);
  }
}