// src/app.module.ts
import { Module } from '@nestjs/common';
import { ResumeModule } from './resume/resume.module';
import { JobDescriptionModule } from './job-description/job-description.module';
import { SkillsModule } from './skills/skills.module';
import { NlpService } from './common/nlp/nlp.service';

@Module({
  imports: [ResumeModule, JobDescriptionModule, SkillsModule],
  providers: [NlpService],
  exports: [NlpService]
})
export class AppModule {}