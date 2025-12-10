import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AiModule } from '../ai/ai.module';

import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [AiModule, MetricsModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule { }
