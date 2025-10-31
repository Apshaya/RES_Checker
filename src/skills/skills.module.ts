// src/skills/skills.module.ts
import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { NlpService } from '../common/nlp/nlp.service';

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, NlpService],
  exports: [SkillsService]
})
export class SkillsModule {}