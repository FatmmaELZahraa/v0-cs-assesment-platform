import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { TracksService } from './skills.service';
import { FindSkillsDto } from 'src/dto/find-skills.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: TracksService) {}


  @Get()
  async getSkills(@Query() query: FindSkillsDto) {
    const { track, level } = query;

    try {
      const skills = await this.skillsService.getSkillsByTrackAndLevel(track.toLowerCase(), level.toLowerCase());
      return {
        track,
        level,
        skills,
      };
    } catch (err) {
      throw new NotFoundException(`No skills found for ${track} - ${level}`);
    }
  }
}
