// src/resume/resume.module.ts
import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { NlpService } from '../common/nlp/nlp.service';

@Module({
  controllers: [ResumeController],
  providers: [ResumeService, NlpService],
  exports: [ResumeService]
})
export class ResumeModule {}