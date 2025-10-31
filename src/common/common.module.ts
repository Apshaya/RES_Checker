import { Module } from '@nestjs/common';
import { NlpService } from './nlp/nlp.service';

@Module({
  providers: [NlpService]
})
export class CommonModule {}
