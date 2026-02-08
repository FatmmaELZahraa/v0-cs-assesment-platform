import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type SkillDocument = Skill & Document;
@Schema({ timestamps: true })
export class Skill {
  @Prop({ required: true, lowercase: true, index: true })
  track: string;   // frontend, backend, ai

  @Prop({ required: true, lowercase: true, index: true })
  level: string;   // junior, mid, senior

  @Prop({ type: [String], required: true })
  skills: string[];
}
export const SkillSchema = SchemaFactory.createForClass(Skill);


SkillSchema.index({ track: 1, level: 1 }, { unique: true });