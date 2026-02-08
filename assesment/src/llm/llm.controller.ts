import { Controller } from '@nestjs/common';
import { LlmService } from './llm.service';
import { Get } from '@nestjs/common';

@Controller('llm')
export class LlmController {
@Get("/mcq")
    getQuestion() {
        return "LLM Controller is working";
    }
@Get("/essay")   
    getEssay() {
        return "LLM Controller is working for essay";
    } 

@Get("/code")   
    getCode() {
        return "LLM Controller is working for code";
    }    
    
}
