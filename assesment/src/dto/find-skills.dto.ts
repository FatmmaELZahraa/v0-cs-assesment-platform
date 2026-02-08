import { IsString, IsNotEmpty } from 'class-validator';

export class FindSkillsDto {
    @IsString()
    @IsNotEmpty()
    track:string;
    @IsString()
    @IsNotEmpty()
    level:string
    
}