import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { PhotosModule } from './photos/photos.module';
import { UsersModule } from './users/users.module';
import { SearchModule } from './search/search.module';
import { DeliveryModule } from './delivery/delivery.module';
import { AiModule } from './ai/ai.module';
import { MinioModule } from './minio/minio.module';
import { MetricsModule } from './metrics/metrics.module';
import { RemovalRequestsModule } from './removal-requests/removal-requests.module';
import { SavedPhotosModule } from './saved-photos/saved-photos.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    MetricsModule,
    PrismaModule,
    EventsModule,
    PhotosModule,
    UsersModule,
    SearchModule,
    DeliveryModule,
    AiModule,
    MinioModule,
    RemovalRequestsModule,
    SavedPhotosModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
