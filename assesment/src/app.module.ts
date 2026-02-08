import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmModule } from './llm/llm.module';
import { TechnicalService } from './technical/technical.service';
import { TechnicalController } from './technical/technical.controller';
import { TechnicalModule } from './technical/technical.module';
import { ConfigModule } from '@nestjs/config';
import { AssessmentController } from './assesment/assesment.controller';
import { AssessmentModule } from './assesment/assesment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb+srv://OSC:1234@cluster0.c1pj1qj.mongodb.net/assesment'),
    LlmModule,
    TechnicalModule,
    AssessmentModule,
  ],
 controllers: [AppController], // ابقِ فقط على AppController الرئيسي هنا
  providers: [AppService],
})
export class AppModule {}


