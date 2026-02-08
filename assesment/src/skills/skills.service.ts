import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill } from './schema/skill.schema';

@Injectable()
export class TracksService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<Skill>) {}

 async getSkillsByTrackAndLevel(track: string, level: string): Promise<string[]> {
  try {
    const data = await this.skillModel.findOne({ track, level }).exec();
    return data ? data.skills : [];
  } catch (error) {
    console.error("خطأ في الاتصال بقاعدة البيانات:", error.message);
    return ["Programming Fundamentals", "Data Structures", "Web Basics"]; 
  }
}
}