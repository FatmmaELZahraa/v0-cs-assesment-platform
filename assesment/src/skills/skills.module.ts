import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TracksService } from './skills.service';
import { Skill, SkillSchema } from './schema/skill.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }])],
  providers: [TracksService],
  exports: [TracksService], // 🔥 Export so Technical module can use it
})
export class SkillsModule {}
