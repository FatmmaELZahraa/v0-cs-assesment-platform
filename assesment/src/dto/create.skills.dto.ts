import { IsString,IsArray } from "class-validator";
import { Skill } from "src/skills/schema/skill.schema";
export class CreateSkillsDto {  
    @IsString()
    track:string;  
    @IsString()
    level:string
    @IsArray()
    skill:string[];
}