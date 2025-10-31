// src/job-description/job-description.module.ts
import { Module } from '@nestjs/common';
import { JobDescriptionController } from './job-description.controller';
import { JobDescriptionService } from './job-description.service';
import { NlpService } from '../common/nlp/nlp.service';

@Module({
  controllers: [JobDescriptionController],
  providers: [JobDescriptionService, NlpService],
  exports: [JobDescriptionService]
})
export class JobDescriptionModule {}