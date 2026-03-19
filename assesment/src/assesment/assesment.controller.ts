
import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AssessmentService } from './assesment.service';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get('generate')
  async generate(@Query('track') track: string, @Query('level') level: string) {
    return this.assessmentService.createAssessment(track, level);
  }


@Post('submit')
async submit(@Body() body: any) {
  console.log(' Request received at /assessment/submit');
  console.log('Original Assessment:', body.originalAssessment);
  console.log('User Answers:', body.userAnswers);

  const evaluation = await this.assessmentService.evaluateFullAssessment(body);

  console.log('📝 Evaluation Results:');
  console.log({
    mcqScore: `${evaluation.metadata.correctMcqs}/${evaluation.metadata.totalMcqs}`,
    totalScore: evaluation.totalScore,
    overallGrade: evaluation.overallGrade, 
    mcqResults: evaluation.details.mcqResults,
  });

  return evaluation;
}

}
