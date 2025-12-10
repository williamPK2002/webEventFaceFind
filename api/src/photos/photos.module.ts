import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { MinioModule } from '../minio/minio.module';
import { AiModule } from '../ai/ai.module';
import { SearchModule } from '../search/search.module';
import { PrismaModule } from '../prisma/prisma.module';

import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MinioModule, AiModule, SearchModule, PrismaModule, MetricsModule],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule { }
